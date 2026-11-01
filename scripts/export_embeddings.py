"""Encode frozen evaluation inputs locally. No keys or hosted inference required."""

import argparse
import json
from importlib.metadata import version
from pathlib import Path
import subprocess
import time


ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "tmp/evaluation/embeddings.json")
    parser.add_argument("--allow-download", action="store_true", help="Allow downloading the pinned public model.")
    args = parser.parse_args()
    inputs = json.loads(subprocess.run(
        ["node", str(ROOT / "scripts/evaluate-retrieval.mjs"), "--export-inputs"],
        check=True, capture_output=True, text=True, encoding="utf-8", cwd=ROOT,
    ).stdout)

    import torch
    from sentence_transformers import SentenceTransformer

    torch.set_num_threads(4)
    config = inputs["embedding"]
    started = time.perf_counter()
    model = SentenceTransformer(
        config["model"], revision=config["revision"], device="cpu",
        local_files_only=not args.allow_download, trust_remote_code=False,
    )
    load_ms = (time.perf_counter() - started) * 1000
    model.encode(["Warmup."], normalize_embeddings=True, show_progress_bar=False)

    def encode(rows, timed_individually=False):
        output = []
        if not timed_individually:
            vectors = model.encode([row["text"] for row in rows], batch_size=16,
                                   normalize_embeddings=True, show_progress_bar=False)
            return [{"id": row["id"], "vector": vector.tolist()} for row, vector in zip(rows, vectors)]
        for row in rows:
            started = time.perf_counter()
            vector = model.encode(row["text"], normalize_embeddings=True, show_progress_bar=False)
            output.append({"id": row["id"], "vector": vector.tolist(),
                           "encode_ms": round((time.perf_counter() - started) * 1000, 4)})
        return output

    started = time.perf_counter()
    records = encode(inputs["records"])
    index_ms = (time.perf_counter() - started) * 1000
    questions = encode(inputs["questions"], timed_individually=True)
    truncated = {}
    for field in ("records", "questions"):
        truncated[field] = [row["id"] for row in inputs[field]
                            if len(model.tokenizer.encode(row["text"], truncation=False)) > model.max_seq_length]
    payload = {
        "input_sha256": inputs["input_sha256"], "model": config["model"],
        "revision": config["revision"], "normalised": True, "dimensions": 384,
        "device": "cpu", "threads": 4, "max_sequence_length": model.max_seq_length,
        "load_ms": round(load_ms, 4), "index_ms": round(index_ms, 4),
        "truncated": truncated,
        "libraries": {name: version(name) for name in (
            "sentence-transformers", "torch", "transformers", "huggingface-hub", "numpy")},
        "records": records, "questions": questions,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Encoded {len(records)} records and {len(questions)} questions: {args.output}")
    print(f"Truncated inputs: {truncated}")


if __name__ == "__main__":
    main()
