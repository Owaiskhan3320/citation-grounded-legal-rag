import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { cpus, platform } from "node:os";
import { pathToFileURL } from "node:url";

import { ROOT, assertSameRankings, evaluate, loadEvaluation, validateSavedGrades } from "./evaluate-retrieval.mjs";

const BENCHMARK = "evaluation/consumer-web-20.json";
const LOCK = "evaluation/consumer-web-20.lock.json";
const RESULTS = "evaluation/results/consumer-web-20-2026-11-02.json";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const readJson = async (path) => JSON.parse(await readFile(resolve(ROOT, path), "utf8"));

export function validatePublicQuestions(benchmark, records) {
  if (benchmark.top_k !== 3 || benchmark.human_review !== "pending" ||
      benchmark.questions?.length !== 20 ||
      benchmark.questions.filter((q) => q.kind === "in_scope").length !== 15 ||
      benchmark.questions.filter((q) => q.kind === "out_of_scope").length !== 5) {
    throw new Error("Expected 15 partly supported and 5 unsupported questions; owner review remains pending.");
  }
  const ids = new Set();
  const posts = new Set();
  const prompts = new Set();
  const activeIds = new Set(records.map((record) => record.id));
  for (const question of benchmark.questions) {
    const source = question.source;
    const url = new URL(source?.url);
    const post = url.pathname.match(/^\/r\/[^/]+\/comments\/([a-z0-9]+)(?:\/|$)/)?.[1];
    if (!/^W\d{2}$/.test(question.id) || ids.has(question.id) ||
        typeof question.question !== "string" || question.question.length < 10 || question.question.length > 600 ||
        prompts.has(question.question.toLowerCase()) || !question.category || !question.checkpoint ||
        !question.unsupported_requests || !Array.isArray(question.required_evidence)) {
      throw new Error(`Invalid or duplicated question: ${question.id}`);
    }
    if (url.protocol !== "https:" || url.hostname !== "www.reddit.com" || url.username || url.password ||
        url.port || url.search || url.hash || !post || posts.has(post) || source.observed_on !== benchmark.created_on ||
        !["page_text", "search_index"].includes(source.access) || typeof source.excerpt !== "string" ||
        !source.excerpt.trim() || source.excerpt.trim().split(/\s+/).length > 25) {
      throw new Error(`Invalid, duplicated or excessive source attribution: ${question.id}`);
    }
    if (/[\w.+-]+@[\w.-]+\.[a-z]+|\b\d{7,}\b/i.test(`${question.question} ${source.excerpt}`)) {
      throw new Error(`Possible personal identifier in prompt/excerpt: ${question.id}`);
    }
    const supported = question.kind === "in_scope";
    if (question.coverage !== (supported ? "partial" : "none") ||
        supported !== (question.required_evidence.length > 0)) {
      throw new Error(`Wrong scope/evidence classification: ${question.id}`);
    }
    const labelled = new Set();
    for (const group of question.required_evidence) {
      if (!Array.isArray(group) || !group.length) throw new Error(`Empty evidence group: ${question.id}`);
      for (const id of group) {
        if (!activeIds.has(id) || labelled.has(id)) throw new Error(`Inactive or repeated evidence label: ${id}`);
        labelled.add(id);
      }
    }
    ids.add(question.id);
    posts.add(post);
    prompts.add(question.question.toLowerCase());
  }
}

export async function loadPublicEvaluation() {
  // Reuse Week 3's records, text fields and comparison code without changing its frozen run.
  const baseline = await loadEvaluation();
  const benchmark = await readJson(BENCHMARK);
  if (benchmark.as_of !== baseline.benchmark.as_of ||
      JSON.stringify(benchmark.bm25) !== JSON.stringify(baseline.benchmark.bm25) ||
      JSON.stringify(benchmark.embedding) !== JSON.stringify(baseline.benchmark.embedding)) {
    throw new Error("Public comparison must retain the original date and method configuration.");
  }
  validatePublicQuestions(benchmark, baseline.records);
  const fingerprints = { ...baseline.fingerprints,
    [BENCHMARK]: hash((await readFile(resolve(ROOT, BENCHMARK), "utf8")).replaceAll("\r\n", "\n")) };
  const inputs = { records: baseline.inputs.records,
    questions: benchmark.questions.map(({ id, question }) => ({ id, text: question })) };
  const implementationFingerprints = { ...baseline.implementationFingerprints };
  for (const file of ["scripts/evaluate-public-questions.mjs", "scripts/export_public_embeddings.py"]) {
    implementationFingerprints[file] = hash((await readFile(resolve(ROOT, file), "utf8")).replaceAll("\r\n", "\n"));
  }
  return { benchmark, records: baseline.records, fingerprints, inputs, implementationFingerprints,
    input_sha256: hash(JSON.stringify(inputs)) };
}

