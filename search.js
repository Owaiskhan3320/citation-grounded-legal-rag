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
  "makes",
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

function scoreRecords(statutes, normalised, tokens) {
  return statutes.map((record) => {
    let score = 0;
    const field = [record.section, record.title, record.summary, record.keywords.join(" ")]
      .join(" ")
      .toLowerCase();

    for (const keyword of record.keywords) {
      const normalisedKeyword = normaliseQuery(keyword);
      if (normalised.includes(normalisedKeyword)) {
        score += normalisedKeyword.includes(" ") ? 8 : 4;
      }
    }

    for (const token of tokens) {
      if (field.includes(token)) {
        score += 1;
      }
    }

    return { record, score };
  });
}

function rankMatches(scoredRecords) {
  return scoredRecords
    .filter((result) => result.score >= 2)
    .sort((left, right) => right.score - left.score)
    .filter((result, index, ranked) => {
      const strongestScore = ranked[0].score;
      return index === 0 || result.score >= strongestScore * 0.6;
    });
}

export function findStatuteMatches(query, statutes) {
  const normalised = normaliseQuery(query);
  const tokens = [...new Set(queryTokens(query))];

  const exactSectionMatches = statutes
    .map((record) => {
      const references = record.references || [record.section];
      const specificity = Math.max(
        ...references
          .map((reference) => normaliseQuery(reference))
          .filter((reference) => normalised.includes(reference))
          .map((reference) => reference.length),
        0,
      );
      return { record, specificity };
    })
    .filter((result) => result.specificity > 0)
    .sort((left, right) => right.specificity - left.specificity);

  // A specific provision or named topic is more reliable than keyword relevance.
  // Broad topic labels must not hide concrete scenarios in a combined question.
  const highestSpecificity = exactSectionMatches[0]?.specificity;
  const specificExactMatches = exactSectionMatches
    .filter(
      ({ record, specificity }) =>
        !record.isBroadTopic && specificity === highestSpecificity,
    )
    .map(({ record }) => record);

  if (specificExactMatches.length > 0) {
    const genericRule = specificExactMatches.find((record) => /^Rule \d+$/.test(record.section));

    if (genericRule) {
      const subRulePrefix = `${normaliseQuery(genericRule.section)}(`;
      const relatedSubRules = scoreRecords(statutes, normalised, tokens)
        .filter(
          ({ record, score }) =>
            normaliseQuery(record.section).startsWith(subRulePrefix) && score >= 6,
        )
        .sort((left, right) => right.score - left.score)
        .map(({ record }) => record);

      if (relatedSubRules.length > 0) {
        return [...relatedSubRules, ...specificExactMatches];
      }
    }

    return specificExactMatches;
  }

  return rankMatches(scoreRecords(statutes, normalised, tokens)).map(({ record }) => record);
}
