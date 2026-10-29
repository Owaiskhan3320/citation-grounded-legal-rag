# Evaluation

This folder records manual evaluation runs for the deployed application. The aim is to make quality claims inspectable rather than relying on a few favourable examples.

## Run 3 baseline

[Run 3](run-3-2026-10-29.md) tested the same 50 consumer-law questions used in the two earlier runs. It was performed against the deployed application on 29 October 2026, after the Stage 3 source-backed reliability changes were merged.

Result: **45 of 50 core questions passed**, with four partial answers and one failure. This is a regression-suite result, not a measure of overall legal accuracy, unseen-question performance, or production readiness.

The report is preserved as captured. It records the exact prompts, visible responses, source cards, grading method, and remaining issues. Its count of displayed labels reflects records observed during that run; it is not the total number of curated records in the repository.

## Next evaluation step

The next evaluation will use a separate set of independently checked questions written before the system is tested against them. That set will be kept distinct from this regression suite so that future fixes can be assessed for generalisation as well as regression prevention.
