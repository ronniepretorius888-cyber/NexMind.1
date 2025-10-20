// === NexMind.One Frontend ===

async function sendData() {
  const userInput = document.getElementById("userInput").value.trim();
  const tone = document.getElementById("toneSelector").value;

  const responseBox = document.getElementById("response");
  responseBox.innerText = "🔮 Consulting the Oracle...";

  if (!userInput) {
    responseBox.innerText = "⚠️ Please type a question for the Oracle.";
    return;
  }

  // Unique session for each user
  if (!localStorage.getItem("userId")) {
    localStorage.setItem("userId", Math.random().toString(36).substring(2, 15));
  }
  const userId = localStorage.getItem("userId");

  try {
    const res = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput, tone, userId })
    });

    const data = await res.json();

    if (res.ok) {
      responseBox.innerText =
        `🧠 ${data.response}\n\n` +
        `Model: ${data.model} | Effort: ${data.reasoning}\n` +
        `Tokens: ${data.tokensUsed || 0} | Cost: $${data.estimatedCost}`;
    } else {
      responseBox.innerText = `⚠️ Failed to contact the Oracle.\n\nDetails: ${JSON.stringify(data)}`;
    }
  } catch (err) {
    responseBox.innerText = `💥 Connection error: ${err.message}`;
  }
}
