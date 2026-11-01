import guides from "./data/consumer-law/issue-paths.json" with { type: "json" };
import { getStatutes } from "./data/statutes.js";

export const issuePaths = guides.issues;

export function getIssueGuide(issueId, asOf) {
  const issue = issuePaths.find((item) => item.id === issueId);
  if (!issue) return null;
  const records = new Map(getStatutes(asOf).map((record) => [record.id, record]));
  return {
    ...issue,
    records: issue.record_ids.map((id) => records.get(id)).filter(Boolean),
  };
}

export function getOfficialRoutes(asOf) {
  const records = new Map(getStatutes(asOf).map((record) => [record.id, record]));
  return guides.routes
    .filter((route) => records.has(route.record_id))
    .map((route) => ({ ...route, source: records.get(route.record_id) }));
}
