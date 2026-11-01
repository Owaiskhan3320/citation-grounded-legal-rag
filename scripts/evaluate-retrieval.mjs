import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { cpus, platform, arch } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getStatutes } from "../data/statutes.js";
import { retrieveEvidence } from "../rag.js";
import { buildBm25, gradeRanking, rankVectors, reciprocalRankFusion, recordText, summarise } from "./retrieval-metrics.mjs";

export const ROOT = fileURLToPath(new URL("../", import.meta.url));
const BENCHMARK = "evaluation/consumer-50.json";
const LOCK = "evaluation/consumer-50.lock.json";
const RESULTS = "evaluation/results/consumer-50-2026-11-02.json";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const readJson = async (path) => JSON.parse(await readFile(resolve(ROOT, path), "utf8"));

export function validateBenchmark(benchmark, records) {
  const active = new Set(records.map((record) => record.id));
  const questions = benchmark.questions;
  if (benchmark.top_k !== 3 || !Array.isArray(questions) || questions.length !== 50 ||
      questions.filter((q) => q.kind === "in_scope").length !== 40 ||
      questions.filter((q) => q.kind === "out_of_scope").length !== 10) {
    throw new Error("Benchmark must contain 40 in-scope and 10 out-of-scope questions, with top_k=3.");
  }
  const ids = new Set();
  const prompts = new Set();
  for (const question of questions) {
    if (!question.id || ids.has(question.id) || typeof question.question !== "string" ||
        question.question.trim().length < 10 || prompts.has(question.question.trim().toLowerCase()) ||
        !question.category || !question.checkpoint || !Array.isArray(question.required_evidence)) {
      throw new Error(`Invalid or duplicated benchmark question: ${question.id}`);
    }
    ids.add(question.id);
    prompts.add(question.question.trim().toLowerCase());
    if (question.kind === "in_scope" && question.required_evidence.length === 0) {
      throw new Error(`Missing evidence labels: ${question.id}`);
    }
    if (question.kind === "out_of_scope" && question.required_evidence.length !== 0) {
      throw new Error(`Out-of-scope question has evidence labels: ${question.id}`);
    }
    const labelled = new Set();
    for (const group of question.required_evidence) {
      if (!Array.isArray(group) || group.length === 0) throw new Error(`Empty evidence group: ${question.id}`);
      for (const id of group) {
        if (!active.has(id) || labelled.has(id)) throw new Error(`Inactive or repeated evidence label: ${id}`);
        labelled.add(id);
      }
    }
  }
}

export async function loadEvaluation() {
  const benchmark = await readJson(BENCHMARK);
  const records = getStatutes(benchmark.as_of);
  validateBenchmark(benchmark, records);
  const files = [BENCHMARK, "data/consumer-law/v1/records.json", "data/consumer-law/v1/sources.json",
    "data/statutes.js", "search.js", "rag.js"];
  const fingerprints = {};
  for (const file of files) {
    // Canonical LF makes the fingerprint portable across Git's Windows checkouts.
    fingerprints[file] = hash((await readFile(resolve(ROOT, file), "utf8")).replaceAll("\r\n", "\n"));
  }
  const inputs = {
    records: records.map((record) => ({ id: record.id, text: recordText(record) })),
    questions: benchmark.questions.map(({ id, question }) => ({ id, text: question })),
  };
  return { benchmark, records, fingerprints, inputs, input_sha256: hash(JSON.stringify(inputs)) };
}

export function validateEmbeddings(artifact, evaluation) {
  const expected = evaluation.benchmark.embedding;
  if (artifact.input_sha256 !== evaluation.input_sha256 || artifact.model !== expected.model ||
      artifact.revision !== expected.revision || artifact.normalised !== true ||
      artifact.dimensions !== 384 || !Number.isFinite(artifact.load_ms) || artifact.load_ms < 0 ||
      !Number.isFinite(artifact.index_ms) || artifact.index_ms < 0) {
    throw new Error("Embedding provenance/configuration does not match the frozen inputs.");
  }
  for (const field of ["records", "questions"]) {
    const expectedIds = evaluation.inputs[field].map((row) => row.id);
    if (!Array.isArray(artifact[field]) || artifact[field].length !== expectedIds.length) {
      throw new Error(`Embedding ${field} count mismatch.`);
    }
    artifact[field].forEach((row, index) => {
      const norm = Array.isArray(row.vector) && Math.hypot(...row.vector);
      if (row.id !== expectedIds[index] || !Array.isArray(row.vector) || row.vector.length !== 384 ||
          !row.vector.every(Number.isFinite) || Math.abs(norm - 1) > 0.001 ||
          (field === "questions" && (!Number.isFinite(row.encode_ms) || row.encode_ms < 0))) {
        throw new Error(`Invalid, unnormalised or reordered embedding: ${row.id}`);
      }
    });
  }
}

