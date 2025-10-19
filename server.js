// === NexMind.One | Adaptive Server ===
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { runTask } from "./orchestrator.js";

dotenv.config();

// --- Express setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- Environment check ---
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY in Render environment!");
} else {
  console.log("✅ OpenAI key loaded successfully");
}

if (process.env.PAYFAST_TEST_MODE === "true") {
  console.log("⚙️ Running in PayFast Sandbox Mode");
}

// --- Main AI route (auto-orchestrated) ---
app.post("/api/data", async (req, res) => {
  try {
    const { userInput, tone } = req.body;
    const result = await runTask(userInput, tone);
    res.json(result);
  } catch (error) {
    console.error("💥 Orchestrator error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 NexMind.One server running on port ${PORT}`);
});
