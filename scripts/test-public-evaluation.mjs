import assert from "node:assert/strict";
import { loadPublicEvaluation, validatePublicQuestions } from "./evaluate-public-questions.mjs";
import { loadEvaluation } from "./evaluate-retrieval.mjs";

const evaluation = await loadPublicEvaluation();
const { benchmark, records } = evaluation;
assert.equal(records.length, 90);
assert.equal(benchmark.questions.length, 20);
assert.equal(benchmark.questions.filter((q) => q.coverage === "partial").length, 15);
assert.equal(benchmark.questions.filter((q) => q.coverage === "none").length, 5);
assert.equal(benchmark.questions.filter((q) => q.coverage === "full").length, 0);
assert.equal(benchmark.human_review, "pending");
const baseline = await loadEvaluation();
assert.deepEqual(evaluation.inputs.records, baseline.inputs.records);
assert.deepEqual(benchmark.embedding, baseline.benchmark.embedding);
assert.deepEqual(benchmark.bm25, baseline.benchmark.bm25);
assert.ok(!benchmark.questions.some((q) => baseline.benchmark.questions.some((old) => q.question === old.question)));

function reject(edit, pattern) {
  const copy = structuredClone(benchmark);
  edit(copy.questions);
  assert.throws(() => validatePublicQuestions(copy, records), pattern);
}
reject((q) => { q[1].source.url = q[0].source.url; }, /source attribution/);
reject((q) => { q[0].source.url = "https://www.reddit.com.evil.example/r/test/comments/abc/"; }, /source attribution/);
reject((q) => { q[0].source.url = "https://user@www.reddit.com/r/test/comments/abc/"; }, /source attribution/);
reject((q) => { q[0].source.excerpt = "long ".repeat(26); }, /source attribution/);
reject((q) => { q[0].question += " Order ID 1234567890"; }, /personal identifier/);
reject((q) => { q[0].question += " user@example.com"; }, /personal identifier/);
reject((q) => { q[0].question = "x".repeat(601); }, /question/);
reject((q) => { q[0].coverage = "full"; }, /scope/);
reject((q) => { q[0].required_evidence = []; }, /scope/);
reject((q) => { q[19].required_evidence = [["filing-complaint"]]; }, /scope/);
reject((q) => { q[0].required_evidence = [["missing-record"]]; }, /Inactive/);
reject((q) => { q[0].required_evidence = [["filing-complaint"], ["filing-complaint"]]; }, /repeated/);
reject((q) => { q[0].unsupported_requests = ""; }, /question/);
reject((q) => { q[0].source.access = "live_verified"; }, /source attribution/);
console.log("Public-question provenance, partial scope, evidence labels and privacy-format checks passed.");
