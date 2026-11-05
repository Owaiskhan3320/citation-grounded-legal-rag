"""Exercise the Streamlit form without loading MiniLM or contacting Groq."""

import unittest
from unittest.mock import Mock, patch

from streamlit.testing.v1 import AppTest

from python_rag.retrieval import ROOT, corpus_snapshot


class GuideTests(unittest.TestCase):
    def setUp(self):
        records, _ = corpus_snapshot()
        record = next(r for r in records if r["id"] == "ejagriti-case-search")
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

    def test_supported_lookup_shows_quote_and_source_link(self):
        self.provider.return_value = [{"source": "S1", "text": self.quote}]
        self.ask("Where can I search for a Commission order?")
        self.assertIn("Selected source quotes", [heading.value for heading in self.app.subheader])
        self.assertTrue(any(text.value == self.quote for text in self.app.text))
        self.assertTrue(any("Read the official wording" in link.value for link in self.app.markdown))
        self.assertEqual([exp.label for exp in self.app.expander][-2:], ["Sources and coverage", "Privacy"])

    def test_mixed_requests_show_limits_without_calling_provider(self):
        for suffix in ("what did my neighbour win?", "can you tell me what the commission awarded in my neighbour's case?",
                       "how do I contact RBI?"):
            with self.subTest(suffix=suffix):
                self.ask(f"Where can I search for a Commission order, and {suffix}")
                self.assertIn("Limited source coverage", self.app.warning[0].value)
                self.assertTrue(any(exp.label.startswith("[S1]") for exp in self.app.expander))
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
