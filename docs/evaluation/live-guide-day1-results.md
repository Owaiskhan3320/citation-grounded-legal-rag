# Day 1: live Consumer Law Guide evaluation

Run date: 2026-11-06. Target: [deployed Streamlit guide](https://citation-grounded-legal-rag-zjsgsuk3a4u9glebbs7xnp.streamlit.app/). One live submission per question. See the [question list and expected evidence](live-guide-day1-questions.md), recorded before testing. These are new phrasings written for this run, not an independently authored holdout. Grades compare the response with the indexed evidence, not with an independent legal review.

| Group | Total | Pass | Partial | Fail | Rate-limited |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shopping | 12 | 11 | 1 | 0 | 0 |
| Complaints | 12 | 3 | 2 | 2 | 5 |
| Ads and dark patterns | 10 | 3 | 1 | 2 | 4 |
| Multi-part | 8 | 1 | 6 | 1 | 0 |
| Out of scope | 8 | 8 | 0 | 0 | 0 |
| **Total** | **50** | **26** | **10** | **5** | **9** |

A pass is a direct answer supported by the expected evidence, or a clean decline when the request is outside scope. Partial means relevant evidence was shown but the app omitted an important part, qualification or answer, or presented a distracting interpretation. Fail includes false declines and material misclassifications. HTTP 429 responses are listed separately, even when the app displayed relevant candidate excerpts.

## Findings

- 26 of 50 were clean passes as observed. Excluding the nine rate-limited submissions, 26 of 41 were clean passes. That second figure includes eight correct declines; 18 of 33 substantive or multi-part requests passed when not rate-limited.
- All eight fully out-of-scope prompts were declined. For multi-part prompts, only one of eight fully passed. Several replies found the right record but did not answer the supported part; one silently skipped a request for a specific case result.
- The decline in D13 and D23 occurred despite matching records in the corpus. In D20 and D24 the expected evidence was visible but was not turned into a direct answer. The browser run alone does not establish which pipeline stage caused each miss.
- Nine responses surfaced Groq HTTP 429. Eight of those showed the expected record among the candidates; D21 did not. This run does not establish a provider-wide failure rate or the quota that was hit.

## Per-question scorecard

| ID | Group | Grade | Observed result |
| --- | --- | --- | --- |
| D01 | Shopping | Pass | Rule 6(3): a seller cannot rely on a no-returns policy for goods that do not match what was agreed. |
| D02 | Shopping | Pass | Rule 4(10): a reasonable or prescribed period, with no universal number of days given. |
| D03 | Shopping | Pass | Rule 4(8): the cancellation charge must be reciprocal. |
| D04 | Shopping | Pass | Rule 4(9): a pre-ticked warranty is not affirmative consent. |
| D05 | Shopping | Pass | Rule 5(3)(a): gave the address and other contact details after a written request. |
| D06 | Shopping | Pass | Rule 4(5): 48 hours to acknowledge and one month to redress; the seller rule was labeled separately. |
| D07 | Shopping | Pass | Rule 6(4): correctly gave the seller's acknowledgment and redress deadlines. |
| D08 | Shopping | Partial | Rule 6(5) answered the return-shipping question, but the answer led with the separate rule for inventory platforms. |
| D09 | Shopping | Pass | Rule 5(2): the marketplace must obtain an undertaking about listing accuracy. |
| D10 | Shopping | Pass | Rule 2: an overseas entity systematically serving Indian consumers can be covered. |
| D11 | Shopping | Pass | Rule 7(2)-(5): an authenticity representation can matter; the answer did not determine liability. |
| D12 | Shopping | Pass | Rule 6(3): identified the force-majeure exception for late delivery without deciding the specific dispute. |
| D13 | Complaints | Fail | Declined despite the indexed NCH pre-litigation record. The answer did not distinguish NCH from Commission filing. |
| D14 | Complaints | Pass | NCH tracking: directed the user to Track your Grievance. |
| D15 | Complaints | Rate-limited | Groq HTTP 429; NCH docket and forwarding was among the candidates. |
| D16 | Complaints | Pass | Named and linked the official e-Jagriti filing route. |
| D17 | Complaints | Rate-limited | Groq HTTP 429; e-Jagriti filing help was among the candidates. |
| D18 | Complaints | Rate-limited | Groq HTTP 429; Section 34 was among the candidates. |
| D19 | Complaints | Pass | Section 69: two years ordinarily, with sufficient cause and recorded reasons for delay. |
| D20 | Complaints | Partial | Section 41 appeared in the candidates, but the app did not give the appeal destination or usual time limit. |
| D21 | Complaints | Rate-limited | Groq HTTP 429; the expected Section 81 was not shown. Candidates included Sections 37, 80 and 38. |
| D22 | Complaints | Rate-limited | Groq HTTP 429; Section 39 was among the candidates. |
| D23 | Complaints | Fail | Declined. The indexed Section 2(7) self-employment exception was not shown. |
| D24 | Complaints | Partial | Section 36 was shown under limited coverage, but the app did not state the usual 21 days or deemed admission. |
| D25 | Ads and dark patterns | Fail | Returned a generic dark-pattern result without identifying False urgency. |
| D26 | Ads and dark patterns | Partial | Identified Basket sneaking but also gave an unsupported Confirm shaming interpretation. |
| D27 | Ads and dark patterns | Rate-limited | Groq HTTP 429; Forced action was among the candidates. |
| D28 | Ads and dark patterns | Fail | Labeled the shaming decline button Trick Question instead of Confirm shaming. |
| D29 | Ads and dark patterns | Pass | Subscription trap: identified hidden or difficult cancellation. |
| D30 | Ads and dark patterns | Pass | Drip pricing: identified compulsory charges revealed late. |
| D31 | Ads and dark patterns | Pass | Nagging: identified repeated prompts to buy. |
| D32 | Ads and dark patterns | Rate-limited | Groq HTTP 429; the Free-claim advertisements record was among the candidates. |
| D33 | Ads and dark patterns | Rate-limited | Groq HTTP 429; Bait advertisements was among the candidates. |
| D34 | Ads and dark patterns | Rate-limited | Groq HTTP 429; Endorser due diligence was among the candidates. |
| D35 | Multi-part | Partial | Flagged the unsupported banking part and showed NCH tracking, but did not directly tell the user how to track. |
| D36 | Multi-part | Partial | Flagged the police-report part and showed Section 39, but did not summarize the supported remedies. |
| D37 | Multi-part | Partial | Showed the e-Jagriti filing source but did not directly name the route in an answer or isolate the unverified affidavit request. |
| D38 | Multi-part | Partial | Correctly declined the specific award and found e-Jagriti case search; left the supported search procedure as an excerpt. |
| D39 | Multi-part | Partial | Flagged the food-labeling request and showed Section 69 but did not state the usual limit in the answer. |
| D40 | Multi-part | Pass | Answered both admission under Section 36 and the appeal route under Section 41, keeping the rules separate. |
| D41 | Multi-part | Fail | Got the unwanted donation right (Basket sneaking), but called the late fee Forced action instead of Drip pricing. |
| D42 | Multi-part | Partial | Answered the cancellation-fee part under Rule 4(8) but silently ignored the request for an individual case outcome. |
| D43 | Out of scope | Pass | Declined the banking complaint procedure without unrelated excerpts. |
| D44 | Out of scope | Pass | Declined the food-labeling specification without unrelated excerpts. |
| D45 | Out of scope | Pass | Declined the privacy procedure without unrelated excerpts. |
| D46 | Out of scope | Pass | Declined the tenancy procedure without unrelated excerpts. |
| D47 | Out of scope | Pass | Declined the police procedure without unrelated excerpts. |
| D48 | Out of scope | Pass | Declined the tax calculation without unrelated excerpts. |
| D49 | Out of scope | Pass | Declined passport renewal guidance without unrelated excerpts. |
| D50 | Out of scope | Pass | Declined to provide an award in a specific pending case without unrelated excerpts. |
