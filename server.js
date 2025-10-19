import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Fix for serving static files correctly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// --- Initialize OpenAI Client ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Simple in-memory chat memory ---
let chatMemory = {};

// --- API Route ---
app.post("/api/data", async (req, res) => {
  try {
    const { userInput, tone, userId } = req.body;

    if (!chatMemory[userId]) chatMemory[userId] = [];
    chatMemory[userId].push({ role: "user", content: userInput });

    const toneStyles = {
      auto: "Adapt naturally to the user's message and context.",
      humorous: "Be playful and witty.",
      supportive: "Be gentle, positive, and encouraging.",
      creative: "Be imaginative and expressive.",
      informative: "Be factual, detailed, and educational.",
      neutral: "Be direct and professional.",
    };

    const tonePrompt = toneStyles[tone] || toneStyles.auto;

    const conversation = [
      {
        role: "system",
        content: `You are NexMind.One — The Oracle of Insight. You are adaptive, wise, and emotionally intelligent. You evolve slightly with each user's tone. ${tonePrompt}`,
      },
      ...chatMemory[userId],
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation,
      temperature: 0.8,
    });

    const reply = completion.choices[0].message.content;
    chatMemory[userId].push({ role: "assistant", content: reply });

    res.json({ response: reply });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Something went wrong with NexMind.One." });
  }
});

// ✅ Serve the frontend (index.html) from /public
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
