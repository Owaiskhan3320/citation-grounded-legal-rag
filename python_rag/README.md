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
