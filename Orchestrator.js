// === NexMind.One | Auto-Orchestrator Engine ===
import OpenAI from "openai";
import { getModelPrice } from "./pricing.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Intent classification ---
export async function detectIntent(userInput) {
  const prompt = `
  Classify the intent of this user request: "${userInput}".
  Respond with only one of these categories:
  [chat, creative, code, planning, analysis, image, audio, finance, research].
  `;
  try {
    const intentResponse = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [{ role: "user", content: prompt }],
    });
    const intent = intentResponse.output_text.trim().toLowerCase();
    return intent.includes("image") ? "image" : intent;
  } catch {
    return "chat"; // fallback
  }
}

// --- Model router ---
export function selectModel(intent) {
  const routes = {
    chat: "gpt-4o-mini",
    creative: "gpt-5-mini",
    code: "gpt-4.1-mini",
    planning: "gpt-5",
    analysis: "o4-mini",
    image: "gpt-image-1-mini",
    audio: "gpt-4o-mini-transcribe",
    finance: "o4-mini",
    research: "o3",
  };
  return routes[intent] || "gpt-4o-mini";
}

// --- Reasoning level ---
export function setReasoning(intent) {
  if (["planning", "analysis", "finance", "research"].includes(intent)) {
    return { effort: "high" };
  } else if (["creative", "code"].includes(intent)) {
    return { effort: "medium" };
  }
  return { effort: "low" };
}

// --- Execute model ---
export async function runTask(userInput, tone) {
  const intent = await detectIntent(userInput);
  const model = selectModel(intent);
  const reasoning = setReasoning(intent);

  console.log(`🧭 Detected intent: ${intent} → Model: ${model} (${reasoning.effort})`);

  // Image generation route
  if (intent === "image") {
    return {
      model,
      response: `🖼️ Image generation would be handled here (gpt-image-1-mini)`,
      tokensUsed: 0,
      estimatedCost: getModelPrice(model, "perImage"),
    };
  }

  // Text / reasoning route
  const response = await openai.responses.create({
    model,
    reasoning,
    input: [
      { role: "system", content: "You are NexMind.One — the Oracle of Insight, adaptive and self-optimizing." },
      { role: "user", content: `${tone ? tone + "\n" : ""}${userInput}` },
    ],
  });

  const output = response.output?.[0]?.content?.[0]?.text ?? "No response.";
  const usage = response.usage || {};
  const tokens = usage.total_tokens ?? 0;

  const outputRate = getModelPrice(model, "output");
  const costEstimate = ((tokens / 1_000_000) * outputRate).toFixed(6);

  return {
    intent,
    model,
    reasoning: reasoning.effort,
    response: output,
    tokensUsed: tokens,
    estimatedCost: costEstimate,
  };
                              }
