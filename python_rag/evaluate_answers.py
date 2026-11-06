"""Replay labeled scenarios and record evidence at each pipeline boundary."""

import argparse
from hashlib import sha256
import json
import os
from pathlib import Path
from time import perf_counter, sleep
from unittest.mock import patch

from python_rag.answer import THRESHOLD, TOP_K, answer, groq_select
from python_rag.retrieval import CORPUS, MODEL, REVISION, ROOT, active, load_index, load_model, search


def fingerprint(path):
    return sha256(path.read_bytes().replace(b"\r\n", b"\n")).hexdigest()


def record_key(record):
    return f"{record['id']}@{record['version']}"


def load_benchmark(name, records):
    if name == "holdout":
        path = ROOT / "evaluation/guide-holdout-v1.jsonl"
        lock = json.loads(path.with_suffix(".lock.json").read_text(encoding="utf-8"))
        rubric = ROOT / "docs/evaluation/guide-holdout-rubric-v1.md"
        if fingerprint(path) != lock["dataset_sha256_lf"] or fingerprint(rubric) != lock["rubric_sha256_lf"]:
            raise ValueError("Frozen holdout or rubric changed")
        questions = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]
        if len(questions) != lock["questions"] or len({q["id"] for q in questions}) != len(questions):
            raise ValueError("Unexpected holdout case count or duplicate case IDs")
        evidence = {
            f"{record_key(record)}#{i}"
            for record in records if active(record, lock["as_of"])
            for i in range(1, len(record["passages"]) + 1)
        }
        for q in questions:
            for part in q["parts"]:
                for group in part["evidence"]:
                    if not group or set(group) - evidence:
                        raise ValueError(f"{q['id']} refers to missing or inactive evidence: {group}")
        return lock, questions

    path = ROOT / "evaluation/guide-regression-trace-v1.json"
    meta = json.loads(path.read_text(encoding="utf-8"))
    questions_path = ROOT / meta["questions_from"]
    question_text = {}
    for line in questions_path.read_text(encoding="utf-8").splitlines():
        if line.startswith("| D"):
            case_id, _, question, _ = (x.strip() for x in line.split("|")[1:-1])
            question_text[case_id] = question
    by_id = {r["id"]: record_key(r) for r in records if active(r, meta["as_of"])}
    questions = [
        {"id": case_id, "question": question_text[case_id], "parts": [
            {"evidence": [[by_id[rid]] for rid in ids]}
        ]}
        for case_id, ids in meta["record_ids"].items()
    ]
    return {**meta, "dataset_sha256_lf": fingerprint(path),
            "question_text_sha256_lf": fingerprint(questions_path)}, questions


def score_parts(gold, actual):
    scored = []
    for part in gold:
        anchor = part.get("anchor", "").casefold()
        matched = [p for p in actual if not anchor or anchor in p["question"].casefold()]
        ranked = {hit["record"] for p in matched for hit in p["ranked"]}
        retained = {key for p in matched for key in p["retained"]}
        groups = [{ref.split("#", 1)[0] for ref in group} for group in part["evidence"]]
        scored.append({
            "anchor": part.get("anchor"), "matched_parts": [p["id"] for p in matched],
            "groups": len(groups), "ranked_hits": sum(bool(ranked & g) for g in groups),
            "retained_hits": sum(bool(retained & g) for g in groups),
            "retained_any": bool(retained),
        })
    return scored


def trace_case(case, model, index, records, as_of, use_groq):
    ranked, eligible, sent = {}, {}, {}

    def trace_search(question, *args, **kwargs):
        hits = search(question, *args, **kwargs)
        ranked[question] = [{"record": record_key(record), "score": score} for record, score in hits]
        return hits

    def select(parts, sources):
        eligible.update({label: list(part["source_ids"]) for label, part in parts.items()})
        sent.update(sources)
        return groq_select(parts, sources)

    started = perf_counter()
    with patch("python_rag.answer.search", trace_search):
        result = answer(case["question"], model, index, records, as_of,
                        select=select if use_groq else None)
    elapsed = round((perf_counter() - started) * 1000, 1)
    by_id = {r["id"]: r for r in records if active(r, as_of)}
    sources = {**result["sources"], **sent}
    parts = []
    for label, part in result["parts"].items():
        selected = []
        summaries = {}
        for quote in part["quotes"]:
            record = by_id[sources[quote["source"]]["record_id"]]
            summaries[record_key(record)] = record["summary"]
            selected.extend(
                f"{record_key(record)}#{i}"
                for i, passage in enumerate(record["passages"], start=1)
                if quote["text"] in passage["text"]
            )
        parts.append({
            "id": label, "question": part["question"], "ranked": ranked.get(part["question"], []),
            "retained": [record_key(by_id[sources[s]["record_id"]])
                         for s in eligible.get(label, part["source_ids"])],
            "selected": sorted(set(selected)), "record_summaries": summaries, "limit": part["limit"],
        })
    return {"id": case["id"], "slice": case.get("slice", "regression"), "mode": result["mode"], "ms": elapsed,
            "diagnostic": result.get("diagnostic") if use_groq else None,
            "parts": parts, "evidence": score_parts(case["parts"], parts)}


