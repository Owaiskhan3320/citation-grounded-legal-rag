# Request-scope reliability follow-up

This change addresses a specific failure: a keyword hit was treated as sufficient
evidence even when it did not answer the request. The API and browser fallback now
use the same bounded source-lookup wrapper in `research.js`. No model, source
record, embedding or database change is included.

## Request behavior

- Known source/provision lookups can return up to three checked, currently active
  records. Bare section references use the selected Consumer Protection Act
  corpus; bare rule references use its E-Commerce Rules unless jurisdiction rules
  are explicitly identified. A missing specific reference does not fall through
  to a vaguely similar provision.
- Explicit requests for absent authorities are declined for that clause. This
  includes banking/RBI, FSSAI, privacy, ordinary tenancy, criminal/RTI and specified
  foreign-law requests. A number from a different named Act is not interpreted as
  the same-numbered consumer provision.
- A mixed request can retain a separate available source lookup while displaying
  which parts remain unverified. Ambiguous clauses that cannot be separated can
  be declined in full. This is intentionally conservative.
- Case-specific requests, unsupported subrequests, registry/document uncertainty,
  omitted lookups and the three-record limit produce explicit coverage limits.
  General excerpts are labelled as such, not a complete answer or a finding of
  liability. The wrapper does not inspect the user's evidence or decide facts.
- Partial and declined requests do not call Groq. A focused lookup can call the
  existing Groq model with canonical source headings and source text, not the raw
  question. Existing citation-ID/truncation checks remain. They do not prove
  entailment or guarantee every generated claim is correct.
- An API failure uses the same wrapper in the browser. The older permissive
  keyword fallback is not a back door around the new limits.

This is a small English-language policy layer using explicit references, named
concepts and a limited set of request patterns. It is not semantic verification,
a comprehensive legal intent classifier or proof of safe handling for all unseen
questions. A positive lookup establishes only that a named source can be shown,
not that the entire question is supported by it. Cases can be misclassified or
declined despite having useful evidence. It does not provide a complete workflow.

## Development run on known public questions

The [new raw run](../../evaluation/results/request-scope-development.json) uses
the unchanged public questions and their original `2026-11-02` source cutoff.
This is post-change development evidence on known examples, not an unseen test.
The previously documented prompt/label errata still apply.

| Observation | Previous keyword baseline | New wrapper |
| --- | ---: | ---: |
| Five absent-authority requests returned no cards | 0/5 | 5/5 |
| At least one labelled group found in partly supported requests | 3/15 | 7/15 |
| All provisional labelled groups found | 1/15 | 2/15 |

The wrapper declines six of the fifteen partly supported examples: W02, W04,
W05, W06, W07 and W14. The other nine receive limited source excerpts, not a
generated case-specific conclusion. This is a substantial coverage cost, not a
claim that the practical requests have been solved. The five known rejections
must not be advertised as universal out-of-scope accuracy; the patterns were
developed with these failures in view.

The known platform-deadline query now selects Rule 4(5), without attaching Section
35 just because the question says "consumer complaint". Appeal requests are not
treated as requests for the trial commission's remedy powers. Unspecified
dark-pattern scenarios do not get the broad definition as if that classified the
events.

## Verification and history

The focused regression suite covers 12 positive lookups, 22 unsupported requests
and seven mixed requests, plus wrong/missing provision references, source-count
limits, effective-date versions, raw-input exclusion from generation and mocked
API assertions that partial/declined requests make no provider call.

The browser fixture checks mobile/desktop layout, genuine local fallback, a
wrong-Act request during an outage, visible mixed-request limits and stale-response
ordering. No live Groq calls or new deployed-answer accuracy claims are involved.

The historical 50- and 20-question experiments remain byte-for-byte unchanged,
including their scorers and raw results. They still measure the older retriever in
`search.js`/`rag.js`, **not the new live request wrapper**. CI checks them as frozen
baselines; the new run measures the changed behavior separately. Do not compare
their names as if they were repeated measurements of one unchanged application.

Run locally:

```powershell
node scripts/test-research.mjs
node scripts/evaluate-request-scope.mjs --check
```

For a new local diagnostic result, without replacing a committed report:

```powershell
node scripts/evaluate-request-scope.mjs --output tmp/request-scope-rerun.json
```

The next quality work needs better procedural coverage and independent questions,
not an accuracy claim based on this development set or an automatic embedding/
database migration. Production deployment still requires merging the PR.
