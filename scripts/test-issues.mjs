import assert from "node:assert/strict";

import { getIssueGuide, getOfficialRoutes, issuePaths } from "../issues.js";
import { retrieveEvidence } from "../rag.js";

assert.equal(issuePaths.length, 6);
assert.equal(getIssueGuide("missing"), null);
for (const issue of issuePaths) {
  const guide = getIssueGuide(issue.id, "2026-11-01");
  assert.equal(guide.records.length, issue.record_ids.length);
  assert.ok(guide.records.every((record) => record.review_status === "source_checked"));
  assert.ok(retrieveEvidence(issue.question, "2026-11-01").length > 0, issue.question);
}
const oldSeller = getIssueGuide("seller-dispute", "2026-12-31").records;
const newSeller = getIssueGuide("seller-dispute", "2027-01-01").records;
assert.equal(oldSeller.find((r) => r.id === "ecommerce-platform-response-time").version, "2020-07-23");
assert.equal(newSeller.find((r) => r.id === "ecommerce-platform-response-time").version, "2027-01-01");
assert.match(newSeller.find((r) => r.id === "ecommerce-platform-response-time").excerpt, /copy of the complaint/);

const routes = getOfficialRoutes("2026-11-01");
assert.equal(routes.length, 3);
assert.equal(getOfficialRoutes("2026-10-31").length, 0);
for (const route of routes) {
  assert.equal(route.source.source_type, "action");
  assert.equal(route.source.date_basis, "observed");
  assert.equal(route.source.sourceFormat, "html");
  assert.equal(new URL(route.url).protocol, "https:");
}

const checks = [
  ["Who may complain under Section 2(5)?", "complainant-definition"],
  ["What is a defect under Section 2(10)?", "defect-definition"],
  ["What is deficiency under Section 2(11)?", "deficiency-definition"],
  ["What is harm under Section 2(22)?", "harm-definition"],
  ["What is service under Section 2(42)?", "service-definition"],
  ["What is an unfair contract under Section 2(46)?", "unfair-contract-definition"],
  ["How is admissibility decided under Section 36?", "complaint-admission"],
  ["Can a complaint go to mediation under Section 37?", "reference-to-mediation"],
  ["Can the District Commission review its order under Section 40?", "district-review"],
  ["What does Section 47(4) say about the State Commission?", "state-commission-territorial-jurisdiction"],
  ["How is a State Commission order appealed under Section 51?", "appeal-state-commission"],
  ["Which orders may go to the Supreme Court under Section 67?", "appeal-national-commission"],
  ["How is an order enforced under Section 71?", "enforcement-of-orders"],
  ["What happens for noncompliance under Section 72?", "noncompliance-with-orders"],
  ["What does Section 74 say about mediation cells?", "consumer-mediation-cell"],
  ["How does mediation work under Section 79?", "mediation-procedure"],
  ["Is a mediated agreement signed under Section 80?", "mediation-settlement"],
  ["How is settlement recorded under Section 81?", "recording-mediation-settlement"],
  ["What is the scope of Section 82?", "product-liability-scope"],
  ["Who may face a product liability action under Section 83?", "product-liability-action"],
  ["When is a manufacturer liable under Section 84?", "product-manufacturer-liability"],
  ["When is a product service provider liable under Section 85?", "product-service-provider-liability"],
  ["When is a product seller liable under Section 86?", "product-seller-liability"],
  ["What are the exceptions under Section 87?", "product-liability-exceptions"],
  ["What does Rule 4(8) say about cancellation charges?", "ecommerce-cancellation-charges"],
  ["What does Rule 4(9) say about pre-ticked checkboxes?", "ecommerce-affirmative-consent"],
  ["What does Rule 4(10) say about accepted refunds?", "ecommerce-accepted-refunds"],
  ["What is confirm shaming?", "dark-pattern-confirm-shaming"],
  ["What is forced action?", "dark-pattern-forced-action"],
  ["What is interface interference?", "dark-pattern-interface-interference"],
  ["What is nagging?", "dark-pattern-nagging"],
  ["What is a trick question?", "dark-pattern-trick-question"],
  ["What is Saas billing?", "dark-pattern-saas-billing"],
  ["What are rogue malwares?", "dark-pattern-rogue-malware"],
  ["How can I contact the national consumer helpline?", "nch-complaint-channels"],
  ["How do I track an NCH grievance?", "nch-tracking"],
  ["What is the difference between NCH and a consumer commission?", "nch-prelitigation-limits"],
  ["How do I file a case through e-Jagriti?", "ejagriti-online-filing"],
];
for (const [question, recordId] of checks) {
  assert.equal(retrieveEvidence(question, "2026-11-01")[0]?.recordId, recordId, question);
}
const limits = retrieveEvidence(issuePaths.find((issue) => issue.id === "filing").question);
assert.deepEqual(limits.map((source) => source.recordId), ["jurisdiction-district-value", "jurisdiction-state-value", "jurisdiction-national-value"]);
assert.match(limits[0].excerpt, /does not exceed fifty lakh/);
assert.match(limits[1].excerpt, /exceeds fifty lakh but does not exceed two crore/);
assert.match(limits[2].excerpt, /exceeds two crore/);
assert.doesNotMatch(retrieveEvidence("Rule 4(10)")[0].excerpt, /seven days|seven working days/);

console.log(`Issue guides, official routes and ${checks.length} new retrieval regressions passed.`);
