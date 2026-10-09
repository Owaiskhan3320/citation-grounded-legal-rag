import { statutes } from "./data/statutes.js";
import { findStatuteMatches } from "./search.js";

const form = document.querySelector("#search-form");
const input = document.querySelector("#query");
const results = document.querySelector("#results");
const resultsTitle = document.querySelector("#results-title");
const resultStatus = document.querySelector("#result-status");

function renderResults(query, matches) {
  resultsTitle.textContent = `Results for: ${query}`;

  if (matches.length === 0) {
    resultStatus.textContent = "No verified match";
    results.className = "results-empty";
    results.textContent =
      "I could not verify an answer from the current statute records. Try a section number or a question about consumer rights, complaint filing, unfair trade practices, or misleading advertisements.";
    return;
  }

  resultStatus.textContent = `${matches.length} verified provision${matches.length === 1 ? "" : "s"}`;
  results.className = "result-list";
  results.replaceChildren(
    ...matches.map((record) => {
      const article = document.createElement("article");
      article.className = "result-card";
      article.innerHTML = `
        <div class="result-meta">
          <span>${record.section}</span>
          <span>Consumer Protection Act, 2019</span>
        </div>
        <h3>${record.title}</h3>
        <p class="summary">${record.summary}</p>
        <blockquote>${record.excerpt}</blockquote>
        <a href="${record.sourceUrl}" target="_blank" rel="noreferrer">
          Read the official Act source <span aria-hidden="true">&rarr;</span>
        </a>
      `;
      return article;
    }),
  );
}

function submitQuery(query) {
  const cleanedQuery = query.trim();
  if (!cleanedQuery) {
    return;
  }

  input.value = cleanedQuery;
  renderResults(cleanedQuery, findStatuteMatches(cleanedQuery, statutes));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitQuery(input.value);
});

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => submitQuery(button.dataset.query));
});
