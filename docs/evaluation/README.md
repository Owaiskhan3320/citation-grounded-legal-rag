# Evaluation

This folder records evaluation runs for the deployed application. The aim is to make quality claims inspectable rather than relying on a few favourable examples.

## Consumer Law Guide: live and offline

- [50-case live regression retest](live-guide-full-retest-results.md): 43 pass, 2 partial, 5 fail.
- [Frozen 25-case holdout](guide-holdout-v1-results.md): 18 pass, 5 partial, 2 fail, with a separate offline retrieval trace. The report identifies material limitations and the release decision.

## Current corpus: offline retrieval

The [request-scope follow-up](request-scope-development.md) records the new API and
browser behavior. It is a development run on known questions, not an unseen test.
The historical keyword experiments below still run their original code and do
not measure the new live wrapper. The follow-up records both improved known
rejections and the cost of declining some partly supported requests.

The [public-question check](public-questions-2026-11-02.md) uses 20 externally posted
scenarios, selected and anonymised before scoring. Fifteen are only partly
answerable and five request authorities outside the corpus. The measured evidence
coverage is much weaker than on the focused agent-authored set. Source access and
every failure are documented. The [delegated agent review](public-question-owner-review.md)
is complete and records prompt corrections and label limitations without changing
the frozen run. It is not independent owner approval or professional legal validation.

The [2 November comparison](retrieval-comparison-2026-11-02.md) evaluates 50 frozen
questions against the versioned 90-record corpus. It compares the actual keyword
retriever, BM25, MiniLM embeddings and reciprocal rank fusion. The report includes
every evidence miss and the poor out-of-scope abstention results. No generated
answers were evaluated and no production retriever was changed.

The [protocol](retrieval-protocol.md) and questions were committed before scoring.
The implementation agent wrote them: **they are not an independent human holdout**.
The public-source prompts above address external authorship of scenarios, but their
condensing and labelling have since received a qualified agent self-review, not
independent validation. These results and the
older reports below should not be combined into an overall accuracy figure.

## Run 3 baseline

[Run 3](run-3-2026-10-29.md) tested the same 50 consumer-law questions used in the two earlier runs. It was performed against the deployed application on 29 October 2026, after the Stage 3 source-backed reliability changes were merged.

Result: **45 of 50 core questions passed**, with four partial answers and one failure. This is a regression-suite result, not a measure of overall legal accuracy, unseen-question performance, or production readiness.

The report is preserved as captured. It records the exact prompts, visible responses, source cards, grading method, and remaining issues. Its count of displayed labels reflects records observed during that run; it is not the total number of curated records in the repository.

## Earlier unseen-set run

The next evaluation uses [Unseen Evaluation Set 1](unseen-set-1.md): 20 independently checked questions written before the system is tested against them. It is kept distinct from the regression suite so that future work can be assessed for generalisation as well as regression prevention.

[Unseen Evaluation Set 1 results](unseen-set-1-results-2026-10-30.md) records the completed first-valid-answer run: 19 of 20 core questions passed, with one documented bait-and-switch retrieval failure.

## Stage 4 re-run

[The Stage 4 re-run](unseen-set-1-stage4-results-2026-10-31.md) used the same frozen 20-question set after the targeted source-card and retrieval fixes were merged. All **20 of 20** core checkpoints passed, including the formerly failing bait-and-switch scenario. Eight responses still displayed nonessential source cards, so this is evidence of improved core retrieval coverage, not a claim of perfect retrieval precision or overall legal accuracy.
