import unittest
from unittest.mock import Mock, patch

from python_rag.answer import answer, redact


class AnswerTests(unittest.TestCase):
    def setUp(self):
        record = {"id": "consent", "title": "Consent", "section": "Rule 4(9)",
                  "passages": [{"text": "Consent must be explicit."}]}
        self.search = self.enterContext(patch("python_rag.answer.search", return_value=[(record, 0.5)]))

    def ask(self, question, selector):
        return answer(question, None, None, [], "2026-11-03", select=selector)

    def test_mixed_request_does_not_call_provider(self):
        provider = Mock()
        result = self.ask("What is checkout consent, and how do I contact RBI?", provider)
        self.assertEqual(result["mode"], "partial")
        provider.assert_not_called()

    def test_provider_receives_redacted_question_and_returns_exact_quote(self):
        provider = Mock(return_value=[{"source": "S1", "text": "Consent must be explicit."}])
        self.assertEqual(self.ask("Explain consent for me@example.org", provider)["mode"], "grounded_quotes")
        self.assertNotIn("me@example.org", provider.call_args.args[0])
        self.assertEqual(redact("Call +91 98765 43210"), "Call [redacted]")

    def test_invalid_or_failed_provider_falls_back(self):
        for quote in ({"source": "S9", "text": "Consent must be explicit."},
                      {"source": "S1", "text": "Made up text."}):
            self.assertEqual(self.ask("Explain consent", Mock(return_value=[quote]))["mode"], "excerpts")
        self.assertEqual(self.ask("Explain consent", Mock(side_effect=TimeoutError))["mode"], "excerpts")

    def test_weak_match_never_calls_provider(self):
        self.search.return_value = [(self.search.return_value[0][0], 0.1)]
        provider = Mock()
        self.assertEqual(self.ask("Explain consent", provider)["mode"], "not_verified")
        provider.assert_not_called()
