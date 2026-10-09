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

## Limitation

This educational research prototype is not legal advice. Users should verify the linked primary source and seek qualified legal advice for decisions.
