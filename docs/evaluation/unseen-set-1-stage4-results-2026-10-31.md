# Unseen Evaluation Set 1: Stage 4 Re-run

This report records a deployed re-run of the frozen prompts and legal checkpoints in [Unseen Evaluation Set 1](unseen-set-1.md). It was performed on 31 October 2026 after the Stage 4 retrieval and source-coverage fixes were merged into `main`.

## Outcome

**All 20 of 20 core questions passed.** The formerly failing U20 bait-and-switch scenario retrieved its dedicated record and was answered correctly.

| Metric | Result |
| --- | ---: |
| Core pass | 20 / 20 |
| Partial | 0 / 20 |
| Fail | 0 / 20 |
| Generated answers | 18 |
| Retrieval fallbacks | 2 |
| Answers with a supporting displayed card | 20 / 20 |
| Retrievals containing the expected record | 20 / 20 |
| Retrievals with nonessential extra cards | 8 / 20 |

This is a small, same-domain generalisation check. It shows that the targeted Stage 4 changes fixed the observed gaps in this set. It does not measure overall legal accuracy, unseen-domain performance, model reliability over time, or production readiness.

## Method And Operational Note

The prompts and checkpoints were written before this re-run and were not changed. Requests were made to the deployed API in short batches with an eight-second delay after each request, below the endpoint's eight-requests-per-minute limit.

An earlier bulk automation attempt was unusable because the execution environment did not retain its client output. It may have reached the endpoint: the next two test requests received HTTP `429` responses. Those responses contained no legal answer and were not graded. After a full cooldown, every prompt was submitted once in the controlled run reported here. The first content response from that controlled run was retained for each prompt; no answer was retried or selected for a more favourable result.

`Pass` means the core checkpoint was answered correctly with relevant displayed evidence. `Adequate, noisy` means the expected record was present and supported the answer, but one or more nonessential records were also displayed. This evaluates the project's narrow Consumer Protection Act, e-commerce, advertisement, and dark-pattern corpus; it is not legal advice.

## Results By Question

| ID | Mode | Grade | Retrieval | Citation/card support | Notes |
| --- | --- | --- | --- | --- |
| U01 | Generated | Pass | Adequate | Supported | Correctly treated a written product-liability allegation as a complaint. |
| U02 | Fallback | Pass | Adequate | Supported | Covered unfair or deceptive methods and false representations. |
| U03 | Generated | Pass | Adequate, noisy | Supported | Section 18 supported safety notices; Sections 17 and 20 were extra. |
| U04 | Generated | Pass | Adequate, noisy | Supported | Section 20 supported withdrawal and reimbursement; Section 21 was extra. |
| U05 | Generated | Pass | Adequate, noisy | Supported | Correctly gave 30 days and up to a 15-day extension; Sections 2(6) and 35 were extra. |
| U06 | Generated | Pass | Adequate | Supported | Correctly covered the Rules' digital or electronic-network scope and marketplace and inventory models. |
| U07 | Generated | Pass | Adequate | Supported | Correctly covered legal name, addresses, website, and customer-care or grievance contacts. |
| U08 | Generated | Pass | Adequate, noisy | Supported | Rule 5 supported ranking-parameter explanation; Rule 6(3) and Rule 2 were extra. |
| U09 | Generated | Pass | Adequate | Supported | Correctly covered impersonation, self-reviews, and misrepresentation restrictions. |
| U10 | Fallback | Pass | Adequate, noisy | Supported | Rule 7(1) covered charges and complaint tracking; Rule 6(5) was extra. |
| U11 | Generated | Pass | Adequate | Supported | Correctly rejected exaggerated scientific validity or performance claims. |
| U12 | Generated | Pass | Adequate | Supported | Correctly covered commercial intent, language, font, and conspicuous presentation. |
| U13 | Generated | Pass | Adequate | Supported | Correctly required a disclosed stock limitation for the low-price offer. |
| U14 | Generated | Pass | Adequate | Supported | Correctly covered due diligence, genuine current opinion, and disclosure of an unexpected material connection. |
| U15 | Generated | Pass | Adequate | Supported | Correctly covered child vulnerability and scientific substantiation. |
| U16 | Generated | Pass | Adequate, noisy | Supported | Subscription trap was correctly identified; generic dark-pattern and drip-pricing cards were extra. |
| U17 | Generated | Pass | Adequate, noisy | Supported | Basket sneaking was correctly identified; generic dark-pattern and Section 2(28) cards were extra. |
| U18 | Generated | Pass | Adequate, noisy | Supported | Drip pricing was correctly identified; the generic dark-pattern card was extra. |
| U19 | Generated | Pass | Adequate | Supported | Disguised advertisement was correctly identified. |
| U20 | Generated | Pass | Adequate | Supported | Bait and switch was correctly identified from its dedicated source record. |

## Comparison With The Prior Run

| Metric | Day 3 | Stage 4 re-run |
| --- | ---: | ---: |
| Core pass | 19 / 20 | 20 / 20 |
| Fail | 1 / 20 | 0 / 20 |
| Expected-record retrieval | 19 / 20 | 20 / 20 |
| Generated answers | 17 | 18 |
| Retrieval fallbacks | 3 | 2 |

The only failed core checkpoint in the Day 3 run was U20. Stage 4 added source-specific bait-and-switch phrases and regression coverage, and U20 then retrieved the expected record. Extra-card retrieval noise remains a separate precision issue and is deliberately not presented as solved.
