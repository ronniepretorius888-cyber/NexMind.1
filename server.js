// server.js (paste entire file, replace existing)
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import OpenAI from "openai";

dotenv.config();

// --- Basic app setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- Quick health check ---
app.get("/health", (req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

// --- Environment verification (logs on start) ---
const requiredEnv = ["OPENAI_API_KEY"];
let missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("❌ Missing required env vars:", missing.join(", "));
} else {
  console.log("✅ All required env vars present");
}

// PayFast debug (optional)
if (process.env.PAYFAST_TEST_MODE === "true") {
  console.log("⚙️ Running in PayFast Sandbox Mode");
}

// --- Initialize OpenAI client ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- POST API: receive user query and return model answer ---
app.post("/api/data", async (req, res) => {
  try {
    // Log incoming request for debugging
    console.log("➡️ /api/data called — body:", JSON.stringify(req.body));

    const { userInput, tone } = req.body ?? {};
    if (!userInput || typeof userInput !== "string") {
      return res.status(400).json({ error: "Missing or invalid userInput" });
    }

    const tonePrompts = {
      auto: "",
      humorous: "Respond in a funny, witty tone.",
      supportive: "Respond in a kind and supportive tone.",
      creative: "Respond in a creative, imaginative way.",
      informative: "Respond in an informative, factual tone.",
      neutral: "Respond neutrally and clearly.",
    };
    const tonePrompt = tonePrompts[tone] ?? tonePrompts["auto"];

    // Create messages array
    const messages = [
      {
        role: "system",
        content:
          "You are NexMind.One — the Oracle of Insight: an adaptive AI companion that tailors replies by tone requested.",
      },
      {
        role: "user",
        content: `${tonePrompt}\nUser: ${userInput}`,
      },
    ];

    // Call the API (robust handling & debugging)
    console.log("🔎 Calling OpenAI with model gpt-4o-mini ...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      // max_tokens: 300, // optional
    });

    // Log entire response object (very helpful for debugging)
    console.log("🧾 OpenAI raw response:", JSON.stringify(response, null, 2));

    // Extract reply with fallback options (covers different SDK shapes)
    let reply = null;
    // new style: response.choices[0].message.content
    if (response?.choices?.[0]?.message?.content) {
      reply = response.choices[0].message.content;
    }
    // older style: response.choices[0].text
    else if (response?.choices?.[0]?.text) {
      reply = response.choices[0].text;
    }
    // some SDK responses contain parts
    else if (response?.choices?.[0]?.message?.content?.[0]?.content) {
      reply = response.choices[0].message.content[0].content;
    }

    // if still null, return the whole choices array (for debugging)
    if (!reply) {
      console.warn("⚠️ Could not extract reply; returning choices for debugging.");
      return res.json({ debug: response.choices ?? response });
    }

    // Return the reply
    console.log("✅ Reply extracted:", reply);
    return res.json({ response: reply });
  } catch (err) {
    console.error("❌ /api/data ERROR:", err);
    // include detailed info for debugging in logs (NOT in user-facing body)
    return res.status(500).json({ error: "Server error — check logs." });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 NexMind.One server listening on port ${PORT}`);
});
