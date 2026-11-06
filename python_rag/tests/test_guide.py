"""Exercise the Streamlit form without loading MiniLM or contacting Groq."""

import unittest
from unittest.mock import Mock, patch

from streamlit.testing.v1 import AppTest

from python_rag.retrieval import ROOT, corpus_snapshot


class GuideTests(unittest.TestCase):
    def setUp(self):
        records, _ = corpus_snapshot()
        self.records = records
        record = next(r for r in records if r["id"] == "ejagriti-case-search")
        self.summary = record["summary"]
        self.quote = record["passages"][0]["text"]
        self.search = self.enterContext(patch("python_rag.answer.search", return_value=[(record, 0.5)]))
        self.enterContext(patch("python_rag.retrieval.load_model", return_value=object()))
        self.enterContext(patch("python_rag.retrieval.build_index", return_value=(object(), records)))
        self.enterContext(patch.dict("os.environ", {"GROQ_API_KEY": "test-only"}))
        self.provider = self.enterContext(patch("python_rag.answer.groq_select", new=Mock()))
        self.app = AppTest.from_file(str(ROOT / "python_rag/guide_app.py"), default_timeout=20).run()

    def ask(self, question):
        self.app.chat_input[0].set_value(question).run()
        self.assertFalse(self.app.exception)

    def test_supported_lookup_shows_summary_and_keeps_wording_in_sources(self):
        self.provider.return_value = {"Q1": [{"source": "S1", "text": self.quote}]}
        self.ask("Where can I search for a Commission order?")
        self.assertEqual([heading.value for heading in self.app.subheader], ["Short answer", "Sources"])
        self.assertEqual(self.app.chat_message[1].markdown[0].value, self.summary)
        self.assertEqual(self.app.expander[0].text[0].value, self.quote)
        self.assertTrue(any("Read the official wording" in link.value for link in self.app.markdown))
        self.assertEqual([exp.label for exp in self.app.expander][-2:], ["Sources and coverage", "Privacy"])

    def test_rights_lookup_lists_six_rights_before_one_citation(self):
        rights = next(record for record in self.records if record["id"] == "consumer-rights")
        self.search.return_value = [(rights, None)]
        self.provider.return_value = {
            "Q1": [{"source": "S1", "text": p["text"]} for p in rights["passages"]]
        }
        self.ask("What consumer rights are listed in Section 2(9)?")
        body = [element.value for element in self.app.chat_message[1].markdown]
        self.assertEqual(body[0], "You have six main rights as a consumer:")
        self.assertEqual(len(body[1].splitlines()), 6)
        links = [value for value in body if "Read the official wording" in value]
        self.assertEqual(len(links), 1)
        self.assertIn("PDF pages 3, 4", links[0])

    def test_seller_warranty_summary_states_why_it_matters(self):
        seller = next(record for record in self.records if record["id"] == "product-seller-liability")
        self.search.return_value = [(seller, None)]
        self.provider.return_value = {"Q1": [{"source": "S1", "text": seller["passages"][0]["text"]}]}
        self.ask("Can the seller's own warranty matter under Section 86?")
        body = self.app.chat_message[1].markdown[0].value
        self.assertIn("express warranty independent of the manufacturer's", body)
        self.assertIn("failure to meet that warranty caused harm", body)

    def test_complaint_response_does_not_confuse_sending_and_reply_deadlines(self):
        procedure = next(record for record in self.records if record["id"] == "complaint-procedure")
        self.search.return_value = [(procedure, None)]
        self.provider.return_value = {"Q1": [{"source": "S1", "text": procedure["passages"][0]["text"]}]}
        self.ask("How long does the opposite party have to respond under Section 38?")
        body = self.app.chat_message[1].markdown[0].value
        self.assertIn("sends it to the other party within 21 days", body)
        self.assertIn("30 days to respond, with up to 15 extra days", body)

    def test_question_and_answer_survive_reruns_without_another_provider_call(self):
        self.provider.return_value = {"Q1": [{"source": "S1", "text": self.quote}]}
        question = "Where can I search for a Commission order?"
        self.ask(question)
        self.app.run()
        self.assertFalse(self.app.exception)
        self.assertEqual(self.app.chat_message[0].text[0].value, question)
        self.assertEqual(self.app.chat_message[1].markdown[0].value, self.summary)
        self.provider.assert_called_once()
        self.ask("How do I contact RBI?")
        self.assertEqual(self.app.chat_message[0].text[0].value, "How do I contact RBI?")
        self.assertFalse(self.app.subheader)

    def test_mixed_requests_show_supported_answer_and_name_the_unresolved_part(self):
        for suffix, limit in (
            ("can you tell me the result of my own pending case?", "specific case outcome"),
            ("how do I contact RBI?", "outside the indexed"),
        ):
            with self.subTest(suffix=suffix):
                self.provider.reset_mock()
                self.provider.return_value = {"Q1": [{"source": "S1", "text": self.quote}]}
                self.ask(f"Where can I search for a Commission order, and {suffix}")
                self.assertIn("Limited source coverage", self.app.warning[0].value)
                self.assertEqual([h.value for h in self.app.subheader], ["Short answer", "Sources"])
                self.assertEqual(self.app.chat_message[1].markdown[0].value, self.summary)
                self.assertIn(suffix.rstrip("?"), [text.value for text in self.app.chat_message[1].text])
                self.assertTrue(any(limit in caption.value for caption in self.app.chat_message[1].caption))
                self.provider.assert_called_once()
                self.assertEqual(list(self.provider.call_args.args[0]), ["Q1"])
        self.assertEqual(self.search.call_count, 2)

    def test_mixed_request_provider_failure_shows_candidate_sources_not_an_answer(self):
        self.provider.side_effect = TimeoutError
        self.ask("Where can I search for a Commission order, and how do I contact RBI?")
        self.assertEqual([h.value for h in self.app.subheader], ["Candidate sources"])
        self.assertTrue(any("outside the indexed" in c.value for c in self.app.chat_message[1].caption))
        self.assertTrue(any("could not connect" in c.value for c in self.app.chat_message[1].caption))

    def test_unsupported_request_has_no_sources_or_provider_call(self):
        self.ask("How do I contact RBI?")
        self.assertIn("No verified answer", self.app.warning[0].value)
        self.assertFalse(self.app.subheader)
        self.provider.assert_not_called()

    def test_timeout_and_invalid_quote_render_fallback(self):
        self.provider.side_effect = TimeoutError
        self.ask("Where can I search for a Commission order?")
        self.assertIn("Candidate excerpts only", self.app.info[0].value)
        self.provider.side_effect = None
        self.provider.return_value = {"Q1": [{"source": "S1", "text": "Invented excerpt."}]}
        self.ask("Where can I search for a Commission order?")
        self.assertIn("Candidate excerpts only", self.app.info[0].value)
        self.assertFalse(any("Invented excerpt" in text.value for text in self.app.text))
