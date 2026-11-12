# Citation-Grounded Legal RAG

**[Open the Consumer Law Guide](https://citation-grounded-legal-rag-zjsgsuk3a4u9glebbs7xnp.streamlit.app/)** · Streamlit demo

A Python application for looking up Indian consumer law. Ask about refunds, misleading ads, hidden charges, or filing a complaint. The guide searches a curated collection of official sources and shows the relevant provisions, excerpts, and links so you can check the answer yourself.

If Streamlit shows a wake screen, select the wake button and wait for the app to start.

## Try It

- My shopping app approved a refund. Do the E-Commerce Rules set a fixed deadline for payment?
- A retailer advertises a discount but expects to have very limited stock. What should the ad disclose?
- Which official portal lets me file a Consumer Commission complaint online?

## How It Works

1. **Retrieve sources.** The guide matches explicit section or rule references directly. For other questions, it uses MiniLM embeddings and FAISS to find relevant records.
2. **Check the evidence.** Groq selects supporting passages from the retrieved records. The app validates the selection before displaying a summary and its sources.
3. **Show what could be verified.** If only part of a question is supported, the guide identifies the gap. If passage selection is unavailable, it labels retrieved excerpts as candidates rather than presenting them as a verified answer.

## Source Coverage

The corpus includes selected provisions from the Consumer Protection Act, 2019, the E-Commerce Rules, advertising and dark-pattern guidelines, Consumer Commission jurisdiction rules, and official guidance from the National Consumer Helpline and e-Jagriti. Records include source links and effective dates. The guide does not search court judgments or predict case outcomes.

## Evaluation

| Test Run | Pass | Partial | Fail |
| --- | ---: | ---: | ---: |
| Hosted regression set, 50 questions | 43 | 2 | 5 |
| Hosted holdout set, 25 questions | 18 | 5 | 2 |
| Local regression retest with Groq, 50 questions | 48 | 2 | 0 |

The regression runs reused the same questions. A pass can include correctly declining an unsupported request. These scores describe specific test sets, not overall legal accuracy.

[Hosted regression report](docs/evaluation/live-guide-full-retest-results.md) · [Holdout report](docs/evaluation/guide-holdout-v1-results.md) · [Local retest report](docs/evaluation/guide-release-candidate-live.md)

## Run Locally

From the repository root, use Python 3.12 in a virtual environment:

```bash
python -m pip install -r python_rag/requirements.txt
python -m streamlit run python_rag/guide_app.py
```

Set `GROQ_API_KEY` in your local environment to enable passage selection. Without it, the app can still display candidate excerpts. The first search may download the embedding model.

**For research and education only. Not legal advice.**
