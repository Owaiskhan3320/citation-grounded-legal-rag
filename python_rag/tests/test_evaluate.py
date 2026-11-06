import unittest
from unittest.mock import patch

from python_rag.evaluate import metrics, tune_threshold
from python_rag.evaluate_answers import load_benchmark, score_parts, summarize, trace_case
from python_rag.retrieval import corpus_snapshot


class EvaluationTests(unittest.TestCase):
    def test_alternatives_do_not_replace_other_required_groups(self):
        questions = [{"id": "a", "required_evidence": [["x", "y"], ["z"]]}]
        self.assertEqual(metrics(questions, {"a": ["y"]})["all_evidence"], 0)
        self.assertEqual(metrics(questions, {"a": ["y", "z"]})["all_evidence"], 1)

    def test_threshold_separates_clear_hits_from_outside_requests(self):
        questions = [
            {"id": "a", "required_evidence": [["x"]]},
            {"id": "b", "required_evidence": []},
        ]
        threshold, stats = tune_threshold(
            questions, {"a": ["x"], "b": ["x"]}, {"a": 0.6, "b": 0.2}
        )
        self.assertEqual(threshold, 0.6)
        self.assertEqual(stats["outside_declines"], 1)
        self.assertEqual(stats["false_declines"], 0)

    def test_holdout_lock_and_versioned_passage_references(self):
        records, _ = corpus_snapshot()
        lock, cases = load_benchmark("holdout", records)
        self.assertEqual(lock["questions"], 25)
        self.assertEqual(
            [sum(q["slice"] == name for q in cases) for name in ("answerable", "mixed", "outside")],
            [12, 8, 5],
        )

    def test_trace_scores_filtered_evidence_and_unmatched_parts_separately(self):
        gold = [
            {"anchor": "review", "evidence": [["a@v1#1", "b@v1#1"], ["c@v1#1"]]},
            {"anchor": "visa", "evidence": []},
        ]
        actual = [{
            "id": "Q1", "question": "What is the review process?",
            "ranked": [{"record": "b@v1"}, {"record": "c@v1"}],
            "retained": [],
        }]
        scored = score_parts(gold, actual)
        counts = summarize([{"evidence": scored}])
        self.assertEqual(counts["ranked_groups_found"], 2)
        self.assertEqual(counts["ranked_complete_parts"], 1)
        self.assertEqual(counts["retained_groups_found"], 0)
        self.assertEqual(counts["answerable_parts_without_candidates"], 1)
        self.assertEqual(counts["unsupported_parts"], 1)
        self.assertEqual(counts["unmatched_gold_parts"], 1)

    def test_trace_keeps_sent_candidates_when_selector_declines(self):
        record = {
            "id": "example", "version": "2020-01-01", "title": "Example", "section": "Example",
            "effective_from": "2020-01-01", "effective_to": None, "summary": "Summary",
            "passages": [{"text": "Evidence"}],
        }
        case = {"id": "a", "question": "What are the requirements?",
                "parts": [{"evidence": [["example@2020-01-01#1"]]}]}
        with patch("python_rag.evaluate_answers.search", return_value=[(record, 0.8)]), patch(
            "python_rag.evaluate_answers.groq_select", return_value={"Q1": []}
        ) as selector:
            row = trace_case(case, None, None, [record], "2026-11-06", use_groq=True)
        selector.assert_called_once()
        self.assertEqual(row["mode"], "not_verified")
        self.assertEqual(row["parts"][0]["retained"], ["example@2020-01-01"])
        self.assertEqual(row["parts"][0]["selected"], [])
        self.assertEqual(row["evidence"][0]["retained_hits"], 1)
