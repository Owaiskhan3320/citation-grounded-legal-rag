import corpus from "./consumer-law/v1/records.json" with { type: "json" };
import manifest from "./consumer-law/v1/sources.json" with { type: "json" };

const sourcesById = new Map(manifest.sources.map((source) => [source.id, source]));

export function currentIndianDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getStatutes(asOf = currentIndianDate()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf) ||
      new Date(`${asOf}T00:00:00Z`).toISOString().slice(0, 10) !== asOf) {
    throw new RangeError("asOf must be a valid YYYY-MM-DD date.");
  }

  // End dates are exclusive, so a replacement starts when its predecessor ends.
  return corpus.records
    .filter((record) =>
      record.review_status === "source_checked" &&
      record.effective_from <= asOf &&
      (!record.effective_to || asOf < record.effective_to))
    .map((record) => ({
      ...record,
      sourceName: sourcesById.get(record.source_id).title,
      sourceUrl: sourcesById.get(record.source_id).official_url,
      excerpt: record.passages.map((passage) => passage.text).join("\n\n"),
      passages: record.passages.map((passage) => ({
        ...passage,
        sourceUrl: sourcesById.get(passage.source_id).official_url,
      })),
    }));
}

// Existing search consumers use this snapshot. Requests recheck the date with getStatutes().
export const statutes = getStatutes();