def summarize(rows):
    parts = [part for row in rows for part in row["evidence"]]
    answerable = [part for part in parts if part["groups"]]
    unsupported = [part for part in parts if not part["groups"]]
    return {
        "cases": len(rows), "answerable_parts": len(answerable),
        "evidence_groups": sum(p["groups"] for p in answerable),
        "ranked_groups_found": sum(p["ranked_hits"] for p in answerable),
        "retained_groups_found": sum(p["retained_hits"] for p in answerable),
        "ranked_complete_parts": sum(p["ranked_hits"] == p["groups"] for p in answerable),
        "retained_complete_parts": sum(p["retained_hits"] == p["groups"] for p in answerable),
        "answerable_parts_without_candidates": sum(not p["retained_any"] for p in answerable),
        "unsupported_parts": len(unsupported),
        "unsupported_parts_with_candidates": sum(p["retained_any"] for p in unsupported),
        "unmatched_gold_parts": sum(not p["matched_parts"] for p in parts),
    }


def run_benchmark(args):
    if args.groq and not os.environ.get("GROQ_API_KEY", "").strip():
        raise ValueError("--groq requires a configured GROQ_API_KEY")
    index, records = load_index()
    metadata, questions = load_benchmark(args.suite, records)
    model = load_model()
    settings = {} if args.groq else {"GROQ_API_KEY": ""}
    rows, next_start = [], perf_counter()
    with patch.dict(os.environ, settings):
        for question in questions:
            if args.groq:
                sleep(max(0, next_start - perf_counter()))
                next_start = perf_counter() + 8.5
            rows.append(trace_case(question, model, index, records, metadata["as_of"], args.groq))
    return {
        "suite": metadata, "revision_label": args.revision,
        "corpus_sha256_lf": fingerprint(CORPUS),
        "pipeline_sha256_lf": {name: fingerprint(ROOT / "python_rag" / name)
                               for name in ("answer.py", "retrieval.py", "guide_app.py")},
        "embedding_model": MODEL, "embedding_revision": REVISION,
        "selector_model": "openai/gpt-oss-20b" if args.groq else None,
        "top_k": TOP_K, "threshold": THRESHOLD,
        "metrics": summarize(rows), "cases": rows,
    }


def run_legacy():
    raw = (ROOT / "evaluation/python-scenarios-unscored.json").read_bytes()
    if sha256(raw.replace(b"\r\n", b"\n")).hexdigest() != (
        "0f9b683c28d9f9663f9c093ec7efdc89c3158997e65eabd644b183328043cc40"
    ):
        raise ValueError("Frozen scenario file changed")
    suite = json.loads(raw)
    model = load_model()
    index, records = load_index()
    with patch.dict(os.environ, {"GROQ_API_KEY": ""}):
        for q in suite["questions"]:
            started = perf_counter()
            result = answer(q["question"], model, index, records, suite["as_of"])
            ids = [s["record_id"] for s in result["sources"].values()]
            print(json.dumps({
                "id": q["id"], "expected": q["coverage"], "mode": result["mode"],
                "source_ids": ids, "missing_ids": sorted(set(q["expected_ids"]) - set(ids)),
                "ms": round((perf_counter() - started) * 1000, 1),
            }))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--suite", choices=("regression", "holdout"))
    parser.add_argument("--groq", action="store_true", help="use the configured live selector; not a browser test")
    parser.add_argument("--revision", help="Git SHA or other descriptive version label")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if not args.suite:
        if args.groq or args.output or args.revision:
            parser.error("select a suite to use these options")
        run_legacy()
        return
    try:
        result = run_benchmark(args)
        report = json.dumps(result, indent=2) + "\n"
        if args.output:
            with args.output.open("x", encoding="utf-8", newline="\n") as file:
                file.write(report)
            print(json.dumps(result["metrics"], indent=2))
        else:
            print(report, end="")
    except (OSError, ValueError) as error:
        parser.exit(1, f"{error}\n")


if __name__ == "__main__":
    main()
