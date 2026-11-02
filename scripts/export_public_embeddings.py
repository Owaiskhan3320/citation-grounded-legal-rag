"""Encode the frozen public-question comparison; leave the historical encoder untouched."""

import argparse
from importlib.metadata import version
import json
from pathlib import Path
import subprocess
import time


ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "tmp/evaluation/public-embeddings.json")
    parser.add_argument("--allow-download", action="store_true")
    args = parser.parse_args()
    inputs = json.loads(subprocess.run(
        ["node", str(ROOT / "scripts/evaluate-public-questions.mjs"), "--export-inputs"],
        check=True, capture_output=True, text=True, encoding="utf-8", cwd=ROOT,
    ).stdout)
    started = time.perf_counter()
    import torch
    from sentence_transformers import SentenceTransformer
    import_ms = (time.perf_counter() - started) * 1000
    torch.set_num_threads(4)
    config = inputs["embedding"]
    started = time.perf_counter()
    model = SentenceTransformer(config["model"], revision=config["revision"], device="cpu",
                                local_files_only=not args.allow_download, trust_remote_code=False)
    load_ms = (time.perf_counter() - started) * 1000
    model.encode("Warmup.", normalize_embeddings=True, show_progress_bar=False)
    started = time.perf_counter()
    vectors = model.encode([row["text"] for row in inputs["records"]], batch_size=16,
                           normalize_embeddings=True, show_progress_bar=False)
    records = [{"id": row["id"], "vector": vector.tolist()} for row, vector in zip(inputs["records"], vectors)]
    index_ms = (time.perf_counter() - started) * 1000
    questions = []
    for row in inputs["questions"]:
        started = time.perf_counter()
        vector = model.encode(row["text"], normalize_embeddings=True, show_progress_bar=False)
        questions.append({"id": row["id"], "vector": vector.tolist(),
                          "encode_ms": round((time.perf_counter() - started) * 1000, 4)})
    payload = {
        "input_sha256": inputs["input_sha256"], "model": config["model"], "revision": config["revision"],
        "normalised": True, "dimensions": 384, "device": "cpu", "threads": 4,
        "max_sequence_length": model.max_seq_length, "library_import_ms": round(import_ms, 4),
        "load_ms": round(load_ms, 4), "index_ms": round(index_ms, 4),
        "truncated": {field: [row["id"] for row in inputs[field]
                              if len(model.tokenizer.encode(row["text"], truncation=False)) > model.max_seq_length]
                      for field in ("records", "questions")},
        "libraries": {name: version(name) for name in
                      ("sentence-transformers", "torch", "transformers", "huggingface-hub", "numpy")},
        "records": records, "questions": questions,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Encoded {len(records)} records and {len(questions)} public questions: {args.output}")
    print(f"Truncated inputs: {payload['truncated']}")


if __name__ == "__main__":
    main()
