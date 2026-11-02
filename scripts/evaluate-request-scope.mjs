import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { prepareResearch, researchFallback } from "../research.js";
import { gradeRanking, summarise } from "./retrieval-metrics.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const benchmarkPath = "evaluation/consumer-web-20.json";
const baselinePath = "evaluation/results/consumer-web-20-2026-11-02.json";
const outputPath = "evaluation/results/request-scope-development.json";
const hash = (text) => createHash("sha256").update(text).digest("hex");
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));
const benchmark = await readJson(benchmarkPath);
const baseline = await readJson(baselinePath);
const fingerprints = {};
for (const path of [benchmarkPath, baselinePath, "research.js", "api/ask.js", "app.js",
  "data/consumer-law/v1/records.json", "scripts/evaluate-request-scope.mjs"]) {
  fingerprints[path] = hash((await readFile(resolve(root, path), "utf8")).replaceAll("\r\n", "\n"));
}

const rows = benchmark.questions.map((question) => {
  const started = performance.now();
  const plan = prepareResearch(question.question, benchmark.as_of);
  const response = researchFallback(plan);
  const ids = plan.sources.map((source) => source.recordId);
  return {
    id: question.id, kind: question.kind, category: question.category,
    coverage: plan.coverage, mode: response.mode, retrieved: ids,
    supported: plan.supported, not_verified: plan.notVerified,
    grade: gradeRanking(question, ids, 3),
    baseline_retrieved: baseline.runs.keyword.questions.find((row) => row.id === question.id).retrieved,
    query_ms: Number((performance.now() - started).toFixed(4)),
  };
});
const report = {
  name: "request-scope-development-v1", run_at: new Date().toISOString(), as_of: benchmark.as_of,
  purpose: "Post-change development run on already-seen public questions, not an unseen evaluation or generated-answer accuracy measurement.",
  label_limit: "Frozen public labels have documented prompt-fact and evidence-strategy limitations. These grades are descriptive provisional checkpoint coverage only.",
  fingerprints, metrics: summarise(rows),
  behavior: {
    no_answer: rows.filter((row) => row.mode === "no_answer").length,
    partial_excerpts: rows.filter((row) => row.coverage === "partial").length,
    unsupported_questions_without_cards: rows.filter((row) => row.kind === "out_of_scope" && !row.retrieved.length).length,
    partly_supported_questions_without_cards: rows.filter((row) => row.kind === "in_scope" && !row.retrieved.length).map((row) => row.id),
    partly_supported_questions_with_some_labelled_evidence: rows.filter((row) => row.kind === "in_scope" && row.grade.recall_at_k > 0).length,
  },
  questions: rows,
};

const args = process.argv.slice(2);
if (args.length === 2 && args[0] === "--output") {
  const path = resolve(root, args[1]);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(report, null, 2)}\n`);
} else if (args.length === 1 && args[0] === "--check") {
  const saved = await readJson(outputPath);
  const stable = (value) => ({ fingerprints: value.fingerprints,
    behavior: value.behavior, questions: value.questions.map(({ query_ms, ...row }) => row),
    metrics: Object.fromEntries(Object.entries(value.metrics).filter(([key]) => !key.startsWith("query_"))) });
  if (JSON.stringify(stable(saved)) !== JSON.stringify(stable(report))) {
    throw new Error("Request-scope development behavior changed. Inspect and record a new run; do not rewrite the historical evaluation.");
  }
} else if (args.length) throw new Error("Use --check or --output PATH.");

console.log(`Development run: unsupported requests without cards ${report.behavior.unsupported_questions_without_cards}/5; ` +
  `complete provisional evidence ${rows.filter((row) => row.kind === "in_scope" && row.grade.complete_at_k).length}/15. ` +
  `Known questions and provisional labels: not an accuracy claim.`);
