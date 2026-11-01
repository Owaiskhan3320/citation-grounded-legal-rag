"""Validate the checked-in release without network calls or model downloads."""
import argparse
from collections import defaultdict
from datetime import date
import hashlib
import json
import re
from pathlib import Path
import sys
from urllib.parse import urlsplit

from jsonschema import Draft202012Validator, FormatChecker

DATA_ROOT = Path(__file__).resolve().parents[1] / "data" / "consumer-law"
DEFAULT_RELEASE = DATA_ROOT / "v1"
OFFICIAL_HOSTS = {
    "consumeraffairs.gov.in", "consumeraffairs.nic.in", "www.indiacode.nic.in",
    "consumerhelpline.gov.in", "www.nic.gov.in", "grahak.maharashtra.gov.in", "e-jagriti.gov.in",
}


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def validate_release(release_dir=DEFAULT_RELEASE, guide_path=DATA_ROOT / "issue-paths.json"):
    release_dir = Path(release_dir)
    schema = read_json(DATA_ROOT / "schema.json")
    Draft202012Validator.check_schema(schema)
    corpus = read_json(release_dir / "records.json")
    manifest = read_json(release_dir / "sources.json")
    guide = read_json(guide_path)
    errors = []
    for name, payload, selected_schema in [
        ("records", corpus, schema),
        ("sources", manifest, {"$defs": schema["$defs"], "$ref": "#/$defs/manifest"}),
        ("issue paths", guide, {"$defs": schema["$defs"], "$ref": "#/$defs/issueGuide"}),
    ]:
        validator = Draft202012Validator(selected_schema, format_checker=FormatChecker())
        for error in validator.iter_errors(payload):
            location = ".".join(str(part) for part in error.absolute_path)
            errors.append(f"{name}.{location}: {error.message}")
    if errors:
        return errors

    if corpus["release"] != manifest["release"]:
        errors.append("Records and sources must belong to the same release.")

    sources = {}
    snapshots = {}
    today = date.today().isoformat()
    for source in manifest["sources"]:
        source_id = source["id"]
        if source_id in sources:
            errors.append(f"Duplicate source id: {source_id}")
        sources[source_id] = source
        parsed = urlsplit(source["official_url"])
        if parsed.hostname not in OFFICIAL_HOSTS or parsed.username or parsed.password or parsed.port:
            errors.append(f"{source_id}: source URL must use an approved official host.")
        published = source["published_on"]
        if (published is not None and published > source["retrieved_on"]) or not source["retrieved_on"] <= source["checked_on"] <= today:
            errors.append(f"{source_id}: invalid publication/retrieval/check chronology.")
        if source.get("source_updated_on", source["checked_on"]) > source["checked_on"]:
            errors.append(f"{source_id}: source update cannot be after its check date.")
        snapshot_path = release_dir / source["snapshot"]
        if not snapshot_path.is_file():
            errors.append(f"{source_id}: missing source snapshot.")
            continue
        raw = snapshot_path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != source["snapshot_sha256"]:
            errors.append(f"{source_id}: source snapshot hash mismatch.")
        snapshot = read_json(snapshot_path)
        if snapshot.get("source_id") != source_id:
            errors.append(f"{source_id}: snapshot belongs to a different source.")
        pages = snapshot.get("pages", [])
        if (not pages or any(not isinstance(p.get("page"), int) or p["page"] < 1 or
                            not isinstance(p.get("text"), str) or not p["text"].strip() for p in pages)):
            errors.append(f"{source_id}: invalid source snapshot pages.")
            continue
        if len({p["page"] for p in pages}) != len(pages):
            errors.append(f"{source_id}: duplicate source snapshot page.")
        if source.get("source_format") == "html" and any(not p.get("fragments") for p in pages):
            errors.append(f"{source_id}: HTML snapshots must preserve separate text fragments.")
        snapshots[source_id] = {p["page"]: p.get("fragments", [p["text"]]) for p in pages}

    versions = defaultdict(list)
    keys = set()
    coverage = set()
    for record in corpus["records"]:
        key = (record["id"], record["version"])
        label = "@".join(key)
        if key in keys:
            errors.append(f"Duplicate record version: {label}")
        keys.add(key)
        provision_key = (record["source_id"], tuple(sorted(record["provisions"])), record["version"])
        if provision_key in coverage:
            errors.append(f"{label}: duplicate provision coverage for this version.")
        coverage.add(provision_key)
        versions[record["id"]].append(record)
        if record["version"] != record["effective_from"]:
            errors.append(f"{label}: version must equal effective_from.")
        if record["effective_to"] and record["effective_to"] <= record["effective_from"]:
            errors.append(f"{label}: effective_to must be after effective_from (exclusive).")
        if record["checked_on"] > today:
            errors.append(f"{label}: check date cannot be in the future.")
        if record["source_type"] == "action" and record.get("date_basis") != "observed":
            errors.append(f"{label}: action guidance must declare observed dates, not statutory commencement.")
        for source_id in [record["source_id"], record["commencement_source_id"]]:
            if source_id not in sources:
                errors.append(f"{label}: unknown source {source_id}.")
        for passage in record["passages"]:
            fragments = snapshots.get(passage["source_id"], {}).get(passage["page"], [])
            quote = " ".join(passage["text"].split())
            if not any(quote in " ".join(fragment.split()) for fragment in fragments):
                errors.append(f"{label}: quotation not found on {passage['source_id']} page {passage['page']}.")
        if record["source_id"] not in {p["source_id"] for p in record["passages"]}:
            errors.append(f"{label}: primary source must supply at least one passage.")
        section = re.fullmatch(r"Section (\d+)", record["section"])
        if section and record["provisions"] == [record["section"]]:
            expected = rf"^{section[1]}\.\s+(?!\d+\.)"
            if not re.match(expected, record["passages"][0]["text"]):
                errors.append(f"{label}: quotation starts at a cross-reference, not the section heading.")

    for record_id, items in versions.items():
        checked = sorted((r for r in items if r["review_status"] == "source_checked"),
                         key=lambda r: r["effective_from"])
        for previous, current in zip(checked, checked[1:]):
            if previous["effective_to"] is None or previous["effective_to"] > current["effective_from"]:
                errors.append(f"{record_id}: overlapping checked effective-date intervals.")

    record_ids = {r["id"] for r in corpus["records"]}
    route_ids = set()
    for route in guide["routes"]:
        if route["id"] in route_ids or route["record_id"] not in record_ids:
            errors.append(f"Invalid or duplicate official route: {route['id']}")
        route_ids.add(route["id"])
        url = urlsplit(route["url"])
        if url.scheme != "https" or url.hostname not in OFFICIAL_HOSTS or url.username or url.password or url.port:
            errors.append(f"{route['id']}: route URL must use an approved official host.")
        if not any(r["id"] == route["record_id"] and r["source_type"] == "action" for r in corpus["records"]):
            errors.append(f"{route['id']}: route must refer to an action record.")
    issue_ids = set()
    for issue in guide["issues"]:
        if issue["id"] in issue_ids:
            errors.append(f"Duplicate issue path: {issue['id']}")
        issue_ids.add(issue["id"])
        if not issue["record_ids"] or any(value not in record_ids for value in issue["record_ids"]):
            errors.append(f"{issue['id']}: issue path refers to missing records.")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--release-dir", type=Path, default=DEFAULT_RELEASE)
    args = parser.parse_args()
    try:
        errors = validate_release(args.release_dir)
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f"Corpus validation failed: {error}", file=sys.stderr)
        return 1
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    corpus = read_json(args.release_dir / "records.json")
    print(f"Corpus checks passed: {len(corpus['records'])} record versions.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
