import assert from "node:assert/strict";

import handler from "../api/ask.js";

function createResponse() {
  const state = { headers: {}, payload: undefined, statusCode: undefined };
  return {
    state,
    setHeader(name, value) {
      state.headers[name] = value;
    },
    status(statusCode) {
      state.statusCode = statusCode;
      return this;
    },
    json(payload) {
      state.payload = payload;
      return payload;
    },
  };
}

async function request(body, method = "POST", headers = {}) {
  const response = createResponse();
  await handler({ method, body, headers }, response);
  return response.state;
}

const savedApiKey = process.env.GROQ_API_KEY;
const savedModel = process.env.GROQ_MODEL;
const savedFetch = globalThis.fetch;

try {
  delete process.env.GROQ_API_KEY;
  const fallback = await request({
    question: "What are consumer rights under section 2(9)?",
  });
  assert.equal(fallback.statusCode, 200);
  assert.equal(fallback.payload.mode, "retrieval_fallback");
  assert.equal(fallback.payload.sources[0].section, "Section 2(9)");

  const noAnswer = await request({ question: "How do I contest a divorce?" });
  assert.equal(noAnswer.statusCode, 200);
  assert.equal(noAnswer.payload.mode, "no_answer");

  const wrongMethod = await request({}, "GET");
  assert.equal(wrongMethod.statusCode, 405);
  assert.equal(wrongMethod.headers.Allow, "POST");

  process.env.GROQ_API_KEY = "test-key";
  process.env.GROQ_MODEL = "test-model";
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(options.headers.Authorization, "Bearer test-key");
    assert.match(options.body, /test-model/);
    assert.match(options.body, /"max_tokens":500/);
    assert.match(options.body, /"role":"system"/);
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: "Consumer rights include safety, information, choice, being heard, redressal, and awareness. [S1]",
            },
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  const generated = await request({
    question: "What are consumer rights under section 2(9)?",
  });
  assert.equal(generated.statusCode, 200);
  assert.equal(generated.payload.mode, "generated");
  assert.match(generated.payload.answer, /\[S1\]/);

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [{ message: { content: "An unsupported claim without a source." } }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );

  const savedConsoleError = console.error;
  let invalidCitations;
  try {
    console.error = () => {};
    invalidCitations = await request({
      question: "What are consumer rights under section 2(9)?",
    });
  } finally {
    console.error = savedConsoleError;
  }
  assert.equal(invalidCitations.payload.mode, "retrieval_fallback");

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: "length",
            message: { content: "Consumer rights include safety [S1" },
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );

  let incompleteGeneration;
  try {
    console.error = () => {};
    incompleteGeneration = await request({
      question: "What are consumer rights under section 2(9)?",
    });
  } finally {
    console.error = savedConsoleError;
  }
  assert.equal(incompleteGeneration.payload.mode, "retrieval_fallback");
  assert.match(incompleteGeneration.payload.answer, /quality, quantity, potency/);

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [{ message: { content: "Consumer rights include safety. [S1]" } }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );

  for (let count = 0; count < 8; count += 1) {
    const limitedClientResponse = await request(
      { question: "What are consumer rights under section 2(9)?" },
      "POST",
      { "x-forwarded-for": "rate-limit-test" },
    );
    assert.equal(limitedClientResponse.statusCode, 200);
  }
  const rateLimited = await request(
    { question: "What are consumer rights under section 2(9)?" },
    "POST",
    { "x-forwarded-for": "rate-limit-test" },
  );
  assert.equal(rateLimited.statusCode, 429);
  assert.equal(rateLimited.headers["Retry-After"], "60");
} finally {
  globalThis.fetch = savedFetch;
  if (savedApiKey === undefined) {
    delete process.env.GROQ_API_KEY;
  } else {
    process.env.GROQ_API_KEY = savedApiKey;
  }
  if (savedModel === undefined) {
    delete process.env.GROQ_MODEL;
  } else {
    process.env.GROQ_MODEL = savedModel;
  }
}

console.log("API route checks passed.");
