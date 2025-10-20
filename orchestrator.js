// orchestrator.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health/usage info returned to admin
export function healthInfo() {
  return {
    openAIKeyLoaded: !!process.env.OPENAI_API_KEY,
    payfastTestMode: process.env.PAYFAST_TEST_MODE === "true",
    env: {
      PORT: process.env.PORT || null,
    },
    timestamp: new Date().toISOString(),
  };
}

// Model fallbacks (order: cheapest-to-more-powerful as needed)
const MODEL_CANDIDATES = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
  "gpt-4.1"
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// runTask: orchestrates a single user request with retries/backoff and fallback
export async function runTask(userInput, tone = "auto") {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key missing in environment.");
  }

  const toneMap = {
    auto: "",
    humorous: "Respond in a funny, witty tone.",
    supportive: "Respond in a kind and supportive tone.",
    creative: "Respond in a creative, imaginative way.",
    informative: "Respond in an informative, factual tone.",
    neutral: "Respond neutrally and clearly.",
  };
  const tonePrompt = toneMap[tone] ?? "";

  const systemMsg = "You are NexMind.One — The Oracle of Insight. A smart, adaptive AI companion.";
  const userMsg = `${tonePrompt}\nUser: ${userInput}`;

  // Try each candidate model with up to 3 retries/exponential backoff each
  for (const model of MODEL_CANDIDATES) {
    let attempt = 0;
    const maxAttempts = 3;
    const baseDelay = 500; // ms
    while (attempt < maxAttempts) {
      try {
        attempt++;
        // Use Chat Completions endpoint in the style used in this repo
        const response = await openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: userMsg },
          ],
          max_tokens: 800,
        });

        const output = response.choices?.[0]?.message?.content ?? null;
        if (!output) {
          throw new Error("Empty response from OpenAI");
        }

        // Return successful result with metadata
        return {
          ok: true,
          model,
          response: output,
        };
      } catch (err) {
        const code = err?.status || err?.code || "";
        // If error indicates quota/rate limit or an auth issue, escalate immediately
        const msg = (err?.message || String(err)).toLowerCase();
        if (msg.includes("quota") || msg.includes("exceeded") || code === 429) {
          throw new Error("429 You exceeded your quota. Check OpenAI plan/billing.");
        }
        if (msg.includes("invalid") || msg.includes("auth") || code === 401) {
          throw new Error("401 Invalid OpenAI key or authentication issue.");
        }

        // If last attempt for this model, break out to next model
        if (attempt >= maxAttempts) {
          console.warn(`⚠️ Model ${model} failed after ${attempt} attempts:`, err.message || err);
          break;
        }

        // Wait with exponential backoff and retry
        const waitMs = baseDelay * Math.pow(2, attempt - 1);
        console.info(`⏳ Retrying model ${model} in ${waitMs}ms (attempt ${attempt})`);
        await sleep(waitMs);
      }
    }
  }

  throw new Error("All models failed. See logs for details.");
    }
