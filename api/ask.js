import {
  buildFallbackAnswer,
  buildGroundedPrompt,
  hasValidCitations,
  retrieveEvidence,
} from "../rag.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b";
const MAX_QUESTION_LENGTH = 600;
const UPSTREAM_TIMEOUT_MS = 16_000;
const MAX_GENERATION_TOKENS = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
const requestWindows = new Map();

export const config = {
  maxDuration: 20,
};

function sendJson(response, statusCode, payload) {
  return response.status(statusCode).json(payload);
}

function requestQuestion(request) {
  const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  return typeof body?.question === "string" ? body.question.trim() : "";
}

function clientIdentifier(request) {
  const forwardedFor = request.headers?.["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown-client";
}

function isRateLimited(request) {
  const clientId = clientIdentifier(request);
  const now = Date.now();
  const currentWindow = requestWindows.get(clientId);

  if (!currentWindow || now - currentWindow.startedAt >= RATE_LIMIT_WINDOW_MS) {
    requestWindows.set(clientId, { startedAt: now, count: 1 });
    return false;
  }

  currentWindow.count += 1;
  return currentWindow.count > MAX_REQUESTS_PER_WINDOW;
}

function retrievalResponse(evidence, notice, mode = "retrieval_fallback") {
  return {
    answer: buildFallbackAnswer(evidence),
    sources: evidence,
    mode,
    notice,
  };
}

async function askGroq(question, evidence, apiKey) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || DEFAULT_MODEL,
      temperature: 0.1,
      max_tokens: MAX_GENERATION_TOKENS,
      messages: [
        {
          role: "system",
          content:
            "Answer only from the supplied source records. Cite every factual statement using the supplied source labels. Do not invent missing legal details.",
        },
        {
          role: "user",
          content: buildGroundedPrompt(question, evidence),
        },
      ],
    }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with status ${response.status}.`);
  }

  const payload = await response.json();
  const choice = payload?.choices?.[0];
  if (choice?.finish_reason === "length") {
    throw new Error("Groq response was incomplete.");
  }

  const answer = choice?.message?.content?.trim();
  if (!answer || !hasValidCitations(answer, evidence)) {
    throw new Error("Groq response did not contain valid evidence citations.");
  }

  return answer;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  let question;
  try {
    question = requestQuestion(request);
  } catch {
    return sendJson(response, 400, { error: "Request body must be valid JSON." });
  }

  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return sendJson(response, 400, {
      error: `Question must contain between 1 and ${MAX_QUESTION_LENGTH} characters.`,
    });
  }

  if (isRateLimited(request)) {
    response.setHeader("Retry-After", "60");
    return sendJson(response, 429, {
      error: "Too many requests. Try again in one minute.",
    });
  }

  const evidence = retrieveEvidence(question);
  if (evidence.length === 0) {
    return sendJson(response, 200, {
      answer: "I could not verify this from the available source records.",
      sources: [],
      mode: "no_answer",
      notice: "Try a question about the current consumer-law source records.",
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return sendJson(
      response,
      200,
      retrievalResponse(
        evidence,
        "Generation is not configured, so this response uses the verified retrieval fallback.",
      ),
    );
  }

  try {
    const answer = await askGroq(question, evidence, apiKey);
    return sendJson(response, 200, {
      answer,
      sources: evidence,
      mode: "generated",
    });
  } catch (error) {
    console.error("Groq generation failed:", error.message);
    return sendJson(
      response,
      200,
      retrievalResponse(
        evidence,
        "Generation was unavailable, so this response uses the verified retrieval fallback.",
      ),
    );
  }
}
