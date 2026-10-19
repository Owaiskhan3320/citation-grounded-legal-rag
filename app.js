import { buildFallbackAnswer, retrieveEvidence } from "./rag.js";

const form = document.querySelector("#search-form");
const input = document.querySelector("#query");
const submitButton = form.querySelector("button[type='submit']");
const results = document.querySelector("#results");
const resultsTitle = document.querySelector("#results-title");
const resultStatus = document.querySelector("#result-status");

function createSourceCard(source) {
  const article = document.createElement("article");
  article.className = "result-card";

  const metadata = document.createElement("div");
  metadata.className = "result-meta";
  for (const label of [source.id, source.section, "Consumer Protection Act, 2019"]) {
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

  const sourceLink = document.createElement("a");
  sourceLink.href = source.sourceUrl;
  sourceLink.target = "_blank";
  sourceLink.rel = "noreferrer";
  sourceLink.textContent = "Read the official Act source ->";

  article.append(metadata, heading, summary, excerpt, sourceLink);
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
  submitButton.disabled = true;
  submitButton.textContent = "Searching...";
  resultStatus.textContent = "Retrieving source records";
  resultsTitle.textContent = "Preparing answer";
  results.className = "results-empty";
  results.textContent = "Retrieving supporting legal sources before generating a response...";

  try {
    renderResponse(cleanedQuery, await requestAnswer(cleanedQuery));
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Search";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitQuery(input.value);
});

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => submitQuery(button.dataset.query));
});
