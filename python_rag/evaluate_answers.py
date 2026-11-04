"""Run the frozen scenarios offline; do not send their questions to Groq."""

from hashlib import sha256
import json
from time import perf_counter
from unittest.mock import patch
import os

from python_rag.answer import answer
from python_rag.retrieval import ROOT, load_index, load_model


def main():
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


if __name__ == "__main__":
    main()
