import { getStatutes } from "./data/statutes.js";
import { buildFallbackAnswer, buildGroundedPrompt } from "./rag.js";

const MAX_SOURCES = 3;
const NO_ANSWER = "I could not verify this from the available source records.";
const OUTSIDE_SCOPE = [
  [/\b(rbi|npci|nbfc|banking ombudsman|chargeback|bank mandate|upi mandate|autopay settings)\b/i,
    "Banking rules, payment-reversal entitlements and bank/app mandate instructions are not verified by this corpus."],
  [/\b(fssai|allergen|jaggery|added sugar|food.labelling)\b/i,
    "FSSAI rules, food-labelling compliance and food-regulator procedures are not included."],
  [/\b(legal metrology|mrp penalty|packaged commodities)\b/i,
    "Legal Metrology rules and penalties are not included."],
  [/\b(dpdp|privacy|data protection|data erasure|personal data|medical records?|electronic health record|ehr|delete.{0,25}data)\b/i,
    "Privacy, data-erasure and medical-record retention authorities are not included."],
  [/\b(landlord|tenancy|rental deposit|rent act|evict|divorce|bail|fir|criminal|rti|income tax|tax deduction|tax return|constitution|fundamental rights|motor vehicles|road accident)\b/i,
    "The requested tenancy, criminal, family, tax or other non-consumer-law procedure is outside this source set."],
  [/\b(gdpr|(?:uk|eu|australian|canadian|united states) (?:law|consumer law|consumer protection))\b|consumer protection act(?:\s+of)?[,\s]+1986\b|\bcpa\s*1986\b/i,
    "This corpus does not verify the requested foreign legislation or the superseded 1986 Act."],
  [/\b(similar cases?|precedents?|case number|actual.{0,30}judgment|supreme court judgment|predict|guaranteed?|win.{0,15}case|strong.{0,15}case|realistic.{0,20}compensation)\b/i,
    "These records cannot verify a similar judgment, predict a decision or guarantee an award."],
  [/\b(whatsapp.{0,30}(terms|contract)|(?:terms|contract).{0,30}whatsapp)\b/i,
    "Whether a message became part of a particular contract requires authorities and facts not supplied here."],
];
const PROCEDURAL_LIMIT = /\b(affidavit|notari[sz]ed|certified copy|documents required|what documents|fee schedule|scrutiny|address proof|proof of address|portal.{0,20}(error|wrong|reject))\b/i;
const PERSONAL_CASE = /\b(i|my|we|our)\b/i;
const CASE_FACT = /\b(bought|paid|received|delivered|charged|cancelled|canceled|refused|rejected|filed|keeping|dispute|defective|damaged|expired|happened)\b/i;
const ONLINE = /\b(online|marketplace|platform|website|shopping|app|e.commerce|streaming|subscription)\b/i;
const FILING = /\b(file|filing|complaint|complain|court|commission|e.?jagriti|e.?daakhil)\b/i;
const unique = (items) => [...new Set(items)];
const normalise = (text) => text.toLowerCase().replace(/[^a-z0-9()]/g, " ").replace(/\s+/g, " ").trim();
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const phraseIn = (text, phrase) => new RegExp(`(?:^| )${escape(normalise(phrase))}(?=$| )`).test(normalise(text));

function requestParts(question) {
  return question.split(/[?;!\n]+|\.(?:\s+|$)|\b(?:and|or|also)\s+(?=(?:what|how|can|could|which|will|would|is|are|do|does|tell|under|section|rule|explain|give|find|list|file|claim|seek|get|rbi|fssai)\b)/i)
    .map((part) => part.trim()).filter(Boolean);
}

function directReferences(part, records) {
  const requested = [...part.matchAll(/\b(section|rule)\s*(\d+(?:\s*\([a-z0-9]+\))*)/gi)]
    .map((match) => `${match[1].toLowerCase()} ${match[2].replace(/\s+/g, "")}`);
  const matched = [];
  const missing = [];
  for (const reference of unique(requested)) {
    const qualifiedJurisdiction = /jurisdiction\s+rules?|rule\s+\d+\s+of\s+(?:the\s+)?jurisdiction/i.test(part) && reference.startsWith("rule ");
    const matches = records.filter((record) => {
      if (qualifiedJurisdiction) return record.section.toLowerCase() === `jurisdiction rules 2021: ${reference}`;
      return (record.references || [record.section]).some((alias) => normalise(alias) === reference);
    });
    if (matches.length) matched.push(...matches);
    else missing.push(`The requested ${reference} is not available as a checked provision in the active source set.`);
  }
  return { requested, matched, missing };
}

