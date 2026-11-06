# Consumer Law Guide holdout protocol v1

Frozen before any app or retriever runs on these cases. Evaluation date: 2026-11-06
in India. The agent authored and source-checked synthetic, non-personal scenarios:
12 fully answerable, 8 mixed, and 5 fully outside the indexed evidence. The author
selected distinct tasks across the Act, e-commerce rules, jurisdiction, advertising,
dark patterns and official grievance channels, with explicit, lay and date-sensitive
wording. Unsupported requests were chosen for plausible neighboring user needs, not
from the app's scope patterns. This is a fresh development holdout, not independent
human authorship or a lawyer's review. The published 50-case suite is regression only.

Evidence references are `record-id@version#one-based-passage`; alternatives within
a group count once. The corpus manifest resolves each passage to its official URL
and page. The official provisions and guidelines, not the app's display summaries,
are the authority for the answer points. For the date-sensitive cases, use the
record active on the frozen date. A consolidated current-law opinion is out of scope.

## Grading

Grade each visible part before aggregating, using its required points and critical
errors. Pass: complete, applicable, and materially supported by displayed citations.
Partial: the core answer is useful and supported but has a noncritical omission,
confusing extra source, or clear candidate-only fallback with relevant evidence.
Fail: a critical error, nonresponsive answer, material unsupported claim or missing
qualification, a false decline on an answerable part, or a substantive answer to an
unsupported part. On an unsupported part, a clear limitation plus a properly labeled
official lookup route can pass; irrelevant candidate cards without a substantive
claim are partial. The case receives the worst part grade. Track unsupported/irrelevant
sources separately, even when the core answer passes.

Provider/network failures are separate availability outcomes, not legal-answer scores.
An HTTP 429 is never replaced by a later pass. The primary result is the first
attempt per case. A cold start counts toward observed latency; any repeated stability
sample is reported separately. The browser benchmark is graded by one agent reviewer.
Report its counts, not population-wide or independent legal accuracy.

Offline metrics score only answerable gold parts: evidence groups hit divided by
required groups, and parts for which every group was found. A record version counts
at retrieval; check actual passage support at answer grading. Use the anchor in each
mixed case to map the intended part to the app's actual clauses, noting shared or
unmatched clauses. Record ranked-before-filter and allowed-after-filter separately.
Browser citations are visible evidence, not proof of hidden model selections. When
offline replays and browser answers do not establish causation, use unknown.

Release gate: no observed material legal errors or new critical regressions in the
tested cases. Do not tune on this set and still call the rerun unseen. Add a dated
erratum if a label needs correction; keep this version and its original results.
