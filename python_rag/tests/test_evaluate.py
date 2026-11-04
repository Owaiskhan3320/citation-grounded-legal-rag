import unittest

from python_rag.evaluate import metrics, tune_threshold


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
