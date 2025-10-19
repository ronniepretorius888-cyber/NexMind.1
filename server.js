// === NexMind.One | Stable Production Build ===
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

// === Path setup ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Initialize Express ===
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// === Verify environment variables ===
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY missing — please add it in Render → Environment");
} else {
  console.log("✅ OpenAI key loaded successfully");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "missing_key",
});

// === PayFast Config ===
const PAYFAST_CONFIG = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID || "",
  merchant_key: process.env.PAYFAST_MERCHANT_KEY || "",
  public_key: process.env.PAYFAST_PUBLIC_KEY || "",
  secret_key: process.env.PAYFAST_SECRET_KEY || "",
  test_mode: process.env.PAYFAST_TEST_MODE === "true",
};

if (PAYFAST_CONFIG.test_mode) {
  console.log("⚙️ Running in PayFast Sandbox Mode");
}

// === Chat Endpoint ===
app.post("/api/data", async (req, res) => {
  try {
    const { userInput, tone } = req.body;

    const tonePrompts = {
      humorous: "respond with a joke and light humor.",
      supportive: "respond with encouragement and kindness.",
      creative: "respond with imaginative and artistic ideas.",
      informative: "respond with clarity and useful information.",
      neutral: "respond in a balanced, factual tone.",
      auto: "choose the best tone naturally.",
    };

    const systemPrompt = `You are NexMind.One, The Oracle of Insight. Adapt your tone as follows: ${tonePrompts[tone] || tonePrompts.auto}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
    });

    const aiResponse = completion.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("❌ AI Error:", error.message);
    res.status(500).json({
      error: "AI engine error. Please verify OpenAI key or try again later.",
    });
  }
});

// === Start Server ===
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ NexMind.One server running on port ${PORT}`);
  console.log("🌍 Visit:", `https://nexmind-1.onrender.com`);
});
