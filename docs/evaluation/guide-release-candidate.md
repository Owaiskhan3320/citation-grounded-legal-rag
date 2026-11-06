# Consumer Law Guide release candidate

Offline replay on 2026-11-06, with the pinned MiniLM model and FAISS, top 3.
The corpus and official passages did not change. The Python app uses
versioned plain-English summary corrections over the frozen corpus.

| Suite | Cases replayed | Required evidence groups retained | Unsupported parts with candidates |
| --- | ---: | ---: | ---: |
| Original development questions | 50 (14 labeled for offline scoring) | 13/13, up from 8/13 | 0/3 |
| Holdout v1, now regression | 25 | 20/20 | 5/13, down from 6/13 |
| Holdout v2, first run | 15 | 12/13 | 0/7 |
| Holdout v2, after the exact-reference fix | 15 | 13/13 | 0/7 |

The fresh v2 set was frozen before its first run. That run missed R02:
the source for Section 38 used a subsection range as its search key.
The rerun is a regression check, not a second unseen result. Both sets are
synthetic and source-labeled, not independent or lawyer-reviewed.

H15 has a mocked Streamlit regression for the independent seller warranty
and resulting harm. H18 now blocks the personal outcome question before
retrieval while keeping the general Section 72 part eligible. Offline evidence
coverage is not answer accuracy: it does not test which passages Groq selects
or whether the displayed answers pass the rubric. In particular, five unsupported
v1 parts still have candidates and depend on the selector to decline them.

Reproduce the offline replay from the repository root:

```sh
python -m python_rag.retrieval --build
python -m python_rag.evaluate_answers --suite development --output tmp/development-replay.json
python -m python_rag.evaluate_answers --suite holdout --output tmp/holdout-v1-replay.json
python -m python_rag.evaluate_answers --suite holdout-v2 --output tmp/holdout-v2-replay.json
```

The [live Groq evaluation](guide-release-candidate-live.md) checks the two
previous blockers, the frozen v2 questions, and the original 50 against the
rendered Streamlit answers. It passed the release gate. The evaluator's `--groq`
flag can record the provider's selected passages using a privately configured
`GROQ_API_KEY`; it does not substitute for checking the rendered answers and
citations.
