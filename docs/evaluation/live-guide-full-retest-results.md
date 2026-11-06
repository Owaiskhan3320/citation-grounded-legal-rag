# Full live retest after the mixed-question fixes

On 2026-11-06, the [deployed Consumer Law Guide](https://citation-grounded-legal-rag-zjsgsuk3a4u9glebbs7xnp.streamlit.app/) was tested after [PR #22](https://github.com/Owaiskhan3320/citation-grounded-legal-rag/pull/22), release revision `f292d43`. The same [50 prompts and expected behaviors](live-guide-day1-questions.md) were submitted once each in the original order. The submitted wording matched the benchmark file. Requests were spaced at least about 8.5 seconds apart; there were no HTTP 429 or other provider errors in the visible responses.

Grades use the [Day 1 rubric](live-guide-day1-results.md). The counts are outcomes for this fixed benchmark, not an estimate of overall legal accuracy. A correct decline counts as a pass on a fully out-of-scope question.

| Group | Cases | Day 1: pass / partial / fail / rate-limited | Retest: pass / partial / fail / rate-limited |
| --- | ---: | --- | --- |
| Shopping | 12 | 11 / 1 / 0 / 0 | 11 / 1 / 0 / 0 |
| Complaints | 12 | 3 / 2 / 2 / 5 | 8 / 1 / 3 / 0 |
| Ads and dark patterns | 10 | 3 / 1 / 2 / 4 | 8 / 0 / 2 / 0 |
| Multi-part | 8 | 1 / 6 / 1 / 0 | 8 / 0 / 0 / 0 |
| Out of scope | 8 | 8 / 0 / 0 / 0 | 8 / 0 / 0 / 0 |
| **Total** | **50** | **26 / 10 / 5 / 9** | **43 / 2 / 5 / 0** |

## What changed

- All 26 Day 1 passes passed again. Of 17 new passes, eight were previously rate-limited and nine were previously partial or failed. D21, previously rate-limited, answered the wrong procedural question in this run.
- All eight mixed questions passed, compared with one on Day 1. All eight fully out-of-scope questions still received clean declines.
- Both runs left D08 partial. D20 now gives the correct appeal destination and deadline, but also incorrectly reports that the deadline part is unverified.
- Next priority: D23, the false decline on the self-employment exception, and D21, the non-answer on unresolved mediation issues. D13 (helpline versus Commission filing), D25 (fabricated scarcity), and D28 (confirm shaming) also failed. The live run shows the outcomes, not which pipeline stage caused each miss.

## Per-question scorecard

| ID | Day 1 | Retest | Observed live result |
| --- | --- | --- | --- |
| D01 | Pass | Pass | Rule 6(3) covered misdescribed goods and the seller's return or refund duty. A separate inventory rule followed the correct answer. |
| D02 | Pass | Pass | Rule 4(10) gave a reasonable or prescribed period, not a universal number of days. |
| D03 | Pass | Pass | Rule 4(8) explained reciprocal cancellation charges. |
| D04 | Pass | Pass | Rule 4(9) said a pre-ticked box does not record affirmative consent. |
| D05 | Pass | Pass | Rule 5(3)(a) gave the seller's address and contact information after a written post-purchase request. |
| D06 | Pass | Pass | Rule 4(5) gave the platform's 48-hour acknowledgment and one-month redress deadlines. |
| D07 | Pass | Pass | Rule 6(4) gave the marketplace seller's acknowledgment and redress deadlines. |
| D08 | Partial | Partial | Rule 6(5) gave pre-purchase return-shipping disclosure, but the answer led with the inventory-platform rule and split off the marketplace context. |
| D09 | Pass | Pass | Rule 5(2) required the marketplace to obtain an undertaking on listing accuracy. |
| D10 | Pass | Pass | Rule 2 covered entities outside India that systematically offer goods or services to Indian consumers. |
| D11 | Pass | Pass | Rule 7(2)-(5) explained why vouching for authenticity matters, without deciding liability. |
| D12 | Pass | Pass | Rule 6(3) explained the force-majeure exception for late delivery. |
| D13 | Fail | Fail | Declined without distinguishing the National Consumer Helpline from filing before a Commission. |
| D14 | Pass | Pass | Directed the user to Track your Grievance. |
| D15 | Rate-limited | Pass | Explained that NCH issues a docket number, forwards the grievance, and records updates. |
| D16 | Pass | Pass | Named e-Jagriti as the official online complaint route and cited the NIC overview. |
| D17 | Rate-limited | Pass | Pointed to official e-Jagriti help documents and videos via the Commission's resources. |
| D18 | Rate-limited | Pass | Section 34 included the complainant's residence or place of work, subject to jurisdiction. |
| D19 | Pass | Pass | Section 69 gave the usual two years and the sufficient-cause and recorded-reasons conditions. |
| D20 | Partial | Partial | Section 41 gave the State Commission and 45 days, but the separately split deadline question was marked unverified, contradicting that answer. |
| D21 | Rate-limited | Fail | Cited Section 80 about signing and reporting a settlement, but did not answer what happens to unresolved issues under Section 81. |
| D22 | Rate-limited | Pass | Section 39 identified replacement and refund as possible remedies, not automatic outcomes. |
| D23 | Fail | Fail | Declined without showing the Section 2(7) livelihood-by-self-employment exception. |
| D24 | Partial | Pass | Section 36 gave the ordinary 21 days and deemed admission if no decision is made. |
| D25 | Fail | Fail | Returned the general dark-pattern definition and an inventory rule without naming False urgency. |
| D26 | Partial | Pass | Identified Basket sneaking without the unrelated Confirm shaming classification. |
| D27 | Rate-limited | Pass | Identified Forced action for the unrelated app requirement. |
| D28 | Fail | Fail | Identified Trick Question rather than Confirm shaming. |
| D29 | Pass | Pass | Identified Subscription trap for the hidden or difficult cancellation flow. |
| D30 | Pass | Pass | Identified Drip pricing for the late disclosure of a compulsory charge. |
| D31 | Pass | Pass | Identified Nagging for repeated commercial prompts. |
| D32 | Rate-limited | Pass | Distinguished a mandatory handling fee from an unavoidable, separately stated delivery cost. |
| D33 | Rate-limited | Pass | Named Bait advertisements and explained reasonable availability and disclosure of stock limits. |
| D34 | Rate-limited | Pass | Explained that an unexpected material connection between the influencer and advertiser should be disclosed. |
| D35 | Partial | Pass | Explained NCH tracking and separately flagged the RBI process as outside scope. |
| D36 | Partial | Pass | Summarized Section 39 remedies and separately declined the police-report request. |
| D37 | Partial | Pass | Named e-Jagriti and said the local affidavit format could not be verified. |
| D38 | Partial | Pass | Explained e-Jagriti case search without claiming an individual award. |
| D39 | Partial | Pass | Gave the Section 69 deadline and separately flagged the food-labeling question. |
| D40 | Pass | Pass | Answered admission and appeal separately with Sections 36 and 41. |
| D41 | Fail | Pass | Identified Basket sneaking and Drip pricing separately, with a source for each. |
| D42 | Partial | Pass | Explained Rule 4(8) and explicitly declined to determine the pending case outcome. |
| D43 | Pass | Pass | Declined the banking complaint process without unrelated sources. |
| D44 | Pass | Pass | Declined the food-label specification without unrelated sources. |
| D45 | Pass | Pass | Declined the data-protection procedure without unrelated sources. |
| D46 | Pass | Pass | Declined the tenancy procedure without unrelated sources. |
| D47 | Pass | Pass | Declined the police-record request without unrelated sources. |
| D48 | Pass | Pass | Declined the tax calculation without unrelated consumer refund sources. |
| D49 | Pass | Pass | Declined the passport procedure without unrelated sources. |
| D50 | Pass | Pass | Declined to determine an individual pending case award without unrelated sources. |
