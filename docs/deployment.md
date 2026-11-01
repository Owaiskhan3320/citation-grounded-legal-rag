# Vercel Deployment

## Deployment model

The public site is served by Vercel. The browser sends a question to the same-origin `POST /api/ask` serverless function. That function retrieves relevant source records, sends only those records to Groq, validates citations in the model response, and returns the answer with its evidence.

The function does not use Ollama, a local database, or the raw NyayaAnumana files. If Groq is unavailable, incorrectly configured, rate-limited, or returns an uncited response, the API returns a verified retrieval fallback instead of an unsupported generated answer.

The API also applies a small per-instance limit of eight requests per minute by forwarded client address. This is basic quota protection, not a global abuse-control system; enable Vercel Firewall or an external shared rate-limit store before presenting the application as a production public service.

## Deploy the repository

1. Sign in to [Vercel](https://vercel.com/) with the GitHub account that owns this repository.
2. Select **Add New** > **Project** and import `Owaiskhan3320/citation-grounded-legal-rag`.
3. Leave the framework preset as **Other**. Vercel serves the root `index.html` and automatically recognises `api/ask.js` as a serverless function.
4. Before deploying, open **Environment Variables** and add the following production variables:

   ```text
   GROQ_API_KEY=<your Groq API key>
   GROQ_MODEL=openai/gpt-oss-20b
   ```

5. Deploy the `main` branch. Vercel will provide a `vercel.app` URL.
6. Open that URL, submit each of the three example questions, and confirm the status says `Groq answer with ... sources`.

Do not put a real key in `.env.example`, source files, GitHub Actions, screenshots, or a commit. If a key is accidentally exposed, revoke it in Groq immediately and replace the Vercel environment variable.

## Behaviour without a key

The site remains usable without `GROQ_API_KEY`. `/api/ask` returns a source-backed retrieval fallback and the interface tells the visitor that generation is unavailable. This makes local testing possible without sharing a secret.

## Pre-deployment checklist

- Run `node scripts/test-search.mjs`.
- Run `node scripts/test-rag.mjs`.
- Run `node scripts/test-api.mjs`.
- Run `node scripts/test-corpus.mjs` and `node scripts/test-issues.mjs`.
- Run `python scripts/validate_corpus.py` after installing `requirements-dev.txt`.
- Run `python -m unittest discover -s tests -v`.
- Confirm every generated answer exposes the official source record below it.
- Confirm unsupported questions return the no-answer message rather than an invented answer.
- Confirm no raw judgments, review sheets, or `.env` files appear in `git status`.
- Add the deployed URL and one interface screenshot to the README after deployment.

## Current scope limit

This branch has 90 current records from the Consumer Protection Act, E-Commerce Rules,
CCPA guidelines, commission jurisdiction rules and official NCH/e-Jagriti guidance.
Six replacement versions are excluded until 1 January 2027. The production site uses
the version on `main`, not an unmerged branch. Judgment search is not included.
