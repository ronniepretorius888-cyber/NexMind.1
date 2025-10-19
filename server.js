import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/data", (req, res) => {
  const { userInput, tone, memory } = req.body;

  const tones = {
    humorous: "😂 Haha, here’s a witty thought:",
    supportive: "💖 Don’t worry, here’s some encouragement:",
    creative: "🎨 Let’s think outside the box:",
    informative: "📘 Here’s some useful info:",
    neutral: "🤖 Here’s a straightforward reply:",
  };

  const prefix = tones[tone] || "🔮 The Oracle whispers:";
  const response = `${prefix} ${userInput.toUpperCase()} — decoded by NexMind.`;

  res.json({ response });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ NexMind.One running on port ${PORT}`));
