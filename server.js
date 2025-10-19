// --- NexMind.One | Unified AI + PayFast Integration ---
// Imports
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";

// Load environment variables from Render (or local .env if testing)
dotenv.config();

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Static file directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// --- PayFast Environment Configuration ---
const PAYFAST_CONFIG = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID,
  merchant_key: process.env.PAYFAST_MERCHANT_KEY,
  public_key: process.env.PAYFAST_PUBLIC_KEY,
  secret_key: process.env.PAYFAST_SECRET_KEY,
  test_mode: process.env.PAYFAST_TEST_MODE === "true",
};

// --- Initialize OpenAI ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- API Route: NexMind AI Brain ---
app.post("/api/data", async (req, res) => {
  try {
    const { userInput = "", tone = "neutral", userId } = req.body;

    if (!userInput) {
      return res.status(400).json({ error: "No input provided." });
    }

    // 🎭 Tone personality setup
    const toneGuide = {
      humorous: "Be funny, playful, and witty in your tone.",
      supportive: "Be kind, uplifting, and compassionate.",
      creative: "Think abstractly, imaginatively, and uniquely.",
      informative: "Be factual, concise, and professional.",
      neutral: "Be calm, balanced, and straightforward.",
      auto: "Adapt naturally based on context.",
    };

    const systemPrompt = `You are NexMind — the Oracle of Insight. Your purpose is to provide clear, engaging, and adaptive AI responses. 
    Maintain the requested tone: ${toneGuide[tone] || "neutral"}.
    Always respond as a wise, intelligent assistant with warmth and confidence.`;

    // 🔮 OpenAI response
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
      temperature: 0.9,
      max_tokens: 250,
    });

    const output =
      aiResponse.choices?.[0]?.message?.content ||
      "🤖 Hmm... my circuits might need a reboot. Try again!";

    console.log(`💬 [${tone}] User(${userId || "anon"}): ${userInput}`);

    res.json({ response: output });
  } catch (err) {
    console.error("❌ AI Error:", err);
    res.status(500).json({
      error: "Server or OpenAI connection issue",
      details: err.message,
    });
  }
});

// --- API Route: PayFast Payment Initialization ---
app.post("/api/payfast/initiate", (req, res) => {
  try {
    const { amount, item_name, return_url, cancel_url, notify_url } = req.body;

    if (!amount || !item_name) {
      return res
        .status(400)
        .json({ error: "Missing required payment parameters." });
    }

    const payfastURL = PAYFAST_CONFIG.test_mode
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";

    const params = new URLSearchParams({
      merchant_id: PAYFAST_CONFIG.merchant_id,
      merchant_key: PAYFAST_CONFIG.merchant_key,
      amount,
      item_name,
      return_url: return_url || "https://nexmind1.onrender.com/thank-you",
      cancel_url: cancel_url || "https://nexmind1.onrender.com/cancel",
      notify_url: notify_url || "https://nexmind1.onrender.com/notify",
    });

    const fullURL = `${payfastURL}?${params.toString()}`;

    console.log("💰 PayFast payment initialized:", fullURL);

    res.json({ success: true, url: fullURL });
  } catch (err) {
    console.error("❌ PayFast Error:", err);
    res.status(500).json({ error: "Failed to initiate PayFast payment." });
  }
});

// --- Health Check ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// --- Fallback Route ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Start the Server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ NexMind.One is live on port ${PORT}`);
  console.log(
    PAYFAST_CONFIG.test_mode
      ? "⚙️ Running in PayFast Sandbox Mode"
      : "💵 Running in PayFast Live Mode"
  );
});
