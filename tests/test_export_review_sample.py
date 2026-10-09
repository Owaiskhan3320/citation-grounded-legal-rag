import csv
import json
import tempfile
import unittest
from pathlib import Path

from scripts.export_review_sample import allocate_samples, export_review_sample


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class ExportReviewSampleTests(unittest.TestCase):
    def test_never_exports_more_rows_than_requested_when_groups_outnumber_sample(self) -> None:
        self.assertEqual(
            sum(allocate_samples({"1986": 4, "2019": 1, "unknown": 8}, sample_size=1).values()),
            1,
        )

    def test_exports_reproducible_review_rows_for_each_act_version(self) -> None:
        records = [
            {
                "case_id": f"Consumer_Disputes_1986_{number}",
                "act_version": "1986",
                "topics": ["insurance"],
                "dataset_outcome_label": "0",
                "text": f"Insurance record {number}. " * 100,
            }
            for number in range(3)
        ] + [
            {
                "case_id": f"Consumer_Disputes_unknown_{number}",
                "act_version": "unknown",
                "topics": ["housing"],
                "dataset_outcome_label": "1",
                "text": f"Housing record {number}. " * 100,
            }
            for number in range(3)
        ]

        with tempfile.TemporaryDirectory(dir=PROJECT_ROOT, prefix="test-filter-") as temporary_directory:
            temporary_path = Path(temporary_directory)
            source_path = temporary_path / "candidates.jsonl"
            output_path = temporary_path / "review.csv"
            source_path.write_text(
                "\n".join(json.dumps(record) for record in records) + "\n", encoding="utf-8"
            )

            stats = export_review_sample(source_path, output_path, sample_size=4, seed=7)
            with output_path.open(encoding="utf-8", newline="") as output_file:
                exported_rows = list(csv.DictReader(output_file))

        self.assertEqual(stats["sample_size"], 4)
        self.assertEqual({row["act_version"] for row in exported_rows}, {"1986", "unknown"})
        self.assertTrue(all(row["review_status"] == "pending" for row in exported_rows))
        self.assertTrue(all(len(row["text_preview"]) <= 803 for row in exported_rows))


if __name__ == "__main__":
    unittest.main()
