# Source data

The app reads `data/consumer-law/v1/records.json`. There are 41 current records and
five replacement versions that start on 1 January 2027. No database or model is
needed to load them.

## Record format

Each record keeps a stable `id` and a dated `version`. `summary` is an explanation,
not a quotation. `passages` contains source text, with a source ID and PDF page for
each passage. Only whitespace is normalised. Selected passages are not necessarily
the whole section; `provisions` identifies the coverage.

`source_checked` means the quoted text was checked against the official PDF. It
does not mean a lawyer approved the explanation or that all later amendments have
been reviewed. New, unchecked records must use `pending`; the app excludes them.

The manifest in `v1/sources.json` records official URLs, download and check dates,
original PDF SHA-256 hashes, and hashes for the saved text snapshots. The snapshots
let CI verify quotations offline. They are not a substitute for the PDFs.

Act snapshots exclude the running headers and margin headings. The data directory
uses LF line endings on every platform so snapshot hashes survive a Windows checkout.

## Dates

`effective_from` is inclusive; `effective_to` is exclusive. The app uses today's
date in India, on each retrieval request. It never searches a future version or an
expired version as current evidence.

The Act did not commence on one date. The covered definitions and complaint
provisions started on 20 July 2020 under S.O. 2351(E); the covered CCPA provisions
started on 24 July 2020 under S.O. 2421(E). Both notifications are in the manifest.

The E-Commerce amendment is G.S.R. 789(E), dated 9 September 2026. Page 5, Rule 1(2),
states 1 January 2027 as commencement. The PDF text layer drops some numbers, so
pages 5-7 were also checked as images. Two missing `2006` citations were restored
from those images in the snapshot; the manifest documents this correction.

The five replacement cards cover changes to existing content. They do not add
every new obligation in the amendment. Future versions that quote unchanged
clauses retain separate passage links to the 2020 rules.

The 2020 E-Commerce corrigendum changes clause lettering, not the quoted duties.
The quotations retain the original PDF's lettering. The 2021 amendment replaces
Rule 4(1), which is not quoted in this release.

## Editing and checking

1. Download the official PDF and record its hash with `Get-FileHash -Algorithm SHA256`.
2. Add or update its entry in `sources.json` and save the relevant page text in
   `snapshots/`. Keep the one-based PDF page numbers. Update `snapshot_sha256` with
   the saved snapshot's SHA-256 hash. Do not turn paraphrases into quotations.
3. Add the record as `pending`, check its quotations and dates against the PDF,
   then change it to `source_checked`. Describe extraction repairs in the source note.
4. For a replacement, preserve the old version and set its exclusive end date.
   Give the new version the same ID and the replacement's commencement date.
5. Run the checks below before opening a PR.

```powershell
python -m pip install -r requirements-dev.txt
python scripts/validate_corpus.py
python -m unittest discover -s tests -v
npm test
```

The validator checks schema fields, official hosts, calendar dates, duplicate
versions, overlapping checked versions, snapshot hashes, and quotations against
their recorded pages. It does not contact the websites or prove that a generated
answer follows legally from a quotation. Original PDF hashes identify downloads;
CI checks saved snapshot hashes, not a fresh download of each PDF.

The API and browser fallback share `data/statutes.js`, a small adapter around the
same JSON. It adds the legacy search fields without changing ranking. The API also
returns record versions, dates, provisions, and passage-level source links.

The November 2026 migration changes the evidence from paraphrases to official
quotations. Earlier answer-evaluation reports describe the older corpus; they are
not fresh accuracy measurements for this release.
