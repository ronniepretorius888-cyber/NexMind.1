// === NexMind.One | Self-Sustaining AI Server ===
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import fs from "fs";
import { runTask } from "./orchestrator.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKEN_DB_PATH = path.join(__dirname, "tokenDB.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- Initialize Token DB if missing ---
if (!fs.existsSync(TOKEN_DB_PATH)) {
  fs.writeFileSync(TOKEN_DB_PATH, JSON.stringify({}, null, 2));
  console.log("🧾 Token database created:", TOKEN_DB_PATH);
}

// --- Utility: Load and Save DB ---
function loadDB() {
  return JSON.parse(fs.readFileSync(TOKEN_DB_PATH, "utf-8"));
}
function saveDB(db) {
  fs.writeFileSync(TOKEN_DB_PATH, JSON.stringify(db, null, 2));
}

// --- Free daily tokens ---
const FREE_TOKENS = 10;
const TOKEN_COST = 1;

// --- API: Get user balance ---
app.get("/api/user/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();

  if (!db[id]) {
    db[id] = { balance: FREE_TOKENS, lastFreeReset: new Date().toISOString() };
    saveDB(db);
  }

  // Reset daily free tokens
  const lastReset = new Date(db[id].lastFreeReset);
  const now = new Date();
  if (now - lastReset > 24 * 60 * 60 * 1000) {
    db[id].balance += FREE_TOKENS;
    db[id].lastFreeReset = now.toISOString();
    saveDB(db);
  }

  res.json({ balance: db[id].balance });
});

// --- API: Deduct token for AI query ---
app.post("/api/use-token/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();

  if (!db[id] || db[id].balance < TOKEN_COST) {
    return res.status(403).json({ error: "⚡ Out of energy — please recharge!" });
  }

  db[id].balance -= TOKEN_COST;
  saveDB(db);
  res.json({ success: true, balance: db[id].balance });
});

// --- API: Recharge via PayFast callback ---
app.post("/api/user/recharge", (req, res) => {
  try {
    const { userId, paymentStatus, amount } = req.body;
    if (paymentStatus !== "COMPLETE") return res.status(400).json({ error: "Invalid payment" });

    const db = loadDB();
    const tokensPurchased = Math.floor(Number(amount) * 50); // 1 USD ≈ 50 tokens
    db[userId] = db[userId] || { balance: 0, lastFreeReset: new Date().toISOString() };
    db[userId].balance += tokensPurchased;
    saveDB(db);

    console.log(`💰 Credited ${tokensPurchased} tokens to ${userId}`);
    res.json({ success: true, balance: db[userId].balance });
  } catch (err) {
    console.error("💥 Payment processing error:", err);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

// --- API: Main AI endpoint ---
app.post("/api/data", async (req, res) => {
  try {
    const { userInput, tone, userId } = req.body;
    const db = loadDB();

    if (!db[userId] || db[userId].balance < TOKEN_COST) {
      return res.status(403).json({ error: "⚡ Out of energy — please recharge!" });
    }

    db[userId].balance -= TOKEN_COST;
    saveDB(db);

    const result = await runTask(userInput, tone);
    res.json({ response: result.response, balance: db[userId].balance });
  } catch (error) {
    console.error("💥 Orchestrator error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 NexMind.One running on port ${PORT}`));
