"""Compare retrieval on the frozen 50-question development benchmark."""

from hashlib import sha256
import json

from python_rag.retrieval import MODEL, REVISION, ROOT, load_index, load_model, search


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def metrics(questions, rankings):
    result = dict(any_evidence=0, all_evidence=0, false_declines=0, outside_declines=0)
    for q in questions:
        ids = set(rankings[q["id"]])
        groups = q["required_evidence"]
        if not groups:
            result["outside_declines"] += not ids
            continue
        matches = [bool(ids.intersection(group)) for group in groups]
        result["any_evidence"] += any(matches)
        result["all_evidence"] += all(matches)
        result["false_declines"] += not ids
    return result


def tune_threshold(questions, ranked, scores):
    outside_count = sum(not q["required_evidence"] for q in questions)
    # A tie favors fewer false declines, then the lower threshold.
    def trial(threshold):
        accepted = {qid: ids if scores[qid] >= threshold else [] for qid, ids in ranked.items()}
        stats = metrics(questions, accepted)
        return stats, (outside_count - stats["outside_declines"] + stats["false_declines"],
                       stats["false_declines"], threshold)

    candidates = [-1.0, *sorted({score for score in scores.values() if -1 <= score <= 1}), 1.000001]
    threshold = min(candidates, key=lambda value: trial(value)[1])
    return threshold, trial(threshold)[0]


def main():
    benchmark = json.loads((ROOT / "evaluation/consumer-50.json").read_text(encoding="utf-8"))
    baseline = json.loads((ROOT / "evaluation/results/consumer-50-2026-11-02.json").read_text(encoding="utf-8"))
    for path, expected in baseline["fingerprints"].items():
        raw = (ROOT / path).read_bytes()
        if expected not in {sha256(raw).hexdigest(), sha256(raw.replace(b"\r\n", b"\n")).hexdigest()}:
            raise ValueError(f"Frozen baseline input changed: {path}")

    questions = benchmark["questions"]
    index, records = load_index()
    model = load_model()
    rankings = {}
    scores = {}
    for q in questions:
        hits = search(q["question"], model, index, records, benchmark["as_of"], k=benchmark["top_k"])
        rankings[q["id"]] = [record["id"] for record, _ in hits]
        # Exact references use a separate lookup, not the dense threshold.
        scores[q["id"]] = hits[0][1] if hits and hits[0][1] is not None else (2.0 if hits else -2.0)

    threshold, gated = tune_threshold(questions, rankings, scores)
    comparison = {
        name: metrics(questions, {q["id"]: q["retrieved"] for q in baseline["runs"][name]["questions"]})
        for name in ("keyword", "bm25")
    }
    comparison["faiss"] = metrics(questions, rankings)
    comparison["faiss_gated"] = gated
    print(json.dumps({
        "benchmark": benchmark["name"],
        "as_of": benchmark["as_of"],
        "top_k": benchmark["top_k"],
        "model": MODEL,
        "model_revision": REVISION,
        "in_scope": sum(bool(q["required_evidence"]) for q in questions),
        "out_of_scope": sum(not q["required_evidence"] for q in questions),
        "threshold": threshold,
        "held_out_sha256": digest(ROOT / "evaluation/python-scenarios-unscored.json"),
        "metrics": comparison,
    }, indent=2))


if __name__ == "__main__":
    main()
