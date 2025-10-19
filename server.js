// === NexMind.One | Unified AI + Payments Server ===
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

// === File Path Setup ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Initialize Express ===
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// === Load API Keys & Config ===
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// PayFast Config (environment handled by Render)
const PAYFAST_CONFIG = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID,
  merchant_key: process.env.PAYFAST_MERCHANT_KEY,
  public_key: process.env.PAYFAST_PUBLIC_KEY,
  secret_key: process.env.PAYFAST_SECRET_KEY,
  test_mode: process.env.PAYFAST_TEST_MODE === "true"
};

// === API Route: Chat with NexMind ===
app.post("/api/data", async (req, res) => {
  try {
    const { userInput, tone } = req.body;

    const tonePrompts = {
      humorous: "respond with a joke and light humor.",
      supportive: "respond with encouragement and kindness.",
      creative: "respond with imaginative and artistic ideas.",
      informative: "respond with clarity and useful information.",
      neutral: "respond in a balanced, factual tone.",
      auto: "choose the best tone naturally."
    };

    const systemPrompt = `You are NexMind.One, The Oracle of Insight. Adapt your tone as follows: ${tonePrompts[tone] || tonePrompts.auto}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput }
      ]
    });

    const aiResponse = completion.choices[0].message.content;
    res.json({ response: aiResponse });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "AI engine is temporarily unavailable." });
  }
});

// === PayFast Sandbox Status ===
if (PAYFAST_CONFIG.test_mode) {
  console.log("⚙️ Running in PayFast Sandbox Mode");
}

// === Start Server ===
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ NexMind.One server running on port ${PORT}`);
});
