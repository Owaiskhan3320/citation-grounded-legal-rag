# Python retrieval prototype

This CLI searches the existing verified corpus. It does not generate answers
or decide whether the highest-scoring result supports a claim.

Run from the repository root with Python 3.12:

```powershell
python -m pip install -r python_rag/requirements.txt
python -m python_rag.retrieval --build
python -m python_rag.retrieval "The checkout box was already ticked for a paid warranty"
python -m python_rag.retrieval "Section 2(9)" --as-of 2026-11-03
python -m unittest discover -s python_rag/tests -v
```

The first model load may download the pinned MiniLM revision. Set
`HF_HUB_OFFLINE=1` after caching it if you want to run without network access.
Rebuild after corpus or embedding changes. Only load indexes built locally from
this repo; do not load FAISS artifacts from untrusted sources.

The flat index uses exact cosine search; a NumPy matrix would be enough at
this scale. We use FAISS to learn the standard vector retrieval workflow.
Named references look up provision labels in this corpus only, not an
arbitrary named statute. Date filtering precedes the final top five. Long
texts may exceed MiniLM's input window; full source passages remain in JSON.

In the first local check (90 active records on 2026-11-03), cancellation
charges and pre-ticked checkout consent ranked first; order enforcement and
late filing ranked second. These are four previously seen queries, not a
held-out result. The CLI deliberately does not decide when to abstain.

## Hosting smoke test

Run `python -m streamlit run python_rag/smoke_app.py` locally, or deploy that
entrypoint from the feature branch on Streamlit Community Cloud with Python
3.12. The adjacent requirements file installs CPU PyTorch. No Groq secret is
needed. Verify that the page reports the FAISS row count and shows ranked
results. Check logs if startup fails. This is separate from the Vercel demo.

## Held-out evaluation

Before looking at any results, pick a cutoff date and a public source for
consumer questions. Read posts newest first after the cutoff, skip duplicates
and posts that cannot be safely de-identified, and log the reason for each
skip. Aim for 15 to 25 cases with supported, mixed and unsupported requests.
The project owner records the question (without personal information), the
expected record IDs for each supported part, and what the corpus cannot
answer. Freeze the file before scoring. Do not use those questions to set
the similarity threshold or tune retrieval.

## Week 2 development comparison

After building the index, run `python -m python_rag.evaluate` from the
repository root. This reuses the frozen JS keyword and BM25 rankings after
checking their input fingerprints. It does not install a second BM25
implementation or overwrite prior runs.

| Method at k=3 | Any evidence (/40) | All evidence (/40) | False declines (/40) | Outside declines (/10) |
| --- | ---: | ---: | ---: | ---: |
| Historical JS keyword | 32 | 30 | 0 | 2 |
| Historical JS BM25 | 36 | 35 | 0 | 0 |
| Python FAISS | 38 | 36 | 0 | 0 |
| Python FAISS with threshold | 38 | 36 | 0 | 6 |

Freeze the current MiniLM revision, k=3, and threshold
`0.3656768202781677` for the next evaluation. The threshold minimizes the
sum of outside requests accepted and in-scope requests declined on this
development set; ties favor fewer false declines. Four outside requests
still passed. The one-question lead over BM25 on complete evidence is not
enough to claim a general improvement. These are retrieval counts, not
answer accuracy or a production threshold recommendation.

The 18 synthetic scenarios were not scored during Week 2. Their SHA-256 is
`0f9b683c28d9f9663f9c093ec7efdc89c3158997e65eabd644b183328043cc40`.

## Week 3 answer pipeline

`answer.py` uses the frozen k and threshold. Each detected question part
gets its own candidates. The app sends eligible parts together in one Groq
call and checks each returned passage against that part's candidates. It
shows a source summary for supported parts and says which parts could not be
verified. The splitter is heuristic, and a valid passage ID does not prove
relevance. Email and phone/long-digit redaction is not anonymization.

Run `python -m python_rag.evaluate_answers` to reproduce the offline run.
The [recorded results](../evaluation/results/python-week3-offline.json)
cover the frozen synthetic set. Python found all labeled evidence in 12/13
supported or mixed scenarios (JS scope wrapper: 1/13); both declined 5/5
unsupported requests. Python marked 2/3 mixed requests partial. P04 missed
one mediation provision. P11 found the case-search record but failed to
flag the request for a specific case outcome as unverified. The excerpt
fallback can also show unrelated candidates. Neither pipeline was tuned
after scoring this set.

Local warm processing took 0 to 31.2 ms per scenario, excluding startup
and network. Groq was mocked in tests; live answer quality and latency
were not measured.

## Consumer Law Guide

From the repository root, run:

```powershell
python -m streamlit run python_rag/guide_app.py
```

The coverage panel reads the corpus without loading MiniLM. The first
question loads the model and builds the index; later questions reuse both.
Without a Groq key, the guide displays labeled candidate excerpts rather
than a generated answer. The original `smoke_app.py` remains a separate
deployment check.

### Live release check

The [Streamlit preview](https://citation-grounded-legal-rag-zjsgsuk3a4u9glebbs7xnp.streamlit.app/)
opened without signing in. The form and source excerpts were readable at
desktop and 390 px widths. The Section 2(9) source card linked to the
official Act PDF, which returned HTTP 200. A mixed consumer-rights/RBI
question retained the Act source and flagged the RBI part. The RBI-only
question showed no source cards.

An earlier live run selected both Section 2(9) passages. The release check
fell back to candidate excerpts with a quote-mismatch diagnostic instead;
the deployed revision could not be confirmed. This is not a repeatable live
generation pass. Keep Vercel as the primary demo until a known deployment
revision passes the supported lookup consistently.
