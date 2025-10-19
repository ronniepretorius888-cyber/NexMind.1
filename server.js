import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Simple AI endpoint
app.post("/api/data", (req, res) => {
  const { userInput } = req.body;
  const response = `✨ AI Response: "${userInput.toUpperCase()}"`;
  res.json({ response });
});

// ✅ Correct Render-compatible port setup
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