export function evaluate(evaluation, embeddings) {
  const { records, benchmark } = evaluation;
  const bm25 = buildBm25(records, benchmark.bm25);
  const runs = { keyword: [], bm25: [] };
  if (embeddings) {
    validateEmbeddings(embeddings, evaluation);
    runs.dense = [];
    runs.hybrid_rrf = [];
  }
  const warmQuestion = benchmark.questions[0].question;
  retrieveEvidence(warmQuestion, benchmark.as_of);
  const warmLexical = bm25(warmQuestion);
  if (embeddings) {
    reciprocalRankFusion([warmLexical, rankVectors(embeddings.questions[0].vector, embeddings.records)],
      benchmark.embedding.rrf_k);
  }
  for (const [index, question] of benchmark.questions.entries()) {
    let started = performance.now();
    const keyword = retrieveEvidence(question.question, benchmark.as_of).map((row) => ({ id: row.recordId }));
    const keywordMs = performance.now() - started;
    started = performance.now();
    const lexical = bm25(question.question);
    const bm25Ms = performance.now() - started;
    const rankings = { keyword, bm25: lexical };
    const times = { keyword: keywordMs, bm25: bm25Ms };
    if (embeddings) {
      started = performance.now();
      rankings.dense = rankVectors(embeddings.questions[index].vector, embeddings.records);
      times.dense = performance.now() - started + embeddings.questions[index].encode_ms;
      started = performance.now();
      rankings.hybrid_rrf = reciprocalRankFusion([lexical, rankings.dense], benchmark.embedding.rrf_k);
      times.hybrid_rrf = performance.now() - started + times.dense + bm25Ms;
    }
    for (const [method, ranking] of Object.entries(rankings)) {
      const ids = ranking.slice(0, benchmark.top_k).map((row) => row.id);
      runs[method].push({
        id: question.id, kind: question.kind, category: question.category,
        retrieved: ids,
        grade: gradeRanking(question, ids, benchmark.top_k),
        query_ms: Number(times[method].toFixed(4)),
      });
    }
  }
  return Object.fromEntries(Object.entries(runs).map(([method, rows]) => [method, {
    metrics: summarise(rows), questions: rows,
  }]));
}

export function assertSameRankings(actual, expected) {
  for (const method of ["keyword", "bm25"]) {
    const snapshot = (report) => report[method].questions.map(({ id, retrieved, grade }) => ({ id, retrieved, grade }));
    if (JSON.stringify(snapshot(actual)) !== JSON.stringify(snapshot(expected))) {
      throw new Error(`${method} rankings changed. Inspect the per-question diff; do not silently overwrite the frozen run.`);
    }
  }
}

async function writeJson(path, value, exclusive = false) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, { flag: exclusive ? "wx" : "w" });
}

async function main(args) {
  const flags = new Set(["--freeze", "--check", "--export-inputs"]);
  const values = new Map();
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (flags.has(arg)) values.set(arg, true);
    else if (["--embeddings", "--output"].includes(arg) && args[i + 1] && !args[i + 1].startsWith("--")) {
      values.set(arg, args[++i]);
    } else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  const evaluation = await loadEvaluation();
  if (values.has("--freeze")) {
    await writeJson(resolve(ROOT, LOCK), {
      frozen_on: evaluation.benchmark.created_on, as_of: evaluation.benchmark.as_of,
      fingerprints: evaluation.fingerprints, input_sha256: evaluation.input_sha256,
    }, true);
    console.log("Frozen benchmark and production inputs. No retrieval scores have been computed.");
    return;
  }
  const lock = await readJson(LOCK);
  if (JSON.stringify(lock.fingerprints) !== JSON.stringify(evaluation.fingerprints) ||
      lock.input_sha256 !== evaluation.input_sha256 || lock.as_of !== evaluation.benchmark.as_of) {
    throw new Error("Frozen benchmark/corpus/production files changed. Use a new benchmark version and document why.");
  }
  if (values.has("--export-inputs")) {
    console.log(JSON.stringify({ ...evaluation.inputs, input_sha256: evaluation.input_sha256,
      embedding: evaluation.benchmark.embedding }));
    return;
  }
  const embeddings = values.has("--embeddings") ? await readJson(values.get("--embeddings")) : undefined;
  const runs = evaluate(evaluation, embeddings);
  if (values.has("--check")) {
    const saved = await readJson(RESULTS);
    if (saved.input_sha256 !== evaluation.input_sha256 ||
        JSON.stringify(saved.fingerprints) !== JSON.stringify(evaluation.fingerprints)) {
      throw new Error("Saved run was not produced from the frozen inputs.");
    }
    assertSameRankings(runs, saved.runs);
    console.log("Frozen keyword/BM25 rankings unchanged across all 50 questions. This is not an answer-accuracy check.");
  }
  const report = {
    benchmark: evaluation.benchmark.name, run_at: new Date().toISOString(), as_of: evaluation.benchmark.as_of,
    authorship: evaluation.benchmark.authorship, fingerprints: evaluation.fingerprints,
    input_sha256: evaluation.input_sha256, record_count: evaluation.records.length,
    runtime: { node: process.version, platform: platform(), arch: arch(), cpu: cpus()[0]?.model },
    configuration: { top_k: evaluation.benchmark.top_k, bm25: evaluation.benchmark.bm25,
      dense_abstention_threshold: null, bm25_min_score_exclusive: 0,
      rrf_k: evaluation.benchmark.embedding.rrf_k, rrf_depth: evaluation.records.length },
    comparator_sha256: hash(await readFile(resolve(ROOT, "scripts/retrieval-metrics.mjs"))),
    embedding: embeddings ? Object.fromEntries(Object.entries(embeddings).filter(([key]) =>
      !["records", "questions"].includes(key))) : null,
    runs,
  };
  if (values.has("--output")) {
    await writeJson(resolve(ROOT, values.get("--output")), report);
  }
  for (const [method, run] of Object.entries(runs)) {
    const m = run.metrics;
    console.log(`${method}: hit@1=${m.hit_at_1.toFixed(3)} recall@3=${m.macro_evidence_recall_at_3.toFixed(3)} ` +
      `complete@3=${m.complete_evidence_at_3.toFixed(3)} OOS abstentions=${m.out_of_scope_abstentions}/10`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
