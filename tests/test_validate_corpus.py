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
        self.guide = Path(self.temp.name) / "issue-paths.json"
        shutil.copyfile(DEFAULT_RELEASE.parent / "issue-paths.json", self.guide)

    def edit(self, name, change):
        path = self.release / name
        value = json.loads(path.read_text(encoding="utf-8"))
        change(value)
        path.write_text(json.dumps(value, ensure_ascii=False), encoding="utf-8")

    def assert_error(self, text):
        self.assertTrue(any(text in error for error in validate_release(self.release, self.guide)))

    def edit_guide(self, change):
        data = json.loads(self.guide.read_text(encoding="utf-8"))
        change(data)
        self.guide.write_text(json.dumps(data), encoding="utf-8")

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

    def test_html_sources_can_have_unknown_publication_dates(self):
        self.assertEqual(validate_release(self.release, self.guide), [])

    def test_html_sources_require_original_content_hash(self):
        def remove_hash(data):
            next(s for s in data["sources"] if s.get("source_format") == "html").pop("content_sha256")
        self.edit("sources.json", remove_hash)
        self.assert_error("content_sha256")

    def test_pdf_publication_date_cannot_be_null(self):
        self.edit("sources.json", lambda d: d["sources"][0].update(published_on=None))
        self.assert_error("not of type 'string'")

    def test_action_records_must_declare_observation_dates(self):
        def remove_basis(data):
            next(r for r in data["records"] if r["source_type"] == "action").pop("date_basis")
        self.edit("records.json", remove_basis)
        self.assert_error("action guidance must declare observed dates")

    def test_issue_path_cannot_reference_missing_records(self):
        self.edit_guide(lambda d: d["issues"][0].update(record_ids=["missing-record"]))
        self.assert_error("missing records")

    def test_official_route_cannot_use_untrusted_domain(self):
        self.edit_guide(lambda d: d["routes"][0].update(url="https://example.com/complaint"))
        self.assert_error("approved official host")

    def test_malformed_issue_path_is_rejected(self):
        self.edit_guide(lambda d: d["issues"][0].pop("question"))
        self.assert_error("question")

    def test_cross_reference_is_not_a_valid_section_heading(self):
        def change_start(data):
            record = next(r for r in data["records"] if r["id"] == "mediation-settlement")
            record["passages"][0]["text"] = "80. 42. (1) An unrelated section."
        self.edit("records.json", change_start)
        self.assert_error("cross-reference")

    def test_html_quote_cannot_join_noncontiguous_fragments(self):
        def join_fragments(data):
            record = next(r for r in data["records"] if r["id"] == "ejagriti-case-search")
            text = " ".join(p["text"] for p in record["passages"])
            record["passages"] = [{**record["passages"][0], "text": text}]
        self.edit("records.json", join_fragments)
        self.assert_error("quotation not found")


if __name__ == "__main__":
    unittest.main()
