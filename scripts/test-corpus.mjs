import assert from "node:assert/strict";

import corpus from "../data/consumer-law/v1/records.json" with { type: "json" };
import { currentIndianDate, getStatutes } from "../data/statutes.js";
import { retrieveEvidence } from "../rag.js";

const before = getStatutes("2026-12-31");
const after = getStatutes("2027-01-01");
assert.equal(corpus.records.length, 46);
assert.equal(before.length, 41);
assert.equal(after.length, 41);
assert.equal(new Set(after.map((record) => record.id)).size, 41);
assert.equal(getStatutes("2020-07-19").length, 0);
assert.ok(!getStatutes("2020-07-20").some((r) => r.section === "Section 21"));
assert.ok(getStatutes("2020-07-24").some((r) => r.section === "Section 21"));
assert.match(currentIndianDate(), /^\d{4}-\d{2}-\d{2}$/);
for (const invalid of ["2027-02-30", "2027-13-01", "01-01-2027", "not-a-date"]) {
  assert.throws(() => getStatutes(invalid), RangeError);
}

for (const future of corpus.records.filter((record) => record.effective_from === "2027-01-01")) {
  const oldVersion = before.find((record) => record.id === future.id);
  const newVersion = after.find((record) => record.id === future.id);
  assert.equal(oldVersion.source_id, "ecommerce-rules-2020");
  assert.equal(oldVersion.effective_to, "2027-01-01");
  assert.equal(newVersion.source_id, "ecommerce-amendment-2026");
  assert.equal(newVersion.version, "2027-01-01");
}

const oldCard = retrieveEvidence("What information is required under Rule 7(1)?", "2026-12-31")[0];
const newCard = retrieveEvidence("What information is required under Rule 7(1)?", "2027-01-01")[0];
assert.doesNotMatch(oldCard.excerpt, /best before or use before/);
assert.match(newCard.excerpt, /best before or use before/);
assert.equal(newCard.recordId, oldCard.recordId);
assert.equal(newCard.effectiveFrom, "2027-01-01");
assert.ok(newCard.passages.every((passage) => passage.sourceUrl.startsWith("https://")));
assert.ok(newCard.passages.some((passage) => passage.source_id === "ecommerce-rules-2020"));
assert.ok(newCard.passages.some((passage) => passage.source_id === "ecommerce-amendment-2026"));

const first = corpus.records[0];
try {
  first.review_status = "pending";
  assert.ok(!getStatutes("2026-11-01").some((record) => record.id === first.id));
} finally {
  first.review_status = "source_checked";
}

console.log("Corpus loading, provenance and effective-date checks passed.");
