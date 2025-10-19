// === NexMind.One | Model Pricing Config ===

export const PROFIT_MARGIN = 0.2; // 20%

export const MODEL_PRICING = {
  // --- GPT-5 family ---
  "gpt-5": { input: 0.625, output: 5.00 },
  "gpt-5-mini": { input: 0.125, output: 1.00 },
  "gpt-5-nano": { input: 0.025, output: 0.20 },
  "gpt-5-pro": { input: 7.50, output: 60.00 },

  // --- GPT-4.1 / 4o family ---
  "gpt-4.1": { input: 1.00, output: 4.00 },
  "gpt-4.1-mini": { input: 0.20, output: 0.80 },
  "gpt-4.1-nano": { input: 0.05, output: 0.20 },
  "gpt-4o": { input: 1.25, output: 5.00 },
  "gpt-4o-mini": { input: 0.075, output: 0.30 },

  // --- GPT-3.5 legacy ---
  "gpt-3.5-turbo": { input: 0.25, output: 0.75 },
  "gpt-3.5-turbo-0125": { input: 0.25, output: 0.75 },

  // --- o-series ---
  "o1": { input: 7.50, output: 30.00 },
  "o1-pro": { input: 75.00, output: 300.00 },
  "o3": { input: 1.00, output: 4.00 },
  "o3-pro": { input: 10.00, output: 40.00 },
  "o4-mini": { input: 0.55, output: 2.20 },

  // --- Image generation ---
  "gpt-image-1": { perImage: 0.04 },
  "gpt-image-1-mini": { perImage: 0.01 },

  // --- Audio ---
  "gpt-4o-mini-tts": { perMin: 0.015 },
  "gpt-4o-mini-transcribe": { perMin: 0.003 },
};

// Function to calculate adjusted pricing
export function getModelPrice(model, type = "input") {
  const base = MODEL_PRICING[model]?.[type] || 0;
  return (base * (1 + PROFIT_MARGIN)).toFixed(4);
             }
