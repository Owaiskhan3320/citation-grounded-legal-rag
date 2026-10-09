import csv
import json
import tempfile
import unittest
from pathlib import Path

from scripts.filter_consumer_cases import filter_cases


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class FilterConsumerCasesTests(unittest.TestCase):
    def test_keeps_consumer_records_and_preserves_explicit_act_version(self) -> None:
        rows = [
            {
                "filename": "Consumer_Disputes_2020_1",
                "text": "The Consumer Protection Act, 2019 applies. " * 20,
                "label": "1",
            },
            {
                "filename": "Allahabad_HC_2020_2",
                "text": "The Consumer Protection Act, 2019 applies. " * 20,
                "label": "0",
            },
            {
                "filename": "Consumer_Disputes_2010_3",
                "text": "The Consumer Protection Act, 1986 concerns an insurance claim. " * 20,
                "label": "0",
            },
        ]

        with tempfile.TemporaryDirectory(dir=PROJECT_ROOT, prefix="test-filter-") as temporary_directory:
            temporary_path = Path(temporary_directory)
            source_path = temporary_path / "source.csv"
            output_path = temporary_path / "candidates.jsonl"
            with source_path.open("w", encoding="utf-8", newline="") as source_file:
                writer = csv.DictWriter(source_file, fieldnames=["filename", "text", "label"])
                writer.writeheader()
                writer.writerows(rows)

            stats = filter_cases(source_path, output_path)
            records = [json.loads(line) for line in output_path.read_text(encoding="utf-8").splitlines()]

        self.assertEqual(stats["candidates_written"], 2)
        self.assertEqual([record["act_version"] for record in records], ["2019", "1986"])
        self.assertEqual(records[1]["topics"], ["insurance"])


if __name__ == "__main__":
    unittest.main()
