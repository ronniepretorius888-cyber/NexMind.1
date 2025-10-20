// public/script.js
document.getElementById("askBtn").addEventListener("click", sendData);

async function sendData() {
  const userInput = document.getElementById("userInput").value.trim();
  const tone = document.getElementById("toneSelector").value;
  const responseBox = document.getElementById("response");

  if (!userInput) {
    responseBox.innerText = "⚠️ Please type a question for the Oracle.";
    return;
  }

  responseBox.innerText = "🔮 Consulting the Oracle...";

  // client-side limited retry for transient server issues
  const maxAttempts = 3;
  let attempt = 0;
  let backoff = 500;

  while (attempt < maxAttempts) {
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput, tone })
      });

      const data = await res.json();

      if (res.ok) {
        const model = data?.model || "unknown";
        const output = data?.response || "";
        const usage = data?.usage || {};
        responseBox.innerHTML = `
          <strong>✨ Oracle reply (model: ${model})</strong>
          <div style="margin-top:10px;">${escapeHtml(output)}</div>
          <hr />
          <small>Tokens: ${usage.promptTokens || 0} / ${usage.completionTokens || 0} — Est. $${usage.estimatedCost || 0}</small>
        `;
        return;
      } else {
        // If server says quota exceeded (429-like response body) show message and stop
        const errorText = data?.error || res.statusText;
        if (res.status === 429 || (typeof errorText === "string" && errorText.toLowerCase().includes("quota"))) {
          responseBox.innerText = `⚠️ Rate/Quota error: ${errorText}. Please wait or check billing.`;
          return;
        }

        // For other 5xx/500, attempt client retry
        if (res.status >= 500 && res.status < 600) {
          attempt++;
          if (attempt >= maxAttempts) {
            responseBox.innerText = `❌ Oracle server error: ${errorText}`;
            return;
          }
          responseBox.innerText = `⏳ Server busy (attempt ${attempt}/${maxAttempts}) — retrying...`;
          await sleep(backoff);
          backoff = Math.min(4000, backoff * 2.5);
          continue;
        } else {
          // Non-retryable HTTP error
          responseBox.innerText = `⚠️ Oracle error: ${errorText}`;
          return;
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      attempt++;
      if (attempt >= maxAttempts) {
        responseBox.innerText = "❌ Connection failed — please check the server logs or network.";
        return;
      }
      responseBox.innerText = `⏳ Network issue (attempt ${attempt}/${maxAttempts}) — retrying...`;
      await sleep(backoff);
      backoff = Math.min(4000, backoff * 2.5);
    }
  }
}

function escapeHtml(unsafe) {
  return (unsafe || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
