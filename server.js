// === NexMind.One | Stable Production Build ===

import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import OpenAI from "openai";

// Load environment variables
dotenv.config();

// --- Initialize Express ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- PayFast Configuration ---
const PAYFAST_CONFIG = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID,
  merchant_key: process.env.PAYFAST_MERCHANT_KEY,
  public_key: process.env.PAYFAST_PUBLIC_KEY,
  secret_key: process.env.PAYFAST_SECRET_KEY,
  test_mode: process.env.PAYFAST_TEST_MODE === "true",
};

// --- Environment Checks ---
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

// --- Root Route ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Debug Route (Temporary) ---
app.get("/debug/env", (req, res) => {
  res.json({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing",
    PAYFAST_MERCHANT_ID: !!process.env.PAYFAST_MERCHANT_ID,
    PAYFAST_MERCHANT_KEY: !!process.env.PAYFAST_MERCHANT_KEY,
    PAYFAST_PUBLIC_KEY: !!process.env.PAYFAST_PUBLIC_KEY,
    PAYFAST_SECRET_KEY: !!process.env.PAYFAST_SECRET_KEY,
    PAYFAST_TEST_MODE: process.env.PAYFAST_TEST_MODE,
    PORT: process.env.PORT,
  });
});

// --- AI Route ---
app.post("/api/data", async (req, res) => {
  try {
    const { userInput, tone } = req.body;
    console.log("📩 Incoming request:", { userInput, tone });

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("❌ OPENAI_API_KEY is missing in Render environment!");
    }

    const tonePrompt = {
      auto: "",
      humorous: "Respond in a funny, witty tone.",
      supportive: "Respond in a kind and supportive tone.",
      creative: "Respond in a creative, imaginative way.",
      informative: "Respond in an informative, factual tone.",
      neutral: "Respond neutrally and clearly.",
    }[tone || "auto"];

    // --- Call OpenAI API ---
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are NexMind.One — The Oracle of Insight. A smart, adaptive AI companion.",
        },
        { role: "user", content: `${tonePrompt}\nUser: ${userInput}` },
      ],
    });

    const output =
      response.choices?.[0]?.message?.content || "No response received.";
    console.log("✅ OpenAI reply:", output);

    res.json({ response: output });
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
