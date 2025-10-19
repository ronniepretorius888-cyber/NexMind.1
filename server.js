// === NexMind.One | Unified AI Server ===
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { MODEL_PRICING, PROFIT_MARGIN, getModelPrice } from "./pricing.js";

dotenv.config();

// --- Express Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- Verify Environment Variables ---
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY in Render environment!");
} else {
  console.log("✅ OpenAI key loaded successfully");
}

if (process.env.PAYFAST_TEST_MODE === "true") {
  console.log("⚙️ Running in PayFast Sandbox Mode");
}

// --- Initialize OpenAI ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Pricing Route ---
app.get("/api/pricing", (req, res) => {
  const adjusted = {};
  for (const [model, price] of Object.entries(MODEL_PRICING)) {
    adjusted[model] = {};
    for (const [type, cost] of Object.entries(price)) {
      adjusted[model][type] = (cost * (1 + PROFIT_MARGIN)).toFixed(4);
    }
  }
  res.json({
    margin: `${(PROFIT_MARGIN * 100).toFixed(0)}%`,
    pricing: adjusted,
  });
});

// --- Debug Route ---
app.get("/debug/env", (req, res) => {
  res.json({
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    PAYFAST_MERCHANT_ID: !!process.env.PAYFAST_MERCHANT_ID,
    PAYFAST_MERCHANT_KEY: !!process.env.PAYFAST_MERCHANT_KEY,
    PAYFAST_PUBLIC_KEY: !!process.env.PAYFAST_PUBLIC_KEY,
    PAYFAST_SECRET_KEY: !!process.env.PAYFAST_SECRET_KEY,
    PAYFAST_TEST_MODE: process.env.PAYFAST_TEST_MODE,
    PORT: process.env.PORT,
  });
});

// --- Debug OpenAI Test Route ---
app.get("/debug/openai", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say 'NexMind.One is alive!'" }],
    });
    res.json({ testReply: response.choices[0].message.content });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// --- Main AI Route ---
app.post("/api/data", async (req, res) => {
  try {
    const { userInput, tone } = req.body;
    const model = "gpt-4o-mini";

    const tonePrompt = {
      auto: "",
      humorous: "Respond in a funny, witty tone.",
      supportive: "Respond in a kind and supportive tone.",
      creative: "Respond in a creative, imaginative way.",
      informative: "Respond in an informative, factual tone.",
      neutral: "Respond neutrally and clearly.",
    }[tone || "auto"];

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are NexMind.One — The Oracle of Insight, a smart, adaptive AI companion.",
        },
        { role: "user", content: `${tonePrompt}\nUser: ${userInput}` },
      ],
    });

    const output = response.choices?.[0]?.message?.content || "No response received.";
    const inputCost = getModelPrice(model, "input");
    const outputCost = getModelPrice(model, "output");

    console.log(`💸 Model ${model}: $${inputCost}/M input | $${outputCost}/M output (with ${PROFIT_MARGIN * 100}% margin)`);

    res.json({ response: output, model, inputCost, outputCost });
  } catch (error) {
    console.error("💥 Full server error:", error);
    res.status(500).json({
      error: error.message || "Server error — check Render logs.",
    });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 NexMind.One server running on port ${PORT}`);
});
