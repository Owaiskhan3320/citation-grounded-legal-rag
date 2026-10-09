const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "about",
  "can",
  "do",
  "for",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "or",
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
  const tokens = queryTokens(query);

  return statutes
    .map((record) => {
      let score = 0;
      const field = `${record.section} ${record.title} ${record.summary} ${record.keywords.join(" ")}`.toLowerCase();

      if (normalised.includes(record.section.toLowerCase())) {
        score += 20;
      }

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
    .filter((result) => result.score >= 4)
    .sort((left, right) => right.score - left.score)
    .map((result) => result.record);
}
