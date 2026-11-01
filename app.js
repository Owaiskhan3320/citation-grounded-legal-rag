import { buildFallbackAnswer, retrieveEvidence } from "./rag.js";
import { getIssueGuide, getOfficialRoutes, issuePaths } from "./issues.js";

const form = document.querySelector("#search-form");
const input = document.querySelector("#query");
const submitButton = form.querySelector("button[type='submit']");
const results = document.querySelector("#results");
const resultsTitle = document.querySelector("#results-title");
const resultStatus = document.querySelector("#result-status");
let latestSearch = 0;

function sourceLink(record, label = "Read the official source ->") {
  const link = document.createElement("a");
  const first = record.passages?.find((passage) => passage.sourceUrl === record.sourceUrl) || record.passages?.[0];
  const url = first?.sourceUrl || record.sourceUrl;
  link.href = record.sourceFormat === "pdf" && first ? `${url}#page=${first.page}` : url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  return link;
}

function showIssue(issueId) {
  const guide = getIssueGuide(issueId);
  if (!guide) return;
  const panel = document.querySelector("#issue-guide");
  panel.replaceChildren();
  panel.hidden = false;

  const title = document.createElement("h3");
  title.textContent = guide.title;
  const description = document.createElement("p");
  description.textContent = guide.description;
  const preparation = document.createElement("p");
  preparation.className = "preparation-note";
  preparation.textContent = guide.preparation;
  const list = document.createElement("ul");
  for (const record of guide.records) {
    const item = document.createElement("li");
    const heading = document.createElement("strong");
    heading.textContent = `${record.section}: ${record.title}`;
    const summary = document.createElement("p");
    summary.textContent = record.summary;
    item.append(heading, summary, sourceLink(record));
    list.append(item);
  }
  const question = document.createElement("button");
  question.type = "button";
  question.className = "guide-question";
  question.textContent = "Search this question";
  question.addEventListener("click", () => {
    submitQuery(guide.question);
    document.querySelector(".results-section").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  const questionText = document.createElement("p");
  questionText.textContent = guide.question;
  const routesLink = document.createElement("a");
  routesLink.href = "#official-routes";
  routesLink.textContent = "See the official complaint routes";
  panel.append(title, description, list, preparation, questionText, question, routesLink);
  document.querySelectorAll("[data-issue]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.issue === issueId));
  });
}

function renderIssuePaths() {
  const options = document.querySelector("#issue-options");
  for (const issue of issuePaths) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.issue = issue.id;
    button.textContent = issue.title;
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-controls", "issue-guide");
    button.addEventListener("click", () => showIssue(issue.id));
    options.append(button);
  }
  const cards = document.querySelector("#route-cards");
  for (const route of getOfficialRoutes()) {
    const card = document.createElement("article");
    const heading = document.createElement("h3");
    heading.textContent = route.label;
    const summary = document.createElement("p");
    summary.textContent = route.source.summary;
    const open = document.createElement("a");
    open.href = route.url;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    open.textContent = "Open the official service ->";
    card.append(heading, summary, open, sourceLink(route.source, "Source for this guidance"));
    cards.append(card);
  }
}

function createSourceCard(source) {
  const article = document.createElement("article");
  article.className = "result-card";

  const metadata = document.createElement("div");
  metadata.className = "result-meta";
  for (const label of [source.id, source.section, source.sourceName]) {
    const tag = document.createElement("span");
    tag.textContent = label;
    metadata.append(tag);
  }

  const heading = document.createElement("h3");
  heading.textContent = source.title;

  const summary = document.createElement("p");
  summary.className = "summary";
  summary.textContent = source.summary;

  const excerpt = document.createElement("blockquote");
  excerpt.textContent = source.excerpt;

  const checked = document.createElement("p");
  checked.className = "source-date";
  checked.textContent = `Source checked: ${source.checkedOn}`;
  article.append(metadata, heading, summary, excerpt, sourceLink(source), checked);
  return article;
}

function renderResponse(query, payload) {
  resultsTitle.textContent = `Results for: ${query}`;
  results.replaceChildren();

  if (payload.mode === "no_answer") {
    resultStatus.textContent = "No verified match";
    results.className = "results-empty";
    results.textContent = payload.answer;
    return;
  }

  resultStatus.textContent =
    payload.mode === "generated"
      ? `Groq answer with ${payload.sources.length} source${payload.sources.length === 1 ? "" : "s"}`
      : "Verified retrieval fallback";
  results.className = "result-list";

  const answer = document.createElement("section");
  answer.className = "answer-card";
  const answerHeading = document.createElement("h3");
  answerHeading.textContent = "Answer";
  const answerText = document.createElement("p");
  answerText.className = "answer-text";
  answerText.textContent = payload.answer;
  answer.append(answerHeading, answerText);

  if (payload.notice) {
    const notice = document.createElement("p");
    notice.className = "answer-notice";
    notice.textContent = payload.notice;
    answer.append(notice);
  }

  const sourceHeading = document.createElement("h3");
  sourceHeading.className = "source-heading";
  sourceHeading.textContent = "Evidence used";
  results.append(answer, sourceHeading, ...payload.sources.map(createSourceCard));
}

function localFallback(question, notice) {
  const sources = retrieveEvidence(question);
  if (sources.length === 0) {
    return {
      answer: "I could not verify this from the available source records.",
      sources: [],
      mode: "no_answer",
    };
  }

  return {
    answer: buildFallbackAnswer(sources),
    sources,
    mode: "retrieval_fallback",
    notice,
  };
}

async function requestAnswer(question) {
  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!response.ok) {
      throw new Error("The answer service returned an error.");
    }
    return await response.json();
  } catch {
    return localFallback(
      question,
      "The generation service is unavailable, so this response uses the verified local retrieval fallback.",
    );
  }
}

async function submitQuery(query) {
  const cleanedQuery = query.trim();
  if (!cleanedQuery) {
    return;
  }

  input.value = cleanedQuery;
  const searchId = ++latestSearch;
  submitButton.disabled = true;
  submitButton.textContent = "Searching...";
  resultStatus.textContent = "Retrieving source records";
  resultsTitle.textContent = "Preparing answer";
  results.className = "results-empty";
  results.textContent = "Retrieving supporting legal sources before generating a response...";

  try {
    const payload = await requestAnswer(cleanedQuery);
    if (searchId === latestSearch) renderResponse(cleanedQuery, payload);
  } finally {
    if (searchId === latestSearch) {
      submitButton.disabled = false;
      submitButton.textContent = "Search";
    }
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitQuery(input.value);
});

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => submitQuery(button.dataset.query));
});

renderIssuePaths();