function topicRecords(part, records) {
  const ids = [];
  const add = (...values) => ids.push(...values);
  // These are bounded source lookups, not a classifier of legal liability or factual truth.
  for (const record of records) {
    const names = (record.references || [record.section]).filter((name) => !/\b(section|rule)\s*\d/i.test(name));
    const definitionRequest = /\b(?:what (?:is|are)|define|definition of|explain)\s+(?:a |the )?dark patterns?\b/i.test(part);
    const namedMatch = names.some((name) => phraseIn(part, name) &&
      (normalise(name) !== "disclaimer" || /advert|marketing|promotion/i.test(part)));
    if (record.isBroadTopic ? definitionRequest : namedMatch) add(record.id);
  }
  if (/\bconsumer.{0,25}rights\b|\brights.{0,40}consumer\b/i.test(part)) add("consumer-rights");
  if (/\b(who is a consumer|definition of (?:a )?consumer|self.employ|commercial purpose)\b/i.test(part)) add("consumer-definition");
  if (/\bmisleading\b.*\badvert|\bfalse\b.*\badvert/i.test(part)) {
    add(/\b(defin|mean|conceal)/i.test(part) ? "false-or-misleading-advertisement-definition" : "misleading-advertisements");
  }
  if (/\b(nch|national consumer helpline|ingram)\b/i.test(part)) {
    add(/\b(track|status|docket)\b/i.test(part) ? "nch-tracking" :
      /\b(register|contact|call|phone|number|channels)\b/i.test(part) ? "nch-complaint-channels" : "nch-prelitigation-limits");
  }
  if (/\be.?jagriti\b|\be.?daakhil\b/i.test(part)) add("ejagriti-help-resources");
  if (/\bappeal\b/i.test(part) && /\bdistrict\b/i.test(part)) add("appeal-district-commission");
  if (/\bjurisdiction rules\b|\bcommission.{0,30}(value|monetary|pecuniary)\b|\b(value|monetary|pecuniary).{0,30}commission\b/i.test(part)) {
    add("jurisdiction-district-value", "jurisdiction-state-value", "jurisdiction-national-value");
  }
  if (FILING.test(part) && /\b(file|filing|escalate|approach|proceed|lodge|submit)\b|\bwhere.{0,35}(complain|court|commission)/i.test(part) &&
      !/\b(value|monetary|pecuniary|jurisdiction rules)\b/i.test(part)) {
    if (/\b(appeal|review|jurisdiction|admission|admitted)\b/i.test(part)) {
      if (/\bappeal\b/i.test(part) && /\bdistrict\b/i.test(part)) add("appeal-district-commission");
    } else add("filing-complaint");
  }
  if (FILING.test(part) && /\b(jurisdiction|resid|present city|current city|where.*file|which.*district|address)\b/i.test(part) &&
      !/\b(value|monetary|pecuniary|jurisdiction rules)\b/i.test(part)) {
    add("district-commission-jurisdiction");
  }
  if (FILING.test(part) && /\b(limitation|time limit|two years|too late|delay.*explain)\b/i.test(part)) add("complaint-limitation");
  if (/\b(compensation|remedies|replacement|refund|money back)\b/i.test(part) && !/\b(appeal|review)\b/i.test(part)) {
    if (ONLINE.test(part) && /\b(defective|damaged|wrong|misdescribed)\b/i.test(part) && /\bseller\b/i.test(part)) {
      add("marketplace-seller-returns");
    } else if (ONLINE.test(part) && /\baccepted\b/i.test(part) && /\brefund\b/i.test(part)) {
      add("ecommerce-accepted-refunds");
    } else if (/\b(consumer|commission|goods|product|item|retailer|shop|laptop|watch|stove)\b/i.test(part)) {
      add("district-commission-remedies");
    }
  }
  if (ONLINE.test(part) && /\b(acknowledg|redress|deadline|how long|response time)/i.test(part)) {
    add(/\bseller\b/i.test(part) ? "marketplace-seller-grievance" : "ecommerce-platform-response-time");
  } else if (ONLINE.test(part) && /\bgrievance officer\b/i.test(part)) add("ecommerce-platform-grievance");
  return unique(ids).map((id) => records.find((record) => record.id === id)).filter(Boolean);
}

