import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// --- OpenAI Setup ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI endpoint
app.post("/api/data", async (req, res) => {
  const { userInput } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are NexMind, an intelligent and kind assistant that helps users think creatively, solve problems, and stay positive.",
        },
        {
          role: "user",
          content: userInput,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    res
      .status(500)
      .json({ response: "⚠️ Sorry, NexMind encountered a small glitch." });
  }
});

// Default route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ NexMind.1 AI Server running on port ${PORT}`)
);
