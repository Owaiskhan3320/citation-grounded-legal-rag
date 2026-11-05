import json
import unittest
from unittest.mock import Mock, patch

import httpx
from groq import Groq

from python_rag.answer import answer, groq_select, redact


class AnswerTests(unittest.TestCase):
    def setUp(self):
        self.consent = {"id": "consent", "title": "Consent", "section": "Rule 4(9)",
                        "passages": [{"text": "Consent must be explicit."}]}
        self.consent_quote = {"source": "S1", "text": "Consent must be explicit."}
        self.search = self.enterContext(patch(
            "python_rag.answer.search", return_value=[(self.consent, 0.5)]
        ))

    def ask(self, question, selector):
        return answer(question, None, None, [], "2026-11-03", select=selector)

    def test_mixed_request_selects_only_for_supported_part(self):
        for suffix in ("how do I contact RBI?", "can you tell me the result of my pending case?"):
            with self.subTest(suffix=suffix):
                self.search.reset_mock()
                provider = Mock(return_value={"Q1": [self.consent_quote]})
                result = self.ask(f"What is checkout consent, and {suffix}", provider)
                self.assertEqual(result["mode"], "partial")
                self.assertEqual(result["parts"]["Q1"]["quotes"], [self.consent_quote])
                self.assertTrue(result["parts"]["Q2"]["limit"])
                self.assertFalse(result["parts"]["Q2"]["source_ids"])
                provider.assert_called_once()
                self.assertEqual(list(provider.call_args.args[0]), ["Q1"])
                self.search.assert_called_once()

    def test_multiple_supported_parts_get_their_own_candidates_in_one_request(self):
        first_hits = [
            (self.consent, 0.5),
            ({**self.consent, "id": "return"}, 0.4),
            ({**self.consent, "id": "refund"}, 0.4),
        ]
        appeal = {**self.consent, "id": "appeal", "passages": [{"text": "Appeal to the State Commission."}]}
        self.search.side_effect = [first_hits, [(appeal, None)]]
        appeal_quote = {"source": "S4", "text": "Appeal to the State Commission."}
        provider = Mock(return_value={"Q1": [self.consent_quote], "Q2": [appeal_quote]})
        result = self.ask("What is checkout consent, and where do I appeal?", provider)
        self.assertEqual(result["mode"], "grounded_quotes")
        self.assertEqual(result["parts"]["Q2"]["quotes"], [appeal_quote])
        self.assertEqual(result["parts"]["Q2"]["source_ids"], ["S4"])
        provider.assert_called_once()

    def test_bad_or_missing_selection_does_not_erase_another_part(self):
        for selection in ({}, {"Q2": [self.consent_quote]}, {"Q2": []}):
            with self.subTest(selection=selection):
                appeal = {**self.consent, "id": "appeal", "passages": [{"text": "Appeal here."}]}
                self.search.side_effect = [[(self.consent, 0.5)], [(appeal, None)]]
                result = self.ask("What is consent, and where do I appeal?",
                                  Mock(return_value={"Q1": [self.consent_quote], **selection}))
                self.assertEqual(result["mode"], "partial")
                self.assertEqual(result["quotes"], [self.consent_quote])
                self.assertTrue(result["parts"]["Q2"]["limit"])

    def test_dependent_what_if_clause_stays_with_its_subject(self):
        provider = Mock(return_value={"Q1": [self.consent_quote]})
        self.ask("When must the platform respond, and what if it does not?", provider)
        self.search.assert_called_once()
        self.assertIn("what if it does not", self.search.call_args.args[0])

    def test_long_list_of_questions_does_not_retrieve_or_call_provider(self):
        provider = Mock()
        result = self.ask("One? Two? Three? Four? Five?", provider)
        self.assertEqual(result["mode"], "not_verified")
        self.assertIn("fewer questions", result["limits"][0])
        self.search.assert_not_called()
        provider.assert_not_called()

    def test_provider_receives_redacted_question_and_returns_exact_quote(self):
        provider = Mock(return_value={"Q1": [self.consent_quote]})
        self.assertEqual(self.ask("Explain consent for me@example.org", provider)["mode"], "grounded_quotes")
        self.assertNotIn("me@example.org", provider.call_args.args[0]["Q1"]["question"])
        self.assertEqual(redact("Call +91 98765 43210"), "Call [redacted]")

    def test_invalid_or_failed_provider_falls_back(self):
        for quote in ({"source": "S9", "text": "Consent must be explicit."},
                      {"source": "S1", "text": "Made up text."}):
            self.assertEqual(self.ask("Explain consent", Mock(return_value={"Q1": [quote]}))["mode"], "excerpts")
        self.assertEqual(self.ask("Explain consent", Mock(side_effect=TimeoutError))["mode"], "excerpts")

    def test_weak_match_never_calls_provider(self):
        self.search.return_value = [(self.search.return_value[0][0], 0.1)]
        provider = Mock()
        self.assertEqual(self.ask("Explain consent", provider)["mode"], "not_verified")
        provider.assert_not_called()

    def test_sdk_requests_completion_and_classifies_plain_text_denial(self):
        def deny(request):
            self.assertEqual(request.url.path, "/openai/v1/chat/completions")
            self.assertEqual(request.headers["authorization"], "Bearer test-only")
            self.assertNotIn(b"me@example.org", request.content)
            return httpx.Response(403, text="error code: 1010")

        client = Groq(api_key="test-only", max_retries=0,
                      http_client=httpx.Client(transport=httpx.MockTransport(deny)))
        with patch("python_rag.answer.Groq", return_value=client):
            result = self.ask("Explain consent for me@example.org",
                              lambda q, s: groq_select(q, s, api_key="test-only"))
        self.assertEqual(result["mode"], "excerpts")
        self.assertIn("1010", result["diagnostic"])

    def test_sdk_selects_passage_ids_and_returns_original_text(self):
        for ids, expected in [(["S1-P1"], "grounded_quotes"), (["S9-P1"], "excerpts")]:
            with self.subTest(ids=ids):
                def complete(request):
                    payload = json.loads(request.content)
                    data = json.loads(payload["messages"][-1]["content"])
                    self.assertEqual(data["passages"]["S1-P1"]["text"], "Consent must be explicit.")
                    self.assertEqual(data["questions"]["Q1"]["allowed_passage_ids"], ["S1-P1"])
                    self.assertNotIn("Q2", data["questions"])
                    return httpx.Response(200, json={"choices": [{
                        "finish_reason": "stop",
                        "message": {"role": "assistant", "content": json.dumps({"Q1": ids})},
                    }]})

                client = Groq(api_key="test-only", max_retries=0,
                              http_client=httpx.Client(transport=httpx.MockTransport(complete)))
                with patch("python_rag.answer.Groq", return_value=client):
                    result = self.ask("Explain consent",
                                      lambda q, s: groq_select(q, s, api_key="test-only"))
                self.assertEqual(result["mode"], expected)
                if expected == "grounded_quotes":
                    self.assertEqual(result["quotes"], [{"source": "S1", "text": "Consent must be explicit."}])
