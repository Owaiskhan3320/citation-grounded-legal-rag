# Consumer Law Research

A source-backed research prototype for selected provisions of the Indian Consumer Protection Act, 2019.

## Current scope

- Exact and keyword-based statute lookup for selected consumer-law provisions.
- Direct links to the official Act source.
- Explicit non-answer behaviour when the curated statute records do not support a query.
- No generative AI or legal outcome prediction.

Judgment search is intentionally not enabled yet. The next milestone is to curate Consumer Disputes records from the NyayaAnumana dataset, validate their legal version and metadata, then add evidence-linked case search.

## Run locally

This is a dependency-free static site. From the project directory, run:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

Run the deterministic search checks with:

```powershell
node scripts/test-search.mjs
```

Run the data-pipeline unit test with:

```powershell
python -m unittest discover -s tests -v
```

## Prepare judgment candidates locally

The NyayaAnumana source files remain outside this repository. Create a local, ignored review file with:

```powershell
python scripts/filter_consumer_cases.py `
  --source "B:\Dataset\CJPE_ext_SCI_HCs_tribunals_dailyorder_dev_wo_RoD_ternary (1).csv"
```

For a quick smoke test against a small sample, add `--max-records 10`. The script writes JSONL to `data/curated/` by default and records an Act version only when the judgment text expressly mentions 1986 or 2019.

Create a review sheet from those local candidates with:

```powershell
python scripts/export_review_sample.py `
  --source data/curated/consumer_dev_candidates.jsonl `
  --sample-size 50
```

Open `data/curated/consumer_case_review_sample.csv` in Excel. Mark each row `approved`, `rejected`, or `needs_review`, and add a short reason. Do not publish case search until the approved rows have been reviewed for relevance, source provenance, and Act version.

## Data policy

- Do not commit raw judgment datasets or downloaded PDFs.
- Keep raw and intermediate data in `data/raw/` and `data/curated/`; both are ignored by Git.
- Publish only reviewed metadata, permitted excerpts, and source links.
- Label judgments under the Consumer Protection Act, 1986 separately from judgments under the 2019 Act.

## Planned milestones

1. Filter and review consumer-dispute judgment candidates.
2. Build a compact client-side search index.
3. Add related-decision results with source provenance.
4. Evaluate statute lookup and case retrieval against a hand-labelled benchmark.
5. Deploy the static site through Cloudflare Pages.

## Deployment

The planned deployment is a static Cloudflare Pages site, so it does not rely on a paid API or an application server staying awake. See [the deployment guide](docs/deployment.md) for the exact setup and pre-deployment checks.

## Limitation

This educational research prototype is not legal advice. Users should verify the linked primary source and seek qualified legal advice for decisions.
