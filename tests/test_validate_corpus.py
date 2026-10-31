import json
from pathlib import Path
import shutil
import tempfile
import unittest

from scripts.validate_corpus import DEFAULT_RELEASE, validate_release


class CorpusValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.release = Path(self.temp.name) / "v1"
        shutil.copytree(DEFAULT_RELEASE, self.release)

    def edit(self, name, change):
        path = self.release / name
        value = json.loads(path.read_text(encoding="utf-8"))
        change(value)
        path.write_text(json.dumps(value, ensure_ascii=False), encoding="utf-8")

    def assert_error(self, text):
        self.assertTrue(any(text in error for error in validate_release(self.release)))

    def test_checked_in_release_is_valid(self):
        self.assertEqual(validate_release(), [])

    def test_missing_metadata_is_rejected(self):
        self.edit("records.json", lambda d: d["records"][0].pop("effective_from"))
        self.assert_error("effective_from")

    def test_duplicate_record_version_is_rejected(self):
        self.edit("records.json", lambda d: d["records"].append(d["records"][0]))
        self.assert_error("Duplicate record version")

    def test_invalid_calendar_date_is_rejected(self):
        self.edit("records.json", lambda d: d["records"][0].update(effective_from="2026-02-30"))
        self.assert_error("not a 'date'")

    def test_duplicate_provision_under_another_id_is_rejected(self):
        def add_duplicate(data):
            duplicate = {**data["records"][0], "id": "duplicate-complaint"}
            data["records"].append(duplicate)
        self.edit("records.json", add_duplicate)
        self.assert_error("duplicate provision coverage")

    def test_inverted_effective_interval_is_rejected(self):
        self.edit("records.json", lambda d: d["records"][0].update(effective_to="2020-07-19"))
        self.assert_error("effective_to must be after")

    def test_overlapping_versions_are_rejected(self):
        def remove_end_date(data):
            record = next(r for r in data["records"] if r["id"] == "ecommerce-platform-information")
            record["effective_to"] = None
        self.edit("records.json", remove_end_date)
        self.assert_error("overlapping")

    def test_non_official_source_is_rejected(self):
        self.edit("sources.json", lambda d: d["sources"][0].update(official_url="https://example.com/act.pdf"))
        self.assert_error("approved official host")

    def test_unknown_source_is_rejected(self):
        self.edit("records.json", lambda d: d["records"][0].update(source_id="missing-source"))
        self.assert_error("unknown source")

    def test_paraphrase_cannot_pass_as_quotation(self):
        self.edit("records.json", lambda d: d["records"][0]["passages"][0].update(text="You always receive a refund."))
        self.assert_error("quotation not found")

    def test_wrong_page_is_rejected(self):
        self.edit("records.json", lambda d: d["records"][0]["passages"][0].update(page=30))
        self.assert_error("quotation not found")

    def test_tampered_snapshot_is_rejected(self):
        self.edit("snapshots/consumer-protection-act-2019.json", lambda d: d["pages"][0].update(text="Changed text"))
        self.assert_error("snapshot hash mismatch")

    def test_duplicate_source_is_rejected(self):
        self.edit("sources.json", lambda d: d["sources"].append(d["sources"][0]))
        self.assert_error("Duplicate source id")


if __name__ == "__main__":
    unittest.main()
