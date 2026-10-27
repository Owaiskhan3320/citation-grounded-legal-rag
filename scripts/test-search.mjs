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

const unsupportedResult = findStatuteMatches("How do I contest a divorce?", statutes);
assert.equal(unsupportedResult.length, 0);

console.log("Search checks passed.");
