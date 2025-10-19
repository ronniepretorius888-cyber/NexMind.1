// AI endpoint with tone and personality adaptation
app.post("/api/data", async (req, res) => {
  const { userInput, tone = "default", memory = [] } = req.body;

  // Analyze user tone based on message patterns
  const toneProfile = tone === "auto"
    ? analyzeTone(userInput)
    : tone;

  const personalityPrompt = getPersonalityPrompt(toneProfile);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are NexMind: The Oracle of Insight — an adaptive, wise AI that learns from users. Speak in the user's preferred tone (${toneProfile}). When the user seems emotional, reply empathetically. When they are curious, reply with inspiration. You have memory of previous messages.`,
        },
        {
          role: "assistant",
          content: `Here is the current user personality profile:\n${JSON.stringify(memory.slice(-4))}`,
        },
        {
          role: "user",
          content: userInput,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content;
    res.json({ response: aiResponse, toneUsed: toneProfile });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    res.status(500).json({ response: "⚠️ Oracle encountered a glitch." });
  }
});

// --- Simple Tone Analysis ---
function analyzeTone(text) {
  text = text.toLowerCase();
  if (text.includes("😂") || text.includes("lol") || text.includes("funny")) return "humorous";
  if (text.includes("help") || text.includes("confused")) return "supportive";
  if (text.includes("what if") || text.includes("maybe")) return "creative";
  if (text.includes("please explain") || text.includes("?")) return "informative";
  return "neutral";
}

// --- Define Personalities ---
function getPersonalityPrompt(tone) {
  const personalities = {
    humorous: "Use light humor and clever analogies. Be playful and friendly.",
    supportive: "Be warm, encouraging, and emotionally intelligent.",
    creative: "Be imaginative, visionary, and exploratory.",
    informative: "Be detailed, calm, and precise like a teacher.",
    neutral: "Be balanced, conversational, and thoughtful.",
  };
  return personalities[tone] || personalities.neutral;
}
