import assert from "node:assert/strict";

import { statutes } from "../data/statutes.js";
import { findStatuteMatches } from "../search.js";

const rightsResult = findStatuteMatches(
  "What are consumer rights under section 2(9)?",
  statutes,
);
assert.equal(rightsResult[0].section, "Section 2(9)");
assert.equal(rightsResult.length, 1);

const rightsKeywordResult = findStatuteMatches("What consumer rights does the Act recognise?", statutes);
assert.equal(rightsKeywordResult.length, 1);
assert.equal(rightsKeywordResult[0].section, "Section 2(9)");

const advertisementResult = findStatuteMatches(
  "What can the Central Authority do about misleading advertisements?",
  statutes,
);
assert.equal(advertisementResult[0].section, "Section 21");

const sectionChecks = [
  ["What does section 2(6) say about a complaint?", "Section 2(6)"],
  ["Who is a consumer under section 2(7)?", "Section 2(7)"],
  ["What are consumer rights under section 2(9)?", "Section 2(9)"],
  ["What does section 2(47) say about unfair trade practices?", "Section 2(47)"],
  ["What does section 17 say about complaints to authorities?", "Section 17"],
  ["What are the Central Authority's functions under section 18?", "Section 18"],
  ["What investigation can the Central Authority start under section 19?", "Section 19"],
  ["Can the Central Authority recall unsafe goods under section 20?", "Section 20"],
  ["Where can I file a complaint under section 34?", "Section 34"],
  ["How can a complaint be filed under section 35?", "Section 35"],
  ["What procedure follows admission under section 38?", "Section 38"],
  ["What remedies can the District Commission order under section 39?", "Section 39"],
  ["How do I appeal a District Commission order under section 41?", "Section 41"],
  ["What is the complaint limitation period under section 69?", "Section 69"],
];

const ecommerceRuleChecks = [
  ["Do the E-Commerce Rules apply under rule 2?", "Rule 2"],
  ["What information must a platform display under rule 4(2)?", "Rule 4(2)"],
  ["What grievance mechanism is required under rule 4(4)?", "Rule 4(4)"],
  ["What must a marketplace disclose under rule 5?", "Rule 5"],
  ["What practices are prohibited for sellers under rule 6(1)?", "Rule 6(1)-(2)"],
  ["Can a seller refuse a refund under rule 6(3)?", "Rule 6(3)"],
  ["What response time applies under rule 6(4)?", "Rule 6(4)"],
  ["What must a seller disclose under rule 6(5)?", "Rule 6(5)"],
  ["What information is required under rule 7(1)?", "Rule 7(1)"],
  ["What does rule 7(2) say about reviews and refunds?", "Rule 7(2)-(5)"],
];

assert.equal(statutes.length, 25);

for (const [question, expectedSection] of sectionChecks) {
  const matches = findStatuteMatches(question, statutes);
  assert.equal(matches.length, 1, question);
  assert.equal(matches[0].section, expectedSection, question);
}

for (const [question, expectedRule] of ecommerceRuleChecks) {
  const matches = findStatuteMatches(question, statutes);
  assert.equal(matches.length, 1, question);
  assert.equal(matches[0].section, expectedRule, question);
}

const consumerDefinitionResult = findStatuteMatches("Who is a consumer under this Act?", statutes);
assert.equal(consumerDefinitionResult[0].section, "Section 2(7)");

const productRecallResult = findStatuteMatches("Can the Authority recall unsafe goods?", statutes);
assert.equal(productRecallResult[0].section, "Section 20");

const lateComplaintResult = findStatuteMatches("Can I make a complaint after two years?", statutes);
assert.equal(lateComplaintResult[0].section, "Section 69");

const sellerRefundResult = findStatuteMatches(
  "Can a marketplace seller refuse a refund for a defective product?",
  statutes,
);
assert.equal(sellerRefundResult[0].section, "Rule 6(3)");

const sellerResponseResult = findStatuteMatches(
  "How long does a marketplace seller have to acknowledge a complaint?",
  statutes,
);
assert.equal(sellerResponseResult[0].section, "Rule 6(4)");

const platformContactResult = findStatuteMatches(
  "What contact details must an online platform display?",
  statutes,
);
assert.equal(platformContactResult[0].section, "Rule 4(2)");

const marketplaceDisclosureResult = findStatuteMatches(
  "What ranking parameters must an online marketplace explain?",
  statutes,
);
assert.equal(marketplaceDisclosureResult[0].section, "Rule 5");

const foreignPlatformResult = findStatuteMatches(
  "Do the rules apply to a foreign website selling in India?",
  statutes,
);
assert.equal(foreignPlatformResult[0].section, "Rule 2");

const unsupportedResult = findStatuteMatches("How do I contest a divorce?", statutes);
assert.equal(unsupportedResult.length, 0);

console.log("Search checks passed.");
