# Release candidate: live Groq evaluation

Run on 7 November 2026 (India), candidate `4b9ffd6`. The local Streamlit
app was exercised with `AppTest` using the pinned MiniLM/FAISS index and the
real Groq `openai/gpt-oss-20b` selector. The harness reused the real index
and pinned the benchmark's source date to 6 November 2026. It did not mock
source selection or replace rendered answers. This was a local integration
test, not a test of hosting availability or browser latency. The public app
was unchanged during the run.

Only the repository's synthetic test questions and source passages were sent.
One first attempt was recorded per question, with at least 8.5 seconds between
provider request starts. Grades are one review against the
[frozen rubric](guide-holdout-rubric-v1.md), not independent legal review or
an estimate of accuracy on real users' questions. A `partial` UI mode can
earn a pass if it answers the supported part and correctly declines the rest.

## Previous blockers

| Case | Grade | Observed result |
| --- | --- | --- |
| H15 | Pass | Section 86 explained the seller's independent express warranty and resulting harm; the medical-test question was declined. |
| H18 | Pass | Section 72 answered the general question; the personal punishment prediction was declined before sending the supported part to Groq. |

## 15-case follow-up set

**13 pass, 2 partial, 0 fail, 0 provider errors.** All seven unsupported parts
were declined. This is the first live-selector run of the set, but it is not
an unseen test of the entire pipeline: the preceding offline run informed the
Section 38 fix and summary revisions.

| Case | Grade | Observed result |
| --- | --- | --- |
| R01 | Pass | Section 2(5) included a legal heir or representative. |
| R02 | Pass | Section 38 separated the response period and possible extension from the deadline to send the complaint. |
| R03 | Partial | Rule 6 gave the right marketplace-seller answer; an unrelated inventory-platform rule was also displayed. |
| R04 | Pass | The disclaimer answer distinguished clarification from correcting a misleading claim. |
| R05 | Pass | Correctly identified interface interference. |
| R06 | Pass | Section 80 covered the signed terms, settlement report, and sending them to the Commission. |
| R07 | Pass | Correctly identified SaaS billing for undisclosed recurring payments. |
| R08 | Pass | Section 17 named the three authorities for class-interest complaints. |
| R09 | Pass | Section 87 explained the seller exception and declined the electrical code question. |
| R10 | Pass | Section 71 distinguished civil-decree enforcement and declined the stamp-duty rate question. |
| R11 | Pass | The official NCH source gave the information to prepare and declined the carrier-coverage question. |
| R12 | Partial | Rule 4(11) gave the basic restriction but omitted the circumstances used to assess an unjustified price. It declined to quote a laptop price. |
| R13-R15 | Pass | Declined carrier settings, postal dimensions, and professional licensing credits without unrelated cards. |

## Original 50-question regression set

Same [prompts and expected outcomes](live-guide-day1-questions.md) as the
[previous deployed run](live-guide-full-retest-results.md). The earlier run
was on the hosted app and this run was local with the real selector, so the
comparison is for answer behavior, not hosting performance.

| Group | Cases | Previous pass / partial / fail | Candidate pass / partial / fail |
| --- | ---: | ---: | ---: |
| Shopping | 12 | 11 / 1 / 0 | 11 / 1 / 0 |
| Complaints | 12 | 8 / 1 / 3 | 12 / 0 / 0 |
| Ads and dark patterns | 10 | 8 / 0 / 2 | 9 / 1 / 0 |
| Mixed | 8 | 8 / 0 / 0 | 8 / 0 / 0 |
| Outside scope | 8 | 8 / 0 / 0 | 8 / 0 / 0 |
| Total | 50 | 43 / 2 / 5 | 48 / 2 / 0 |

- D13, D21, D23, D25 and D28 went from fail to pass. D20 no longer splits
  the deadline away from the appeal question.
- D08 still shows an inventory rule before the applicable marketplace
  return-shipping rule. D32 gives the right distinction for free claims but
  also shows a marketplace disclosure rule the question did not call for.
- All eight mixed requests and eight fully out-of-scope requests passed.
  A decline did not count against a case when the missing part was unsupported.

Across the 67 first attempts, 56 contacted Groq, with no provider or validation
errors. Every rendered answer showed an official source link. The candidate
passed the release gate: no material legal errors or new critical regressions
were observed. The four partials are still limitations, not passes.