function evidence(record, index) {
  return {
    id: `S${index + 1}`, recordId: record.id, version: record.version,
    section: record.section, title: record.title, summary: record.summary,
    excerpt: record.excerpt, sourceName: record.sourceName, sourceUrl: record.sourceUrl,
    sourceFormat: record.sourceFormat, effectiveFrom: record.effective_from,
    effectiveTo: record.effective_to, checkedOn: record.checked_on,
    provisions: record.provisions, passages: record.passages,
  };
}

export function prepareResearch(question, asOf) {
  if (typeof question !== "string" || !question.trim() || question.length > 600) {
    return { coverage: "unsupported", sources: [], supported: [],
      notVerified: ["Enter a question between 1 and 600 characters."] };
  }
  const records = getStatutes(asOf);
  const matched = [];
  const notVerified = [];
  for (const part of requestParts(question)) {
    const outside = OUTSIDE_SCOPE.filter(([pattern]) => pattern.test(part)).map(([, reason]) => reason);
    if (/\b(usa|united states|uk|united kingdom|australia|canada|england|wales|scotland|european union)\b/i.test(part) &&
        !/\bindia\b|\bindian\b/i.test(part)) {
      outside.push("The requested foreign jurisdiction is not verified by the selected Indian consumer-law records.");
    }
    if (outside.length) {
      notVerified.push(...outside);
      continue;
    }
    if (/\b(act|code|regulations)\b/i.test(part) &&
        !/consumer protection|e.commerce|jurisdiction|dark patterns|misleading advertisement|(?:the|this) act/i.test(part)) {
      notVerified.push("The named legislation is not identified as one of the included consumer-law sources.");
      continue;
    }
    const direct = directReferences(part, records);
    notVerified.push(...direct.missing);
    const candidates = direct.requested.length ? direct.matched : topicRecords(part, records);
    if (!candidates.length && !direct.missing.length) {
      notVerified.push(`No bounded source lookup was identified for: "${part.slice(0,120)}". Ask this part separately with a focused consumer-law topic or provision number.`);
    }
    matched.push(...candidates);
    if (PROCEDURAL_LIMIT.test(part)) {
      notVerified.push("These records do not verify a complete filing checklist, exact fee, registry acceptance, portal error or whether particular evidence will be accepted. Use the current official filing instructions.");
    }
  }
  if (PERSONAL_CASE.test(question) && CASE_FACT.test(question)) {
    notVerified.push("The source explanations do not establish the disputed facts, your eligibility, liability, an entitlement to a particular remedy or the outcome of your case.");
  }
  const distinct = [...new Map(matched.map((record) => [record.id, record])).values()];
  if (distinct.length > MAX_SOURCES) {
    notVerified.push("Only three source records can be included at once. Other requested lookups were omitted; ask them separately.");
  }
  const sources = distinct.slice(0, MAX_SOURCES).map(evidence);
  return {
    coverage: !sources.length ? "unsupported" : notVerified.length ? "partial" : "source_lookup",
    sources,
    supported: sources.map((source) => `${source.section}: ${source.title}`),
    notVerified: unique(notVerified),
  };
}

export function researchPrompt(plan) {
  const lookup = "Explain only these supplied provisions in general terms, not their application to an individual's facts:\n" +
    plan.supported.join("\n");
  return buildGroundedPrompt(lookup, plan.sources);
}

export function researchResponse(plan, answer, mode, notice) {
  return { ...plan, answer, mode, ...(notice ? { notice } : {}) };
}

export function researchFallback(plan, notice) {
  return researchResponse(plan, plan.sources.length ? buildFallbackAnswer(plan.sources) : NO_ANSWER,
    plan.sources.length ? "retrieval_fallback" : "no_answer", notice);
}
