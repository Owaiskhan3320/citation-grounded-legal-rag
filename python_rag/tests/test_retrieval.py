import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

import numpy as np

from python_rag.retrieval import build_index, load_index, search


class FakeModel:
    def encode(self, texts, **kwargs):
        return np.tile(np.array([[1, 0]], dtype="float32"), (len(texts), 1))


class RetrievalTests(unittest.TestCase):
    def setUp(self):
        self.tmp = TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.folder = Path(self.tmp.name)
        self.model = FakeModel()
        build_index(self.model, self.folder)
        self.index, self.records = load_index(self.folder)

    def lookup(self, question, date="2026-11-03"):
        return search(question, self.model, self.index, self.records, date)

    def test_exact_reference(self):
        hits = self.lookup("What does SECTION 2 (9) mean?")
        self.assertEqual([(r["id"], score) for r, score in hits], [("consumer-rights", None)])

    def test_missing_reference_does_not_fall_through(self):
        self.assertEqual(self.lookup("What does section 210 say?"), [])

    def test_expired_and_future_rows_do_not_use_top_k_slots(self):
        for date in ("2026-11-03", "2027-01-01"):
            hits = self.lookup("shopping app", date)
            self.assertEqual(len(hits), 5)
            for record, score in hits:
                self.assertLessEqual(record["effective_from"], date)
                self.assertTrue(not record["effective_to"] or date < record["effective_to"])
                self.assertAlmostEqual(score, 1.0)

    def test_stale_row_map_is_rejected(self):
        path = self.folder / "metadata.json"
        metadata = json.loads(path.read_text())
        metadata["rows"].reverse()
        path.write_text(json.dumps(metadata))
        with self.assertRaisesRegex(ValueError, "stale"):
            load_index(self.folder)


if __name__ == "__main__":
    unittest.main()
