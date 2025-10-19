// --- server.js ---
// Core imports
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai"; // ✅ Enabled for Step 6

// Load environment variables
dotenv.config();

// Express setup
const app = express();
app.use(cors());
app.use(express.json());

// Directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// --- Initialize OpenAI ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- API Route for NexMind Responses ---
app.post("/api/data", async (req, res) => {
  try {
    const { userInput = "", tone = "neutral", userId } = req.body;

    if (!userInput) {
      return res.status(400).json({ error: "No input provided." });
    }

    // 🎨 Tone-based system instruction
    const toneInstruction = {
      humorous: "Reply with a funny, witty style — make it entertaining!",
      supportive: "Be kind, uplifting, and encouraging in your response.",
      creative: "Think outside the box. Be imaginative, artistic, or abstract.",
      informative: "Be factual, clear, and educational in your response.",
      neutral: "Respond in a balanced, calm, and neutral tone.",
      auto: "Adapt your tone naturally based on the user’s input.",
    }[tone] || "Be natural and helpful.";

    // --- Main AI call ---
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are NexMind — an adaptive AI oracle. ${toneInstruction}` },
        { role: "user", content: userInput },
      ],
      max_tokens: 250,
      temperature: 0.9,
    });

    const output =
      aiResponse.choices?.[0]?.message?.content || "🤖 I couldn’t generate a response right now.";

    console.log(`NexMind (${tone}) for user ${userId || "anon"}:`, userInput);

    return res.json({ response: output });
  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).json({
      error: "Server or API error",
      details: err.message,
    });
  }
});

// --- Default Route (Frontend) ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Start Server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ NexMind server live on port ${PORT}`));
