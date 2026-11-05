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
        self.provider.return_value = [{"source": "S1", "text": self.quote}]
        self.ask("Where can I search for a Commission order?")
        self.assertEqual([heading.value for heading in self.app.subheader], ["Short answer", "Sources"])
        self.assertEqual(self.app.chat_message[1].markdown[0].value, self.summary)
        self.assertEqual(self.app.expander[0].text[0].value, self.quote)
        self.assertTrue(any("Read the official wording" in link.value for link in self.app.markdown))
        self.assertEqual([exp.label for exp in self.app.expander][-2:], ["Sources and coverage", "Privacy"])

    def test_rights_lookup_lists_six_rights_before_one_citation(self):
        rights = next(record for record in self.records if record["id"] == "consumer-rights")
        self.search.return_value = [(rights, None)]
        self.provider.return_value = [{"source": "S1", "text": p["text"]} for p in rights["passages"]]
        self.ask("What consumer rights are listed in Section 2(9)?")
        body = [element.value for element in self.app.chat_message[1].markdown]
        self.assertEqual(body[0], "You have six main rights as a consumer:")
        self.assertEqual(len(body[1].splitlines()), 6)
        links = [value for value in body if "Read the official wording" in value]
        self.assertEqual(len(links), 1)
        self.assertIn("PDF pages 3, 4", links[0])

    def test_question_and_answer_survive_reruns_without_another_provider_call(self):
        self.provider.return_value = [{"source": "S1", "text": self.quote}]
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

    def test_mixed_requests_show_limits_without_calling_provider(self):
        for suffix in ("what did my neighbour win?", "can you tell me what the commission awarded in my neighbour's case?",
                       "how do I contact RBI?"):
            with self.subTest(suffix=suffix):
                self.ask(f"Where can I search for a Commission order, and {suffix}")
                self.assertIn("Limited source coverage", self.app.warning[0].value)
                self.assertTrue(any(exp.label.startswith("Source excerpts:") for exp in self.app.expander))
                self.assertNotIn("Short answer", [heading.value for heading in self.app.subheader])
                self.provider.assert_not_called()
        self.assertEqual(self.search.call_count, 3)

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
        self.provider.return_value = [{"source": "S1", "text": "Invented excerpt."}]
        self.ask("Where can I search for a Commission order?")
        self.assertIn("Candidate excerpts only", self.app.info[0].value)
        self.assertFalse(any("Invented excerpt" in text.value for text in self.app.text))
