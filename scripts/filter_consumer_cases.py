"""Create reviewable Consumer Disputes candidates from a NyayaAnumana CSV export.

The source dataset is deliberately supplied as a command-line argument so this
repository does not depend on a machine-specific drive path or commit raw case data.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Iterable


CONSUMER_PREFIX = "Consumer_Disputes_"
ACT_2019_PATTERN = re.compile(r"consumer\s+protection\s+act\s*,?\s*2019", re.IGNORECASE)
ACT_1986_PATTERN = re.compile(r"consumer\s+protection\s+act\s*,?\s*1986", re.IGNORECASE)

TOPIC_RULES = {
    "defective_goods": ("defect", "defective product", "replacement"),
    "deficiency_in_service": ("deficiency in service", "deficient service"),
    "medical_negligence": ("medical negligence", "medical deficiency", "hospital"),
    "insurance": ("insurance claim", "insurance policy", "insurer"),
    "housing": ("builder", "flat", "apartment", "housing"),
    "e_commerce": ("e-commerce", "ecommerce", "online marketplace"),
    "misleading_advertising": ("misleading advertisement", "false advertisement"),
    "unfair_trade_practice": ("unfair trade practice",),
    "refund_or_compensation": ("refund", "compensation"),
}


def configure_csv_field_limit() -> None:
    """Raise the standard-library CSV field limit for long judgment text."""

    field_limit = sys.maxsize
    while True:
        try:
            csv.field_size_limit(field_limit)
            return
        except OverflowError:
            field_limit //= 10


def classify_act_version(text: str) -> str:
    """Return an Act version only when that version is explicit in the text."""

    if ACT_2019_PATTERN.search(text):
        return "2019"
    if ACT_1986_PATTERN.search(text):
        return "1986"
    return "unknown"


def classify_topics(text: str) -> list[str]:
    lowered = text.lower()
    return [topic for topic, phrases in TOPIC_RULES.items() if any(phrase in lowered for phrase in phrases)]


def is_consumer_case(row: dict[str, str], min_text_characters: int) -> bool:
    return (
        row.get("filename", "").startswith(CONSUMER_PREFIX)
        and len(row.get("text", "").strip()) >= min_text_characters
    )


def candidate_record(row: dict[str, str], source_name: str) -> dict[str, object]:
    text = row["text"].strip()
    return {
        "schema_version": 1,
        "case_id": row["filename"],
        "source_dataset_file": source_name,
        "dataset_outcome_label": row.get("label", ""),
        "act_version": classify_act_version(text),
        "topics": classify_topics(text),
        "text": text,
    }


def filter_cases(
    source_path: Path,
    output_path: Path,
    *,
    min_text_characters: int = 500,
    max_records: int | None = None,
) -> dict[str, object]:
    """Write Consumer Disputes candidates as JSONL and return run statistics."""

    configure_csv_field_limit()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    rows_read = 0
    candidates_written = 0
    version_counts: Counter[str] = Counter()
    topic_counts: Counter[str] = Counter()

    with source_path.open("r", encoding="utf-8", errors="replace", newline="") as source_file, output_path.open(
        "w", encoding="utf-8", newline="\n"
    ) as output_file:
        reader = csv.DictReader(source_file)
        expected_columns = {"filename", "text", "label"}
        if reader.fieldnames is None or not expected_columns.issubset(reader.fieldnames):
            raise ValueError(
                f"Expected CSV columns {sorted(expected_columns)}, found {reader.fieldnames}."
            )

        for row in reader:
            rows_read += 1
            if not is_consumer_case(row, min_text_characters):
                continue

            candidate = candidate_record(row, source_path.name)
            output_file.write(json.dumps(candidate, ensure_ascii=False) + "\n")
            candidates_written += 1
            version_counts.update([candidate["act_version"]])
            topic_counts.update(candidate["topics"])

            if max_records is not None and candidates_written >= max_records:
                break

    return {
        "source": str(source_path),
        "output": str(output_path),
        "rows_read": rows_read,
        "candidates_written": candidates_written,
        "act_versions": dict(sorted(version_counts.items())),
        "topics": dict(sorted(topic_counts.items())),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Filter NyayaAnumana Consumer Disputes records into reviewable JSONL candidates."
    )
    parser.add_argument("--source", type=Path, required=True, help="Path to a NyayaAnumana CSV split.")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/curated/consumer_case_candidates.jsonl"),
        help="Ignored local JSONL output path.",
    )
    parser.add_argument(
        "--min-text-characters",
        type=int,
        default=500,
        help="Discard very short records. Default: 500.",
    )
    parser.add_argument(
        "--max-records",
        type=int,
        help="Optional cap for a quick validation run.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.min_text_characters < 1:
        raise ValueError("--min-text-characters must be at least 1.")
    if args.max_records is not None and args.max_records < 1:
        raise ValueError("--max-records must be at least 1.")
    if not args.source.is_file():
        raise FileNotFoundError(f"Source CSV does not exist: {args.source}")

    print(json.dumps(
        filter_cases(
            args.source,
            args.output,
            min_text_characters=args.min_text_characters,
            max_records=args.max_records,
        ),
        indent=2,
    ))


if __name__ == "__main__":
    main()
