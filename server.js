// server.js
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { runTask, healthInfo } from "./orchestrator.js";

dotenv.config();

// --- Express setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- Env sanity check ---
const required = ["OPENAI_API_KEY"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("❌ Missing required env vars:", missing);
} else {
  console.log("✅ Required environment variables present");
}

if (process.env.PAYFAST_TEST_MODE === "true") {
  console.log("⚙️ Running in PayFast Sandbox Mode");
}

// --- Public endpoints ---

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Main AI route
app.post("/api/data", async (req, res) => {
  try {
    const { userInput, tone } = req.body || {};
    if (!userInput || !userInput.toString().trim()) {
      return res.status(400).json({ error: "Missing userInput" });
    }

    const result = await runTask(userInput.toString(), tone || "auto");
    res.json(result);
  } catch (err) {
    console.error("❌ /api/data error:", err);
    res.status(500).json({
      error: err.message || "Server error — check logs",
    });
  }
});

// Admin endpoint (protected by ADMIN_TOKEN)
app.get("/api/admin", (req, res) => {
  const token = req.headers["x-admin-token"] || req.query.token;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(healthInfo());
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 NexMind.One server running on port ${PORT}`);
});
