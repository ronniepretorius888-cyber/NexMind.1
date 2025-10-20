// server.js
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { runTask, getStatus } from "./orchestrator.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Env checks
if (process.env.OPENAI_API_KEY) console.log("✅ OpenAI key loaded");
else console.error("❌ OPENAI_API_KEY missing");

if (process.env.PAYFAST_TEST_MODE === "true") console.log("⚙️ PayFast sandbox mode");

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Main AI route
app.post("/api/data", async (req, res) => {
  try {
    const { userInput, tone } = req.body || {};
    if (!userInput || !userInput.trim()) {
      return res.status(400).json({ error: "Bad request: missing userInput" });
    }
    const result = await runTask(openai, userInput, tone || "auto");
    res.json(result);
  } catch (err) {
    console.error("API /api/data error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Admin endpoint - protected by ADMIN_TOKEN environment variable
app.post("/api/admin", (req, res) => {
  const token = req.headers["x-admin-token"] || req.body?.adminToken;
  if (!process.env.ADMIN_TOKEN) {
    return res.status(500).json({ error: "ADMIN_TOKEN not configured on server" });
  }
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: "Forbidden - invalid admin token" });
  }

  try {
    const status = getStatus();
    res.json({ ok: true, status });
  } catch (err) {
    console.error("Admin route error:", err);
    res.status(500).json({ error: err.message || "Admin error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 NexMind.One server running on port ${PORT}`);
});
