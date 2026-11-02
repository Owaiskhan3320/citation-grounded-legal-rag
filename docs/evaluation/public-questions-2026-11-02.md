# Public-question retrieval check: 2 November 2026

## What was tested

Twenty distinct public Reddit scenarios, condensed and anonymised before scoring.
Fifteen have a partly supported consumer-law request; five need authorities absent
from the corpus. None of the fifteen is labelled fully answerable as written.
No Reddit replies were used as legal ground truth, and no posts were ingested.

The [questions and source links](../../evaluation/consumer-web-20.json),
[fingerprints](../../evaluation/consumer-web-20.lock.json),
[selection protocol](public-question-protocol.md) and adapter were committed in
`0af7a4c` before scoring. The source data, production retriever, method settings,
model revision and three-record limit were not changed. No question or label was
edited to improve a score. The historical 50-question report remains intact.

Sources were authored outside this project, but the exact prompts and labels are
agent-curated. Author identities, unaided human authorship and allegations are
unverified. Some source text was readable only through the search index. This is
a web-derived convenience sample, not an independent legal review or random user
study, and the posts may have appeared in an LLM's training data.

## Results

"All labelled evidence" means all groups needed for the chosen supported part.
It does **not** mean the original user's whole problem has been answered. An
unlabelled record can still be related or useful; these are not exhaustive
relevance judgements. Counts below must not be presented as answer accuracy.

| Method | At least one labelled group / 15 | All labelled evidence / 15 | Mean group recall@3 | Unsupported abstentions / 5 |
| --- | ---: | ---: | ---: | ---: |
| Current keyword/provision | 3 | 1 | 12.2% | 0 |
| BM25 | 10 | 2 | 37.8% | 0 |
| MiniLM dense | 8 | 4 | 37.8% | 0 |
| BM25 + dense RRF | 8 | 3 | 37.8% | 0 |

The rounded recall values coincide for the comparators, but the per-question
coverage differs. Complete supported-part coverage occurred on:

- Keyword: W12.
- BM25: W02, W13.
- Dense: W01, W02, W08, W12.
- Hybrid: W02, W08, W12.

All four returned candidate evidence for all five unsupported questions. Dense and
hybrid had no calibrated abstention gate; this measures that missing gate, not a
trained safety classifier. A candidate false match does not prove the generation
layer would hallucinate. No live Groq answers were generated or graded here.

The [complete raw run](../../evaluation/results/consumer-web-20-2026-11-02.json)
contains all rankings, grades, timing, source/model/scorer fingerprints and the
exact local vector-artifact checksum. The first keyword/BM25 run was retained
locally before the dense experiment; its rankings and grades match the full run.

## Why this differs from the 50-question set

The earlier agent-authored set mostly asked for a focused concept or provision.
These questions describe disputed transactions and mix several requests. Many
need procedural documents, regulator-specific rules, contract interpretation or
facts that the corpus cannot establish. They also require multiple evidence
groups to appear in a three-record result budget.

The new scores are not a measured performance regression caused by code changes:
production code did not change. They show that the earlier benchmark is not a good
proxy for this harder sample. Do not combine their scores into one accuracy claim.
Source choices and evidence labels are provisional; see the post-run review below.

### Post-run delegated review

The owner subsequently asked the implementation agent to perform the eight-row
check. That [review is complete](public-question-owner-review.md), but it is
post-scoring self-review, not independent human or professional legal validation.
W06 adds an unestablished signature fact, and W12 omits a claimed message-receipt
location relevant to the jurisdiction question. Several labels also require a
preferred help/explanation record rather than all potentially useful evidence.
The exact counts above remain provisional. Frozen questions, labels and raw
results were not changed; a later corrected version must disclose the revisions.

## Examples to inspect

