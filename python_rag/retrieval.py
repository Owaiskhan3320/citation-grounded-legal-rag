"""Provision lookup and exact cosine search over the verified corpus."""

import argparse
from datetime import datetime
from hashlib import sha256
import json
from pathlib import Path
import re
from zoneinfo import ZoneInfo

import faiss


ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "data/consumer-law/v1/records.json"
SUMMARIES = ROOT / "python_rag/record_summaries.json"
INDEX_DIR = ROOT / "tmp/python-index"
MODEL = "sentence-transformers/all-MiniLM-L6-v2"
REVISION = "c9745ed1d9f207416be6d2e6f8de32d1f16199bf"
REFERENCE = re.compile(r"\b(section|rule)\s+(\d+[a-z]?(?:\s*\([a-z0-9]+\))*)", re.I)


def current_date():
    return datetime.now(ZoneInfo("Asia/Kolkata")).date().isoformat()


def load_model():
    import torch
    from sentence_transformers import SentenceTransformer

    torch.set_num_threads(2)
    return SentenceTransformer(MODEL, revision=REVISION, device="cpu", trust_remote_code=False)


def corpus_snapshot():
    raw = CORPUS.read_bytes()
    records = [r for r in json.loads(raw)["records"] if r["review_status"] == "source_checked"]
    summary_bytes = SUMMARIES.read_bytes()
    summaries = json.loads(summary_bytes)
    keys = {f"{record['id']}@{record['version']}" for record in records}
    if set(summaries) - keys:
        raise ValueError("A summary references an unknown or unchecked record version.")
    for record in records:
        key = f"{record['id']}@{record['version']}"
        if key in summaries:
            record["summary"] = summaries[key]
    metadata = {
        "format": 2,
        "model": MODEL,
        "revision": REVISION,
        "corpus_sha256": sha256(raw).hexdigest(),
        "summaries_sha256": sha256(summary_bytes).hexdigest(),
        "rows": [[r["id"], r["version"]] for r in records],
    }
    return records, metadata


def build_index(model, folder=INDEX_DIR):
    records, metadata = corpus_snapshot()
    # Summary first so long quotations do not crowd out the main point.
    texts = [
        "\n".join([r["title"], r["summary"], *(p["text"] for p in r["passages"])])
        for r in records
    ]
    vectors = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    index = faiss.IndexFlatIP(vectors.shape[1])
    index.add(vectors)
    folder.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(folder / "records.faiss"))
    (folder / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return index, records


def load_index(folder=INDEX_DIR):
    records, expected = corpus_snapshot()
    metadata = json.loads((folder / "metadata.json").read_text(encoding="utf-8"))
    if metadata != expected:
        raise ValueError("Index metadata is stale; rebuild the index.")
    index = faiss.read_index(str(folder / "records.faiss"))
    if index.ntotal != len(records) or index.metric_type != faiss.METRIC_INNER_PRODUCT:
        raise ValueError("Index does not match the corpus; rebuild the index.")
    return index, records


def active(record, as_of):
    return record["effective_from"] <= as_of and (
        not record["effective_to"] or as_of < record["effective_to"]
    )


def reference_key(text):
    return re.sub(r"\s+", "", text.lower())


def record_references(record):
    yield from map(reference_key, record["provisions"])
    # An indexed section heading can cover a range of subsections in the source.
    if REFERENCE.fullmatch(record["section"]):
        yield reference_key(record["section"])


def search(question, model, index, records, as_of, k=5, *, context=None):
    references = {reference_key(m.group()) for m in REFERENCE.finditer(question)}
    if references:
        return [
            (record, None) for record in records
            if active(record, as_of)
            and references.intersection(record_references(record))
        ][:k]
    # Only references in the current question trigger exact lookup.
    text = f"{question}\n{context}" if context else question
    query = model.encode([text], normalize_embeddings=True, show_progress_bar=False)
    # Search all rows in this small index so expired versions never consume top-k slots.
    scores, rows = index.search(query, index.ntotal)
    return [
        (records[row], float(score)) for row, score in zip(rows[0], scores[0])
        if row >= 0 and active(records[row], as_of)
    ][:k]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("question", nargs="?")
    parser.add_argument("--build", action="store_true")
    parser.add_argument("--as-of", type=lambda value: datetime.strptime(value, "%Y-%m-%d").date())
    args = parser.parse_args()
    if not args.build and not (args.question or "").strip():
        parser.error("provide a question or use --build")
    as_of = args.as_of.isoformat() if args.as_of else current_date()
    try:
        if args.build:
            model = load_model()
            index, records = build_index(model)
            print(f"Indexed {index.ntotal} record versions.")
        else:
            index, records = load_index()
            model = None if REFERENCE.search(args.question) else load_model()
        if args.question:
            hits = search(args.question, model, index, records, as_of)
            for record, score in hits:
                label = "exact" if score is None else f"{score:.4f}"
                print(f"{label}\t{record['id']}\t{record['section']}\t{record['title']}")
            if not hits:
                print("No active record matched the lookup.")
    except (OSError, ValueError) as error:
        parser.exit(1, f"{error}\nBuild with: python -m python_rag.retrieval --build\n")


if __name__ == "__main__":
    main()
