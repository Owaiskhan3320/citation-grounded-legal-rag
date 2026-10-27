# Citation-Grounded Legal RAG

A small, deployable legal RAG system for selected provisions of the Indian Consumer Protection Act, 2019 and Consumer Protection (E-Commerce) Rules, 2020. It retrieves source records before generation, requires model citations, and falls back to verified retrieval when generation cannot be trusted.

## What it does

```text
Question
  -> retrieve relevant statute records
  -> send only those records to Groq
  -> validate [S1], [S2], ... citations
  -> show answer and official sources
  -> fall back to source-backed retrieval on failure
```

Current coverage: 25 curated primary-source records.

- Definitions: Sections 2(6), 2(7), 2(9), and 2(47)
- Central Consumer Protection Authority: Sections 17 to 21
- Consumer complaint process: Sections 34, 35, 38, 39, 41, and 69
- E-commerce duties and consumer disclosures: Rules 2, 4, 5, 6, and 7

The records cover common questions about eligibility, consumer rights, class-wide complaints, unsafe goods, misleading advertisements, filing, forum, procedure, remedies, appeals, limitation, online-marketplace disclosures, seller obligations, refunds, and grievance handling. This is still a focused research corpus, not the complete Act or Rules.

When the current corpus does not support a question, the API returns a clear non-answer instead of generating from outside knowledge.

Primary sources:

- [Consumer Protection Act, 2019](https://www.indiacode.nic.in/bitstream/123456789/15256/1/a2019-35.pdf)
- [Consumer Protection (E-Commerce) Rules, 2020](https://consumeraffairs.nic.in/sites/default/files/E%20commerce%20rules_0.pdf)

## Run locally

The interface works locally without an API key; it will display the verified retrieval fallback.

```powershell
cd B:\Rag\consumer-law-research
python -m http.server 8080
```

Open `http://localhost:8080`.

Run all local checks with:

```powershell
node scripts/test-search.mjs
node scripts/test-rag.mjs
node scripts/test-api.mjs
python -m unittest discover -s tests -v
```

`scripts/test-search.mjs` includes a focused retrieval check for every curated provision and rule, plus common-language checks for consumer status, unsafe-goods recall, late complaints, marketplace refunds, seller response times, platform contacts, marketplace disclosures, and foreign platforms serving India.

## Groq and Vercel

Copy `.env.example` only for local reference; never commit a real key. In production, set `GROQ_API_KEY` and optionally `GROQ_MODEL` in Vercel Environment Variables. The API route is `POST /api/ask`.

See [the Vercel deployment guide](docs/deployment.md) for the full setup, fallback behaviour, and security checklist.

## Prepare judgment candidates locally

The NyayaAnumana source files remain outside the repository. Create an ignored review file with:

```powershell
python scripts/filter_consumer_cases.py `
  --source "B:\Dataset\CJPE_ext_SCI_HCs_tribunals_dailyorder_dev_wo_RoD_ternary (1).csv"
```

Export a review sheet from local candidates with:

```powershell
python scripts/export_review_sample.py `
  --source data/curated/consumer_dev_candidates.jsonl `
  --sample-size 50
```

Open `data/curated/consumer_case_review_sample.csv` in Excel. Mark each row `approved`, `rejected`, or `needs_review`, and add a short reason. Do not publish case search until approved rows have been reviewed for relevance, source provenance, and Act version.

## Data policy

- Do not commit raw judgments, downloaded PDFs, review sheets, or API keys.
- `data/raw/` and `data/curated/` remain local and ignored by Git.
- Publish only reviewed metadata, permitted excerpts, and source links.
- Keep Consumer Protection Act, 1986 decisions separate from Consumer Protection Act, 2019 material.

## Limitations

- This educational research prototype is not legal advice.
- It currently retrieves statutes only, not judgments.
- Groq free-tier availability and rate limits can affect generated answers; the retrieval fallback remains available.
- Users should verify the linked primary source and consult a qualified professional for legal decisions.
