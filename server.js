import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/data", async (req, res) => {
  const { userInput, tone, userId } = req.body;

  try {
    const personality =
      tone === "humorous"
        ? "You are a funny AI who responds with witty humor."
        : tone === "supportive"
        ? "You are a kind and supportive mentor who gives motivating advice."
        : tone === "creative"
        ? "You are a creative AI who uses metaphors and imagination."
        : tone === "informative"
        ? "You are an informative AI who explains things clearly and factually."
        : tone === "neutral"
        ? "You are a calm and balanced assistant."
        : "You adapt naturally to the user’s tone.";

    const prompt = `${personality}\nUser (${userId}): ${userInput}\nAI:`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: personality }, { role: "user", content: userInput }],
      max_tokens: 150
    });

    const aiResponse = completion.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ response: "Sorry, NexMind hit a snag 🤖💥" });
  }
});

// Serve the front page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
