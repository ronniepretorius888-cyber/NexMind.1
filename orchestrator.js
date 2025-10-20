// === NexMind.One | AI Task Orchestrator ===
import OpenAI from "openai";
import { estimateCost } from "./pricing.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// === Main orchestration logic ===
export async function runTask(userInput, tone = "auto") {
  console.log(`🧭 Incoming request: ${userInput} | Tone: ${tone}`);

  const tonePrompt = {
    auto: "",
    humorous: "Respond in a funny, witty tone.",
    supportive: "Respond kindly and reassuringly.",
    creative: "Respond with creativity and imagination.",
    informative: "Respond factually and clearly.",
    neutral: "Respond neutrally and directly."
  }[tone || "auto"];

  const model = "gpt-4o-mini"; // best cost/performance balance

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are NexMind.One — the Oracle of Insight. A sharp, adaptive AI assistant."
        },
        { role: "user", content: `${tonePrompt}\n${userInput}` }
      ],
      temperature: 0.8
    });

    const output = response.choices?.[0]?.message?.content || "No response received.";
    const usage = response.usage || {};
    const cost = estimateCost(model, usage.prompt_tokens, usage.completion_tokens);

    return {
      response: output,
      model,
      tokensUsed: usage.total_tokens || 0,
      estimatedCost: cost,
      reasoning: "medium"
    };
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    throw new Error(error.message || "OpenAI API call failed.");
  }
      }
