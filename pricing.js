// === NexMind.One | Universal Pricing Engine ===
// Includes all model tiers with 20% profit margin

const modelPricing = {
  // 🧠 GPT-5 Family
  "gpt-5": { input: 0.625, output: 5.0 },
  "gpt-5-mini": { input: 0.125, output: 1.0 },
  "gpt-5-nano": { input: 0.025, output: 0.20 },
  "gpt-5-pro": { input: 7.50, output: 60.0 },

  // ⚡ GPT-4.1 Family
  "gpt-4.1": { input: 1.0, output: 4.0 },
  "gpt-4.1-mini": { input: 0.20, output: 0.80 },
  "gpt-4.1-nano": { input: 0.05, output: 0.20 },

  // 🌈 GPT-4o Family
  "gpt-4o": { input: 1.25, output: 5.0 },
  "gpt-4o-mini": { input: 0.075, output: 0.30 },
  "gpt-4o-2024-05-13": { input: 2.50, output: 7.50 },

  // 🚀 O-Series (Reasoning + Deep Research)
  "o1": { input: 7.50, output: 30.0 },
  "o1-pro": { input: 75.0, output: 300.0 },
  "o3": { input: 1.0, output: 4.0 },
  "o3-pro": { input: 10.0, output: 40.0 },
  "o3-deep-research": { input: 5.0, output: 20.0 },
  "o4-mini": { input: 0.55, output: 2.20 },
  "o4-mini-deep-research": { input: 1.0, output: 4.0 },
  "o3-mini": { input: 0.55, output: 2.20 },
  "o1-mini": { input: 0.55, output: 2.20 },

  // 🎨 Image Models
  "gpt-image-1": { input: 5.0, output: 0.0 }, // output cost handled per image
  "gpt-image-1-mini": { input: 2.0, output: 0.0 },
  "dall-e-3": { input: 0.04, output: 0.12 },
  "dall-e-2": { input: 0.016, output: 0.02 },

  // 🔊 Audio & TTS
  "gpt-audio": { input: 2.5, output: 10.0 },
  "gpt-audio-mini": { input: 0.6, output: 2.4 },
  "gpt-4o-mini-tts": { input: 0.6, output: 12.0 },
  "gpt-4o-transcribe": { input: 2.5, output: 10.0 },
  "gpt-4o-mini-transcribe": { input: 1.25, output: 5.0 },

  // 🧩 Legacy 3.5 and Codex
  "gpt-3.5-turbo": { input: 0.50, output: 1.50 },
  "gpt-3.5-turbo-0125": { input: 0.25, output: 0.75 },
  "davinci-002": { input: 1.0, output: 1.0 },
  "babbage-002": { input: 0.20, output: 0.20 },

  // 🧬 Embeddings
  "text-embedding-3-small": { input: 0.02, output: 0.0 },
  "text-embedding-3-large": { input: 0.13, output: 0.0 },
  "text-embedding-ada-002": { input: 0.10, output: 0.0 },

  // ⚖️ Safety buffer (fallback)
  "default": { input: 0.075, output: 0.30 }
};

// === 💰 Pricing Function ===
export function estimateCost(model, promptTokens = 0, completionTokens = 0) {
  const pricing = modelPricing[model] || modelPricing["default"];
  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  const total = (inputCost + outputCost) * 1.2; // +20% profit margin
  return total.toFixed(6);
}
