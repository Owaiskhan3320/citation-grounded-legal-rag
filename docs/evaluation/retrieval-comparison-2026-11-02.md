# Offline retrieval comparison: 2 November 2026

## Setup

90 active records, 40 supported questions and 10 questions outside the corpus.
The implementation agent authored the questions and labels after seeing the
corpus. **This is not an independent human holdout or a generated-answer score.**
Zero of the requested 20 independently authored questions have been supplied.

The [questions](../../evaluation/consumer-50.json),
[input fingerprints](../../evaluation/consumer-50.lock.json) and
[protocol](retrieval-protocol.md) were committed in `35a9c33` before scoring.
Production retrieval and source data are unchanged from merged Week 2 (`1f83b6f`).
No question, label, keyword, threshold or model setting was adjusted after scoring.
The [raw run](../../evaluation/results/consumer-50-2026-11-02.json) includes every
question's retrieved IDs, grade, timing and the exact model revision.
After code review, report-integrity checks and artifact fingerprints were added;
they do not alter ranking, labels or metric formulae. The re-recorded run's
rankings/grades match the first saved run. No model was re-encoded for that update.

## Results

Top three means the maximum three evidence records currently passed to generation.
Complete evidence requires every labelled group, not just one relevant record.

| Method | Relevant first / 40 | Complete evidence in top 3 / 40 | Mean evidence recall@3 | MRR@3 | Out-of-scope abstentions / 10 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Current keyword/provision | 25 | 30 | 77.9% | 0.704 | 2 |
| BM25 | 32 | 35 | 89.2% | 0.846 | 0 |
| MiniLM dense | 30 | 37 | 93.3% | 0.846 | 0 |
| BM25 + dense RRF | 31 | 37 | 94.2% | 0.858 | 0 |

The keyword retriever returned candidates for 8 of 10 unsupported questions.
BM25 returned candidates for all 10. Dense and hybrid were deliberately tested
without an abstention threshold and always return candidates. This exposes a
missing safety gate, not evidence that those candidates became hallucinated
answers: no generated answers were tested in this run.

The result does not mean the live app is 75% legally accurate, or that adding
embeddings makes it 92.5% accurate. These are labelled evidence-retrieval counts
on one small, agent-authored English set, with no independent legal review.

## Timing

Windows x64, Intel i5-1235U, Node 24.22.1, CPU embeddings with four PyTorch threads.
Each query was timed once after warmup; p95 here is descriptive, not a load test.

| Method | Median query time | p95 query time |
| --- | ---: | ---: |
| Current keyword/provision | 1.48 ms | 2.28 ms |
| BM25 | 0.27 ms | 0.60 ms |
| MiniLM dense | 39.62 ms | 48.55 ms |
| Hybrid | 39.90 ms | 48.90 ms |

Dense/hybrid timings include single-query encoding and ranking. BM25's index was
built before timing, whereas the existing application reloads/maps the small
in-memory corpus during each retrieval call. These are the tested implementations,
not an assertion that BM25 is inherently faster than keyword matching.

The cached model constructor took 1.08 seconds and encoding 90 documents took
4.44 seconds. These exclude Python/library imports and downloads. Initial library
startup was noticeably slow in this environment and was not separately timed;
the constructor time must not be presented as a full cold start. No inputs were
truncated at MiniLM's 256-token limit. No provider, Vercel or Groq latency is included.

## Failures worth keeping

| Question | Current keyword result | Comparator observations |
| --- | --- | --- |
| C01: sewing machine used for self-employment | Missed the consumer definition | All four missed it. The metadata summary does not explain the livelihood exception, although the source quotation does. |
| C02: faulty goods versus poor service | Found deficiency, not defect | BM25, dense and hybrid found both labelled definitions. |
| C06/C07: local filing and an explained delay | Returned the generic filing provision | All comparators found the specific labelled provisions. |
| C29: tiny fine print rescuing a misleading claim | Returned general advertising powers | Dense found the specific disclaimer record. BM25 and hybrid missed it; a broad record's fragment does not contain the full checkpoint. |
| C32: fake antivirus installation | Returned general unfair trade practice | All comparators found rogue malwares. |
| C34: guilt-inducing refusal button | Missed confirm shaming | Dense and hybrid found it; BM25 also missed it. |
| C35: obstructive cancellation | Missed subscription trap | All comparators found it. |
| C37: tracking a helpline grievance | Returned registration-related records | All comparators found the actual tracking record. |
| C40: three simultaneous dark patterns | Found two of three | No comparator found all three within the evidence limit. |
| C13: conditions for seller product liability | Found the seller-specific provision | Dense regressed and missed it; BM25 and hybrid retained it. |

The exact previously observed query, "How long does an e-commerce platform have
to acknowledge and resolve a consumer complaint?", still retrieves the filing
provision. It was already known before this benchmark, so it was not inserted as
an unseen test. C18 uses different wording on the same topic and passes; that
does not repair or erase the known failure.

Out-of-scope failures include unsupported RBI reversal rules, FSSAI labelling,
Legal Metrology penalties, privacy law, judgments and a guaranteed compensation
prediction. The full list is retained in the raw run rather than omitted from the
headline counts.

## Decision

Keep the deployed retriever unchanged in this PR. BM25 is a useful low-cost
candidate, and embeddings improve this set's evidence coverage, but neither is
ready to replace production retrieval on this evidence alone. In particular:

- Obtain at least 20 independently authored questions before making generalisation claims.
- Use separate development data to design and calibrate scope/abstention handling.
- Check the existing explicit-provision regressions before adopting a comparator;
  this lay-phrased set does not establish that section lookups will remain correct.
- Investigate missing evidence for combined questions without silently raising the
  evidence limit or fitting thresholds to these test results.
- Re-evaluate generated answers separately, including fallback relevance and
  claim-level support. Valid citation IDs do not establish entailment.

No vector database, hosted embedding call, production model change or new runtime
dependency was added. MiniLM is only an optional local experiment. This set is now
development evidence; future tuning on its failures needs another untouched set.

### Label erratum

Agent review found that C26 should also accept `marketplace-disclosures`: its
quotation contains the same complete written-request provision as the focused
`marketplace-post-purchase-seller-details` record. The frozen label has not been
edited after scoring. All four methods retrieved the accepted focused record, so
the omission does not change any current counts. Add the alternative in the next
documented benchmark version, before using that version for comparison. This
review is not independent human or professional legal validation.

## Reproduce

Lightweight checks, without model downloads or API calls:

```powershell
node scripts/test-evaluation.mjs
node scripts/evaluate-retrieval.mjs --check
node scripts/evaluate-retrieval.mjs --output tmp/evaluation/lexical-rerun.json
```

Optional CPU embedding comparison. Use a separate local environment if desired;
these dependencies are not installed by CI or deployed with the app:

```powershell
python -m pip install -r requirements-eval.txt
python scripts/export_embeddings.py --allow-download
node scripts/evaluate-retrieval.mjs --embeddings tmp/evaluation/embeddings.json --output tmp/evaluation/full-rerun.json
```

The download flag allows fetching the pinned public model; omit it when that
revision is already cached. Keep the first committed run intact. Timings will vary
between runs and machines; CI compares deterministic keyword/BM25 rankings, not
timings, and does not rerun embeddings.
