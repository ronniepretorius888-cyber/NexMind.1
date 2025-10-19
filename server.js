import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Smart AI endpoint
app.post("/api/data", async (req, res) => {
  try {
    const { userInput, tone, memory } = req.body;

    // Build a personality-aware system prompt
    const tonePrompts = {
      humorous: "Respond with clever humor and light sarcasm.",
      supportive: "Be kind, warm, and motivational. Offer encouragement.",
      creative: "Be imaginative, poetic, and metaphorical.",
      informative: "Be factual, structured, and helpful.",
      neutral: "Be balanced and concise.",
      oracle: "Speak with mystical wisdom, as though channeling higher insight.",
      auto: "Match the user’s tone naturally, adapting as they speak.",
    };

    const systemPrompt = `
      You are NexMind.One — an adaptive AI oracle.
      You remember previous conversation context and respond intelligently.
      Tone: ${tonePrompts[tone] || "Be insightful and balanced."}
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(memory || []).map((m) => ({
        role: m.role,
        content: m.message,
      })),
      { role: "user", content: userInput },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.8,
    });

    const aiResponse = completion.choices[0].message.content.trim();

    res.json({ response: aiResponse });
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ response: "⚠️ Something went wrong with the Oracle." });
  }
});

// Default route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ NexMind.One running on port ${PORT}`));
