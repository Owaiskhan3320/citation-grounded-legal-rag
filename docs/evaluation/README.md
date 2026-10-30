# Evaluation

This folder records manual evaluation runs for the deployed application. The aim is to make quality claims inspectable rather than relying on a few favourable examples.

## Run 3 baseline

[Run 3](run-3-2026-10-29.md) tested the same 50 consumer-law questions used in the two earlier runs. It was performed against the deployed application on 29 October 2026, after the Stage 3 source-backed reliability changes were merged.

Result: **45 of 50 core questions passed**, with four partial answers and one failure. This is a regression-suite result, not a measure of overall legal accuracy, unseen-question performance, or production readiness.

The report is preserved as captured. It records the exact prompts, visible responses, source cards, grading method, and remaining issues. Its count of displayed labels reflects records observed during that run; it is not the total number of curated records in the repository.

## Next evaluation step

The next evaluation uses [Unseen Evaluation Set 1](unseen-set-1.md): 20 independently checked questions written before the system is tested against them. It is kept distinct from the regression suite so that future work can be assessed for generalisation as well as regression prevention.

[Unseen Evaluation Set 1 results](unseen-set-1-results-2026-10-30.md) records the completed first-valid-answer run: 19 of 20 core questions passed, with one documented bait-and-switch retrieval failure.
