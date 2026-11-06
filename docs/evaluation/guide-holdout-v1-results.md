# Consumer Law Guide holdout v1 results

Tested the [public Streamlit app](https://citation-grounded-legal-rag-zjsgsuk3a4u9glebbs7xnp.streamlit.app/)
on 6 November 2026 (India), using release `f292d43` on `feat/python-retrieval`.
One first-attempt submission per [frozen case](../../evaluation/guide-holdout-v1.jsonl),
in file order, at least 8.5 seconds apart. The visible answers and source cards
were graded under the [frozen rubric](guide-holdout-rubric-v1.md) by one agent
reviewer. These are synthetic, source-labeled cases, not independent legal validation.

| Set | Pass | Partial | Fail | Provider errors |
| --- | ---: | ---: | ---: | ---: |
| Known live regression, earlier run | 43/50 | 2 | 5 | 0 |
| Fresh answerable | 9/12 | 3 | 0 | 0 |
| Fresh mixed | 4/8 | 2 | 2 | 0 |
| Fresh outside scope | 5/5 | 0 | 0 | 0 |
| **Fresh total** | **18/25** | **5** | **2** | **0** |

The 33 intended parts received 26 passes, 5 partials and 2 failures. Of 20
answerable parts, 14 passed, 5 were partial and 1 failed; 12 of 13 unsupported
parts received a clear refusal. The remaining unsupported part showed a general
penalties summary in place of an explicit refusal. It did not predict a specific
penalty. The Section 72 citation belonged to the supported part but was misapplied
to the case-specific part. No standalone irrelevant source card was observed.
Browser-observed latency was p50 1.67 s and p95 2.97 s (nearest rank, 25 cases);
the first query after waking the app took 27.56 s. These are descriptive samples,
not a latency SLA. No answer was replaced by a retry.

## Offline stage evidence

The [holdout trace](../../evaluation/results/guide-holdout-v1-offline-f292d43.json)
uses the same release's Python code and index, frozen date, MiniLM revision,
`k=3`, and cutoff `0.3656768202781677`, without Groq. All **20/20 required
evidence groups** and **20/20 answerable parts** were complete at the record-version
level, both before and after filtering. Six of 13 unsupported parts still had
candidates after filtering; only one failed to decline in the live UI. Candidate
presence is not the same as a false answer. Visible browser cards do not expose
the exact passage ID returned by the remote selector.

The separate [14-case known-regression trace](../../evaluation/results/guide-regression-trace-v1-f292d43.json)
found 8/13 required groups. In D13, D21 and D23, the expected NCH, Section 81,
and Section 2(7) records respectively were not in the top three. D25 and D28
also lacked the expected specific categories. D20 retained the correct appeal
source but split off a deadline question that failed the filter. D08 split
the marketplace context from the return-shipping question and ranked an
inventory rule first. These traces explain why lowering the threshold alone
would not resolve the main misses.

## Fresh per-case grades

For mixed cases, the two part grades follow the frozen question order.

| ID | Case | Part grades | Observed result and attribution |
| --- | --- | --- | --- |
| H01 | Partial | Partial | Section 40 supplied the review and deadline; the split deadline clause also got a false coverage warning. Split/coverage. |
| H02 | Pass | Pass | Rule 5(4) identified the marketplace terms governing sellers. |
| H03 | Pass | Pass | Section 2(22) excluded damage to the product itself without ruling out other remedies. |
| H04 | Pass | Pass | Section 84 named inadequate warnings as a potential basis, not a liability finding. |
| H05 | Partial | Partial | Correct current Rule 7(1) cited; displayed summary said total price with charges but omitted the single figure and breakdown. Displayed summary. |
| H06 | Pass | Pass | Child-targeted advertisement guidance covered making children feel inferior for not buying. |
| H07 | Pass | Pass | Section 20 covered recall and reimbursement after investigation without promising an outcome. |
| H08 | Pass | Pass | Section 2(28) covered deliberate concealment, with additional relevant advertising guidance. |
| H09 | Pass | Pass | District band included the exact boundary and distinguished consideration from compensation. |
| H10 | Pass | Pass | State band included exactly two crore paid as consideration. |
| H11 | Partial | Partial | Correct current Rule 4(2) displayed; version instruction became a separate unverified clause. Split/coverage. |
| H12 | Pass | Pass | Identified Trick Question for the deliberate double negative. |
| H13 | Partial | Partial / Pass | Section 37 mentioned seeking consent but did not clearly say referral depends on agreement; the tribunal form was declined. Displayed summary. |
| H14 | Pass | Pass / Pass | Displayed the grievance officer's identifying details and declined the GST filing table. |
| H15 | Fail | Fail / Pass | Section 86 was cited, but the displayed summary did not answer the express-warranty condition. The diagnostic-test part was declined. Displayed summary. |
| H16 | Pass | Pass / Pass | National band answered using consideration paid; the visa-document part was declined. |
| H17 | Pass | Pass / Pass | Distinguished shared branding from surrogate advertising and declined the current market value. |
| H18 | Fail | Pass / Fail | Cited Section 72 for possible consequences, then repeated them as the answer to a pending-case prediction instead of declining it. Scope/selection. |
| H19 | Partial | Partial / Pass | Correct current Rule 4(5) and durations, but the summary omitted that the redress period runs from receipt. Declined parcel tracking. Displayed summary. |
| H20 | Pass | Pass / Pass | Named non-web NCH channels and declined to predict a settlement amount. |
| H21 | Pass | Pass | Declined an employment filing procedure with no source cards. |
| H22 | Pass | Pass | Declined a current trademark fee with no source cards. |
| H23 | Pass | Pass | Declined European flight compensation with no source cards. |
| H24 | Pass | Pass | Declined a customs rate with no source cards. |
| H25 | Pass | Pass | Declined to claim a live hearing date with no source cards. |

**Release decision: hold.** The published app remains at the tested revision.
The known complaint-guidance retrieval misses remain, and the holdout exposed
a material answer omission and a scope failure. Fix against regression cases,
add the discovered defects to the next regression set, and collect new unseen
cases for any later claim of generalization. Do not reclassify this run after
tuning. The evaluation tooling did not modify the production pipeline.
