# Unseen Evaluation Set 1: Results

Tested against the deployed application on 30 October 2026, after the 20 prompts and checkpoints in [Unseen Evaluation Set 1](unseen-set-1.md) had been merged. The evaluated application code was the Stage 3 source-backed reliability build from PR #6; PRs #7 and #8 added documentation only.

## Outcome

**19 of 20 core questions passed. One question failed because the expected bait-and-switch record was not retrieved.**

| Metric | Result |
| --- | ---: |
| Core pass | 19 / 20 |
| Partial | 0 / 20 |
| Fail | 1 / 20 |
| Generated answers | 17 |
| Retrieval fallbacks | 3 |
| Answers with a supporting displayed card | 19 / 20 |
| Retrievals containing the expected record | 19 / 20 |

This is a small, same-domain generalisation check. It provides evidence beyond the known 50-question regression suite, but it is not a measure of overall legal accuracy, unseen-domain performance, or production readiness.

## Operational Note

The first automated batch triggered the public API's request limit after eight requests. U09–U14 initially returned HTTP `429`, and the connection reset before U14 returned a response. Those events contained no legal answer and were not graded. After a full cooldown, the affected prompts were submitted once more at a slower pace; the first valid content response was retained. This exception means the run should be read as a **first-valid-answer** evaluation rather than a strict one-request-per-prompt evaluation.

## Results By Question

| ID | Mode | Grade | Retrieval | Citation/card support | Notes |
| --- | --- | --- | --- | --- | --- |
| U01 | Generated | Pass | Adequate | Supported | Correctly identified a written product-liability allegation as a complaint. |
| U02 | Fallback | Pass | Adequate | Supported | Correctly covered unfair or deceptive methods and false representations. |
| U03 | Fallback | Pass | Adequate, noisy | Supported | Section 18 answered the question; Sections 17 and 20 were unnecessary extra cards. |
| U04 | Generated | Pass | Adequate, noisy | Supported | Section 20 supported withdrawal of unsafe services and reimbursement; Section 21 was unnecessary. |
| U05 | Generated | Pass | Adequate | Supported | Correctly gave the 30-day response period and possible 15-day extension. |
| U06 | Generated | Pass | Adequate | Supported | Correctly covered digital or electronic networks and marketplace and inventory models. |
| U07 | Generated | Pass | Adequate, noisy | Supported | Rule 4(2) answered the question; Rule 4(4) was an unnecessary extra card. |
| U08 | Generated | Pass | Adequate, noisy | Supported | Correctly cited Rule 5 for ranking parameters, despite two irrelevant cards. |
| U09 | Generated | Pass | Adequate | Supported | Correctly prohibited seller impersonation, false reviews, and misrepresentation. |
| U10 | Generated | Pass | Adequate, noisy | Supported | Correctly covered charges, total price, and complaint tracking; Rule 6(5) was unnecessary. |
| U11 | Generated | Pass | Adequate | Supported | Correctly rejected exaggerated scientific validity or performance claims. |
| U12 | Generated | Pass | Adequate | Supported | Correctly covered commercial intent, language, font, and inconspicuous presentation. |
| U13 | Generated | Pass | Adequate | Supported | Correctly required a disclosed stock limitation for the low-price offer. |
| U14 | Generated | Pass | Adequate | Supported | Correctly covered due diligence and disclosure of an unexpected material connection. |
| U15 | Generated | Pass | Adequate | Supported | Correctly covered children's vulnerability or lack of experience and scientific substantiation. |
| U16 | Generated | Pass | Adequate, noisy | Supported | Correctly identified subscription trap; two extra cards were irrelevant. |
| U17 | Generated | Pass | Adequate, noisy | Supported | Correctly identified basket sneaking; two extra cards were irrelevant. |
| U18 | Generated | Pass | Adequate, noisy | Supported | Correctly identified drip pricing; two extra cards were irrelevant. |
| U19 | Generated | Pass | Adequate | Supported | Correctly identified a disguised advertisement. |
| U20 | Fallback | Fail | Missing expected record | Not supported | The answer did not identify bait and switch. The dedicated bait-and-switch record exists in the corpus but was not retrieved. |

## What This Changes

- The system answers most newly phrased questions in its current consumer-law scope with relevant cited evidence.
- Retrieval precision still needs work: seven passing answers included unnecessary evidence cards.
- The U20 failure is a concrete Stage 4 retrieval regression: wording about an unavailable low-priced item and a more expensive alternative did not retrieve the bait-and-switch record.
- No application code was changed as a result of this run. The next code change should address known retrieval and source-coverage issues in a separate Stage 4 PR.