async function save(path, value, exclusive = false) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, { flag: exclusive ? "wx" : "w" });
}

async function main(args) {
  const options = new Map();
  for (let i = 0; i < args.length; i += 1) {
    if (["--freeze", "--check", "--export-inputs"].includes(args[i])) options.set(args[i], true);
    else if (["--embeddings", "--output"].includes(args[i]) && args[i + 1] && !args[i + 1].startsWith("--")) {
      options.set(args[i], args[++i]);
    } else throw new Error(`Unknown or incomplete argument: ${args[i]}`);
  }
  const evaluation = await loadPublicEvaluation();
  if (options.has("--freeze")) {
    await save(resolve(ROOT, LOCK), { frozen_on: evaluation.benchmark.created_on,
      fingerprints: evaluation.fingerprints, input_sha256: evaluation.input_sha256 }, true);
    console.log("Public questions and source labels frozen before scoring.");
    return;
  }
  const lock = await readJson(LOCK);
  if (JSON.stringify(lock.fingerprints) !== JSON.stringify(evaluation.fingerprints) ||
      lock.input_sha256 !== evaluation.input_sha256) throw new Error("Frozen public inputs changed.");
  if (options.has("--export-inputs")) {
    console.log(JSON.stringify({ ...evaluation.inputs, input_sha256: evaluation.input_sha256,
      embedding: evaluation.benchmark.embedding }));
    return;
  }
  const bytes = options.has("--embeddings") ? await readFile(resolve(ROOT, options.get("--embeddings"))) : null;
  const embeddings = bytes ? JSON.parse(bytes.toString("utf8")) : undefined;
  const runs = evaluate(evaluation, embeddings);
  if (options.has("--check")) {
    const saved = await readJson(RESULTS);
    if (saved.input_sha256 !== evaluation.input_sha256 ||
        JSON.stringify(saved.fingerprints) !== JSON.stringify(evaluation.fingerprints) ||
        JSON.stringify(saved.implementation_fingerprints) !== JSON.stringify(evaluation.implementationFingerprints)) {
      throw new Error("Public report inputs/scorer fingerprints changed.");
    }
    validateSavedGrades(saved.runs, evaluation);
    assertSameRankings(runs, saved.runs);
    console.log("Public keyword/BM25 rankings and stored grades reproduced. Owner review is still pending.");
  }
  const report = {
    benchmark: evaluation.benchmark.name, run_at: new Date().toISOString(), as_of: evaluation.benchmark.as_of,
    authorship: evaluation.benchmark.authorship, grading_target: evaluation.benchmark.grading_target,
    human_review: "pending", partly_supported_questions: 15, unsupported_questions: 5, fully_answerable_questions: 0,
    fingerprints: evaluation.fingerprints, input_sha256: evaluation.input_sha256,
    implementation_fingerprints: evaluation.implementationFingerprints,
    embedding_artifact_sha256: bytes ? hash(bytes) : null,
    configuration: { top_k: 3, bm25: evaluation.benchmark.bm25, dense_abstention_threshold: null,
      bm25_min_score_exclusive: 0, rrf_k: evaluation.benchmark.embedding.rrf_k, rrf_depth: evaluation.records.length },
    runtime: { node: process.version, platform: platform(), cpu: cpus()[0]?.model },
    embedding: embeddings ? Object.fromEntries(Object.entries(embeddings).filter(([key]) =>
      !["records", "questions"].includes(key))) : null,
    runs,
  };
  if (options.has("--output")) await save(resolve(ROOT, options.get("--output")), report);
  for (const [method, run] of Object.entries(runs)) {
    const m = run.metrics;
    console.log(`${method}: supported-part complete@3=${m.complete_evidence_at_3.toFixed(3)} ` +
      `recall@3=${m.macro_evidence_recall_at_3.toFixed(3)}; unsupported abstentions=${m.out_of_scope_abstentions}/5`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
