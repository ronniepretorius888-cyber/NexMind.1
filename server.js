import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- Initialize OpenAI Client ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// --- Simple in-memory chat memory (temporary, per server run) ---
let chatMemory = {};

// --- API Route ---
app.post("/api/data", async (req, res) => {
  try {
    const { userInput, tone, userId } = req.body;

    // Initialize memory for new user
    if (!chatMemory[userId]) chatMemory[userId] = [];

    // Store the user's new input
    chatMemory[userId].push({ role: "user", content: userInput });

    // Determine tone and build dynamic system message
    const toneStyles = {
      auto: "Adapt naturally to the user's message and context.",
      humorous: "Be playful and witty.",
      supportive: "Be gentle, positive, and encouraging.",
      creative: "Be imaginative and expressive.",
      informative: "Be factual, detailed, and educational.",
      neutral: "Be direct and professional."
    };

    const tonePrompt = toneStyles[tone] || toneStyles.auto;

    // Build conversation context
    const conversation = [
      {
        role: "system",
        content: `You are NexMind.One — The Oracle of Insight. You are adaptive, wise, and emotionally intelligent. Your personality should evolve slightly with each user based on their tone and language. ${tonePrompt}`
      },
      ...chatMemory[userId]
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation,
      temperature: 0.8
    });

    const reply = completion.choices[0].message.content;

    // Store the reply in memory
    chatMemory[userId].push({ role: "assistant", content: reply });

    res.json({ response: reply });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Something went wrong with NexMind.One." });
  }
});

// --- Root route for Render check ---
app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 Welcome to NexMind.One</h1>
    <p>The Oracle of Insight — your adaptive AI companion</p>
    <p>Try the API at <code>/api/data</code></p>
  `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
