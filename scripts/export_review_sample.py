"""Export a review-friendly sample from locally generated case candidates."""

from __future__ import annotations

import argparse
import csv
import json
import random
from collections import Counter, defaultdict
from pathlib import Path


def allocate_samples(group_sizes: dict[str, int], sample_size: int) -> dict[str, int]:
    """Allocate a proportional, deterministic quota while retaining every non-empty group."""

    total_records = sum(group_sizes.values())
    if sample_size >= total_records:
        return dict(group_sizes)

    non_empty_groups = sorted(group for group, count in group_sizes.items() if count)
    if sample_size < len(non_empty_groups):
        return {
            group: 1
            for group in sorted(
                non_empty_groups,
                key=lambda group: (-group_sizes[group], group),
            )[:sample_size]
        }

    allocations = {group: 1 for group in non_empty_groups}
    remaining = sample_size - sum(allocations.values())
    if remaining <= 0:
        return allocations

    remaining_capacity = {
        group: group_sizes[group] - allocations[group] for group in non_empty_groups
    }
    capacity_total = sum(remaining_capacity.values())
    provisional = {
        group: min(
            remaining_capacity[group],
            int(remaining * remaining_capacity[group] / capacity_total),
        )
        for group in non_empty_groups
    }
    for group, count in provisional.items():
        allocations[group] += count

    leftovers = sample_size - sum(allocations.values())
    ranked_groups = sorted(
        non_empty_groups,
        key=lambda group: (
            (remaining * remaining_capacity[group] / capacity_total) - provisional[group],
            remaining_capacity[group],
        ),
        reverse=True,
    )
    for group in ranked_groups:
        if leftovers == 0:
            break
        if allocations[group] < group_sizes[group]:
            allocations[group] += 1
            leftovers -= 1

    return allocations


def text_preview(text: str, limit: int = 800) -> str:
    compact_text = " ".join(text.split())
    if len(compact_text) <= limit:
        return compact_text
    return f"{compact_text[:limit].rstrip()}..."


def export_review_sample(
    source_path: Path,
    output_path: Path,
    *,
    sample_size: int = 50,
    seed: int = 42,
) -> dict[str, object]:
    """Write a stratified CSV review sheet and return export statistics."""

    groups: defaultdict[str, list[dict[str, object]]] = defaultdict(list)
    with source_path.open("r", encoding="utf-8") as source_file:
        for line in source_file:
            if line.strip():
                record = json.loads(line)
                groups[str(record["act_version"])].append(record)

    group_sizes = {group: len(records) for group, records in groups.items()}
    allocations = allocate_samples(group_sizes, sample_size)
    randomiser = random.Random(seed)
    sampled_records: list[dict[str, object]] = []
    for group, quota in sorted(allocations.items()):
        sampled_records.extend(randomiser.sample(groups[group], quota))
    randomiser.shuffle(sampled_records)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "case_id",
        "act_version",
        "topics",
        "dataset_outcome_label",
        "text_preview",
        "review_status",
        "review_notes",
    ]
    with output_path.open("w", encoding="utf-8", newline="") as output_file:
        writer = csv.DictWriter(output_file, fieldnames=fields)
        writer.writeheader()
        for record in sampled_records:
            writer.writerow(
                {
                    "case_id": record["case_id"],
                    "act_version": record["act_version"],
                    "topics": "; ".join(record["topics"]),
                    "dataset_outcome_label": record["dataset_outcome_label"],
                    "text_preview": text_preview(str(record["text"])),
                    "review_status": "pending",
                    "review_notes": "",
                }
            )

    return {
        "source": str(source_path),
        "output": str(output_path),
        "sample_size": len(sampled_records),
        "act_versions": dict(sorted(Counter(record["act_version"] for record in sampled_records).items())),
        "seed": seed,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export a stratified review CSV from Consumer Disputes case candidates."
    )
    parser.add_argument("--source", type=Path, required=True, help="Local JSONL from filter_consumer_cases.py.")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/curated/consumer_case_review_sample.csv"),
        help="Ignored local CSV review sheet.",
    )
    parser.add_argument("--sample-size", type=int, default=50, help="Number of candidates to export.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducible sampling.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.sample_size < 1:
        raise ValueError("--sample-size must be at least 1.")
    if not args.source.is_file():
        raise FileNotFoundError(f"Candidate JSONL does not exist: {args.source}")

    print(
        json.dumps(
            export_review_sample(
                args.source,
                args.output,
                sample_size=args.sample_size,
                seed=args.seed,
            ),
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