| Question | Observation | Important limit |
| --- | --- | --- |
| W01: returned watch, refund rejected, NCH already tried | Dense found the refund/remedies and escalation evidence. Keyword found related seller-refund cards, but not the labelled escalation/remedies combination. | This does not prove what was returned or provide an actual similar judgment. |
| W03: warranty repair, filing documents, costs and duration | No method found all three labelled groups. | We lack a verified fee/checklist source and a realistic case-duration estimate. |
| W04/W05: subscription charging/renewal dispute | No method found the labelled grievance/deficiency combination. Subscription dark-pattern cards appeared instead. | A charge after a cancellation allegation is not by itself proof of a dark pattern or a bank-mandate failure. |
| W06: offline car-booking WhatsApp cancellation terms | All methods missed the unfair-contract record; several retrieved online cancellation or pricing material. | Online-platform rules must not automatically be applied to an offline showroom transaction. |
| W11: filing stuck in portal scrutiny | No method retrieved the labelled admission/help combination. | A portal status alone does not prove formal completion or deemed admission. |
| W12: present address and notarised affidavit | Keyword, dense and hybrid found the labelled jurisdiction/help combination. | The corpus cannot verify that the registry accepts the proposed affidavit. |
| W13: appeal form asks for a different Commission's order | BM25 found the appeal/help combination; dense and hybrid missed the help record. | We cannot diagnose the selected form or certify document requirements. |
| W14: expired warranty | No method found the defect/limitation combination. | Individual entitlement still requires missing dates, terms and facts. |
| W15: wrong product, NCH unsuccessful, how to file | No method found the three labelled route/filing/help groups. | A full filing workflow needs better procedural source coverage. |
| W16-W20: RBI, data deletion/retention, tenancy, food labels | Every method returned candidates despite the requested authority being absent. | Generic consumer provisions cannot establish the requested regulator-specific answer. |

## Timing and setup

Same pinned MiniLM revision, BM25 parameters and RRF configuration as Week 3.
Windows, Intel i5-1235U, Node 24.22.1, CPU embeddings with four threads.

| Method | Median query time | p95 query time |
| --- | ---: | ---: |
| Keyword | 2.46 ms | 3.71 ms |
| BM25 | 0.59 ms | 1.05 ms |
| Dense | 65.23 ms | 71.45 ms |
| Hybrid | 65.91 ms | 72.50 ms |

Dense/hybrid times include single-query encoding; document indexing and module
startup are separate. Library imports took 151.73 seconds in this environment,
the cached model constructor 1.51 seconds, and document encoding 4.37 seconds.
No document or query input was truncated. These are single local measurements,
not hosted latency, a cold-start guarantee or a load test.

## Decision and review

Do not switch production to embeddings or hybrid on these results. Retrieval
coverage and abstention are both inadequate for the practical questions sampled.
Adding a vector database would not address the missing authorities or scope
decisions demonstrated here.

Next work should separate a practical request into its supported and unsupported
parts, improve official filing/workflow coverage where justified, and prevent
unrelated provisions from being presented as sufficient evidence. Retrieval
changes then need a new untouched test set as well as these regression examples.
Do not tune thresholds on these questions and report that as unseen performance.

[The delegated eight-row review](public-question-owner-review.md) documents the
prompt corrections and label qualifications. The requested review task is complete;
independent owner approval and professional legal validation were not performed.
The original raw metadata remains a snapshot of the pre-review run. Preserve this
run and document any later prompt/label corrections in a new version.

## Reproduce

Without models, keys or network calls:

```powershell
node scripts/test-public-evaluation.mjs
node scripts/evaluate-public-questions.mjs --check
```

Optional local embedding run using the existing `requirements-eval.txt` environment:

```powershell
python scripts/export_public_embeddings.py
node scripts/evaluate-public-questions.mjs --embeddings tmp/evaluation/public-embeddings.json --output tmp/evaluation/public-rerun.json
```

The encoder defaults to the cached pinned model. Add `--allow-download` only if it
is not cached. Keep vectors/model weights under the ignored local `tmp`/model
cache locations, and do not overwrite the first committed result for a nicer run.
