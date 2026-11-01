import assert from "node:assert/strict";

import { assertSameRankings, evaluate, loadEvaluation, validateBenchmark, validateEmbeddings } from "./evaluate-retrieval.mjs";
import { buildBm25, gradeRanking, rankVectors, reciprocalRankFusion, summarise, tokens } from "./retrieval-metrics.mjs";

const record = (id, summary) => ({ id, section: "", title: "", summary, keywords: [] });
const config = { k1: 1.5, b: 0.75 };
const bm25 = buildBm25([record("a", "refund refund"), record("b", "delivery")], config);
assert.equal(bm25("refund")[0].id, "a");
assert.ok(Math.abs(bm25("refund")[0].score - Math.log(2) * 5 / (2 + 1.5 * (0.25 + 0.75 * 2 / 1.5))) < 1e-12);
assert.deepEqual(bm25("refund refund"), bm25("refund"));
assert.deepEqual(bm25("xyzunknown"), []);
assert.deepEqual(bm25("the and consumer"), []);
assert.deepEqual(tokens("Forty-eight HOURS, Rule 4(5)"), ["forty", "eight", "hours", "rule", "4", "5"]);
assert.throws(() => buildBm25([], config));
assert.throws(() => buildBm25([record("a", "x")], { k1: 0, b: 2 }));
const common = buildBm25([record("a", "common rare"), record("b", "common other")], config);
assert.ok(common("rare")[0].score > common("common")[0].score);
const length = buildBm25([record("a", "refund"), record("b", "refund with many additional unrelated words")], config);
assert.equal(length("refund")[0].id, "a");

const question = { kind: "in_scope", required_evidence: [["a", "alternate"], ["b"]] };
assert.deepEqual(gradeRanking(question, ["alternate", "irrelevant", "b"], 3), {
  hit_at_1: true, recall_at_k: 1, complete_at_k: true, reciprocal_rank_at_k: 1,
});
assert.equal(gradeRanking(question, ["irrelevant", "a"], 3).reciprocal_rank_at_k, 0.5);
assert.equal(gradeRanking(question, ["a", "alternate"], 3).recall_at_k, 0.5);
assert.equal(gradeRanking(question, ["x", "y", "z", "a"], 3).reciprocal_rank_at_k, 0);
assert.equal(gradeRanking(question, [], 3).complete_at_k, false);
assert.throws(() => gradeRanking(question, ["a", "a"], 3));
assert.deepEqual(gradeRanking({ kind: "out_of_scope" }, [], 3), { abstained: true });
assert.deepEqual(gradeRanking({ kind: "out_of_scope" }, ["a"], 3), { abstained: false });
const summary = summarise([
  { kind: "in_scope", grade: gradeRanking(question, ["x", "a"], 3), query_ms: 2 },
  { kind: "in_scope", grade: gradeRanking(question, ["a", "b"], 3), query_ms: 4 },
  { kind: "out_of_scope", grade: { abstained: true }, query_ms: 1 },
  { kind: "out_of_scope", grade: { abstained: false }, query_ms: 8 },
]);
assert.equal(summary.macro_evidence_recall_at_3, 0.75);
assert.equal(summary.complete_evidence_at_3, 0.5);
assert.equal(summary.out_of_scope_false_matches, 1);
assert.equal(summary.query_p50_ms, 2);
assert.equal(summary.query_p95_ms, 8);

assert.equal(rankVectors([1, 0], [{ id: "a", vector: [0, 1] }, { id: "b", vector: [1, 0] }])[0].id, "b");
assert.throws(() => rankVectors([1, 0], [{ id: "a", vector: [1] }]));
assert.throws(() => rankVectors([NaN], []));
assert.equal(reciprocalRankFusion([[{ id: "a" }, { id: "b" }], [{ id: "b" }]], 60)[0].id, "b");
assert.throws(() => reciprocalRankFusion([], 0));

const evaluation = await loadEvaluation();
assert.equal(evaluation.records.length, 90);
assert.equal(evaluation.benchmark.independent_questions_received, 0);
const clone = (value) => structuredClone(value);
const invalid = clone(evaluation.benchmark);
invalid.questions[0].required_evidence = [["not-a-record"]];
assert.throws(() => validateBenchmark(invalid, evaluation.records), /Inactive/);
invalid.questions[0] = clone(evaluation.benchmark.questions[1]);
assert.throws(() => validateBenchmark(invalid, evaluation.records), /duplicated/);

const artifact = {
  input_sha256: evaluation.input_sha256, ...evaluation.benchmark.embedding,
  normalised: true, dimensions: 384, load_ms: 0, index_ms: 0,
  ...Object.fromEntries(["records", "questions"].map((field) => [field,
    evaluation.inputs[field].map(({ id }) => ({ id, vector: [1, ...Array(383).fill(0)], encode_ms: 1 })),
  ])),
};
validateEmbeddings(artifact, evaluation);
const stale = clone(artifact);
stale.input_sha256 = "stale";
assert.throws(() => validateEmbeddings(stale, evaluation), /provenance/);
const unnormalised = clone(artifact);
unnormalised.records[0].vector[0] = 2;
assert.throws(() => validateEmbeddings(unnormalised, evaluation), /unnormalised/);
const reordered = clone(artifact);
reordered.questions.reverse();
assert.throws(() => validateEmbeddings(reordered, evaluation), /reordered/);
const runs = evaluate(evaluation);
assertSameRankings(runs, runs);
const changed = clone(runs);
changed.bm25.questions[0].retrieved = ["different"];
assert.throws(() => assertSameRankings(runs, changed), /rankings changed/);

// This was observed before the new benchmark: it is a known failure, not a holdout.
const known = "How long does an e-commerce platform have to acknowledge and resolve a consumer complaint?";
assert.ok(!evaluation.benchmark.questions.some((q) => q.question === known));
console.log("Evaluation labels, BM25 formula, metrics, fusion, vector provenance and drift checks passed.");
