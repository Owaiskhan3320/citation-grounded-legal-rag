const STOP_WORDS = new Set(
  "a an and are about act can consumer do for how i india indian in is it law legal makes of or protection section the to under what with".split(" "),
);

export function tokens(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter((token) => !STOP_WORDS.has(token));
}

export function recordText(record) {
  // Use the same metadata fields as the production keyword retriever.
  return [record.section, record.title, record.summary, record.keywords.join(" ")].join("\n");
}

export function buildBm25(records, { k1, b }) {
  if (!(k1 > 0 && b >= 0 && b <= 1) || records.length === 0) {
    throw new Error("BM25 needs records, k1 > 0 and 0 <= b <= 1.");
  }
  const documents = records.map((record) => {
    const words = tokens(recordText(record));
    const counts = new Map();
    for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
    return { id: record.id, length: words.length, counts };
  });
  const documentFrequency = new Map();
  for (const document of documents) {
    for (const word of document.counts.keys()) {
      documentFrequency.set(word, (documentFrequency.get(word) || 0) + 1);
    }
  }
  const averageLength = documents.reduce((sum, doc) => sum + doc.length, 0) / documents.length || 1;

  return (question) => documents.map((document) => {
    let score = 0;
    for (const word of new Set(tokens(question))) {
      const frequency = document.counts.get(word) || 0;
      if (!frequency) continue;
      const df = documentFrequency.get(word);
      const idf = Math.log(1 + (documents.length - df + 0.5) / (df + 0.5));
      score += idf * frequency * (k1 + 1) /
        (frequency + k1 * (1 - b + b * document.length / averageLength));
    }
    return { id: document.id, score };
  }).filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}

export function rankVectors(query, documents) {
  if (!Array.isArray(query) || !query.length || !query.every(Number.isFinite)) {
    throw new Error("Invalid query vector.");
  }
  return documents.map(({ id, vector }) => {
    if (vector.length !== query.length || !vector.every(Number.isFinite)) {
      throw new Error("Invalid document vector or dimension mismatch.");
    }
    return { id, score: vector.reduce((sum, value, i) => sum + value * query[i], 0) };
  }).sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}

export function reciprocalRankFusion(rankings, k) {
  if (!(k > 0)) throw new Error("RRF k must be positive.");
  const scores = new Map();
  for (const ranking of rankings) {
    for (const [index, { id }] of ranking.entries()) {
      scores.set(id, (scores.get(id) || 0) + 1 / (k + index + 1));
    }
  }
  return [...scores].map(([id, score]) => ({ id, score }))
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}

export function gradeRanking(question, ids, topK) {
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate ranked record.");
  const top = ids.slice(0, topK);
  if (question.kind === "out_of_scope") {
    return { abstained: top.length === 0 };
  }
  const groups = question.required_evidence;
  const hits = groups.filter((alternatives) => alternatives.some((id) => top.includes(id))).length;
  const firstRelevant = top.findIndex((id) => groups.some((alternatives) => alternatives.includes(id)));
  return {
    hit_at_1: groups.some((alternatives) => alternatives.includes(top[0])),
    recall_at_k: hits / groups.length,
    complete_at_k: hits === groups.length,
    reciprocal_rank_at_k: firstRelevant < 0 ? 0 : 1 / (firstRelevant + 1),
  };
}

export function summarise(rows) {
  const supported = rows.filter((row) => row.kind === "in_scope");
  const outside = rows.filter((row) => row.kind === "out_of_scope");
  const mean = (items, field) => items.reduce((sum, row) => sum + Number(row.grade[field]), 0) / items.length;
  const times = rows.map((row) => row.query_ms).sort((a, b) => a - b);
  return {
    in_scope_count: supported.length,
    hit_at_1: mean(supported, "hit_at_1"),
    macro_evidence_recall_at_3: mean(supported, "recall_at_k"),
    complete_evidence_at_3: mean(supported, "complete_at_k"),
    mrr_at_3: mean(supported, "reciprocal_rank_at_k"),
    out_of_scope_count: outside.length,
    out_of_scope_abstentions: outside.filter((row) => row.grade.abstained).length,
    out_of_scope_false_matches: outside.filter((row) => !row.grade.abstained).length,
    query_p50_ms: times[Math.ceil(times.length * 0.5) - 1],
    query_p95_ms: times[Math.ceil(times.length * 0.95) - 1],
  };
}
