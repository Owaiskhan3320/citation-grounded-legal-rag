# Retrieval comparison protocol

Frozen on 2 November 2026, before running the new comparison. This is an offline
retrieval experiment, not a generated-answer evaluation or a legal-accuracy score.

## Questions and labels

`evaluation/consumer-50.json` contains 40 English lay-phrased questions and 10
questions outside the available evidence. The implementation agent wrote these
after inspecting the corpus and existing regressions. They are not independently
authored, legally reviewed or a blind human holdout. None of the 20 requested
independent questions has been supplied. Do not describe this run as that holdout.

Each required-evidence group needs one of its record IDs. Multiple groups mean
all are needed: for example, the combined dark-pattern question needs three
records. Labels identify minimum sufficient evidence, not every arguably relevant
card. Read the checkpoint and source passages when disputing a label.

Questions and labels are frozen before scoring. No keywords, production retrieval
rules, model weights, thresholds or labels will be tuned on these 50 results.
After this run they are a development/regression set. A later independent set must
be written without consulting the keywords or these questions, labelled before
scoring, and kept separate from any tuning set.

The previously observed platform-deadline failure is a known development example,
not an unseen question. The new set includes another question on that topic; its
author's prior knowledge is part of the authorship limitation above.

## Fixed experiment

- Use the 90 records active on `2026-11-02`. Exclude future versions exactly as the
  application does. Fingerprint the benchmark, corpus, source manifest, loader and
  production retrieval files. Never replace a frozen lock to conceal changes.
- Keyword: call the application's actual `retrieveEvidence()` unchanged.
- BM25: use unique lowercase alphanumeric query tokens, the stop list documented
  in `scripts/retrieval-metrics.mjs`, `k1=1.5`, `b=0.75`, and the positive IDF
  `ln(1 + (N - df + 0.5)/(df + 0.5))`. Return positive-scoring documents only.
- Dense: encode the same section, title, summary and keywords used by BM25 and
  the production search field, in that order. Use the pinned MiniLM revision in
  the benchmark, L2 normalisation, CPU inference and dot product (cosine on unit
  vectors). Record input truncation rather than silently ignoring it.
- Hybrid: reciprocal rank fusion of BM25 and dense rankings, constant 60, depth
  equal to corpus size. No reranker, exact-section boost or learned weights.
- Compare at three evidence records, matching the API's current limit. Break
  equal comparator scores by record ID. Keep production's own ordering intact.
- No score threshold is fitted to this set. Dense and hybrid are unthresholded
  rankers: they always produce candidates, even outside scope. Their abstention
  result describes that missing gate, not a calibrated safety classifier.

## Metrics

For the 40 supported questions, report hit@1, mean per-question evidence-group
recall@3, complete evidence@3 and MRR@3 (zero if no labelled evidence is in top 3).
A single relevant record does not count as complete for a combined question.

For the other 10 questions, report empty-result abstentions and false matches.
A false match is a retrieval candidate, not proof the model would hallucinate:
generation may still refuse. Conversely, valid citation IDs do not prove a claim
is supported. This script does not grade generated answers or legal correctness.

Warm each retriever before timing. Query latency includes single-query embedding
encoding for dense/hybrid, but not model download/load or document indexing; report
those costs separately. Local CPU timings are not Vercel or hosted-provider latency.
Persist per-question rankings and grades, including failures; do not report only
the aggregate that favours the most complex method.

## Decision and CI

Publish the comparison whichever method wins. Do not add a vector database or
hosted embedding dependency just to claim a hybrid architecture. An apparent
recall improvement on this agent-authored set is insufficient for adoption without
independent questions, acceptable abstention and a deployment/cost check.

CI runs keyword and BM25 only, without network calls, keys, models or Groq. It
checks frozen inputs and per-question rankings against the committed run. A ranking
change (including an improvement) needs an inspected new run and an explained
version update. Known failures remain visible; CI success is not 100% accuracy.
Embedding checks are optional local commands; model weights/vectors stay untracked.

References: [BM25](https://nlp.stanford.edu/IR-book/html/htmledition/okapi-bm25-a-non-binary-model-1.html),
[MiniLM model card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2),
[Sentence Transformers similarity](https://www.sbert.net/docs/sentence_transformer/usage/semantic_textual_similarity.html),
[reciprocal rank fusion paper](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf).
