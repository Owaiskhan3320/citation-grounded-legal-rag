const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "about",
  "act",
  "can",
  "consumer",
  "do",
  "for",
  "how",
  "i",
  "india",
  "indian",
  "in",
  "is",
  "it",
  "law",
  "legal",
  "of",
  "or",
  "protection",
  "section",
  "the",
  "to",
  "under",
  "what",
  "with",
]);

export function normaliseQuery(query) {
  return query.toLowerCase().replace(/[^a-z0-9()]/g, " ").replace(/\s+/g, " ").trim();
}

function queryTokens(query) {
  return normaliseQuery(query)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export function findStatuteMatches(query, statutes) {
  const normalised = normaliseQuery(query);
  const tokens = [...new Set(queryTokens(query))];

  const exactSectionMatches = statutes.filter((record) => {
    const references = record.references || [record.section];
    return references.some((reference) => normalised.includes(normaliseQuery(reference)));
  });

  // A specific section reference is more reliable than keyword relevance.
  if (exactSectionMatches.length > 0) {
    return exactSectionMatches;
  }

  return statutes
    .map((record) => {
      let score = 0;
      const field = `${record.section} ${record.title} ${record.summary} ${record.keywords.join(" ")}`.toLowerCase();

      for (const keyword of record.keywords) {
        if (normalised.includes(keyword.toLowerCase())) {
          score += keyword.includes(" ") ? 8 : 4;
        }
      }

      for (const token of tokens) {
        if (field.includes(token)) {
          score += 1;
        }
      }

      return { record, score };
    })
    .filter((result) => result.score >= 2)
    .sort((left, right) => right.score - left.score)
    .map((result) => result.record);
}
