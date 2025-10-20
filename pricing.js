// === NexMind.One | Pricing & Cost Estimator ===

// 💰 Base cost per 1K tokens (USD)
// Source: OpenAI pricing (October 2025)
const basePricing = {
  "gpt-5": { input: 0.625, output: 5.0 },
  "gpt-5-mini": { input: 0.125, output: 1.0 },
  "gpt-4.1": { input: 0.25, output: 1.25 },
  "gpt-4.1-mini": { input: 0.20, output: 0.80 },
  "gpt-4o": { input: 0.125, output: 0.50 },
  "gpt-4o-mini": { input: 0.075, output: 0.30 },
  "gpt-4-turbo": { input: 0.10, output: 0.40 },
  "gpt-4": { input: 0.30, output: 1.50 },
  "gpt-3.5-turbo": { input: 0.003, output: 0.006 },
  "gpt-3.5": { input: 0.002, output: 0.004 },
};

// 💸 Apply a profit margin (default 20%)
const PROFIT_MARGIN = 0.2;

/**
 * Estimate cost for a given model, prompt size, and completion size.
 * @param {string} model - Model name (e.g., "gpt-4o-mini")
 * @param {number} promptTokens - Number of tokens in user input
 * @param {number} completionTokens - Number of tokens in the response
 * @returns {string} Estimated total cost in USD (string formatted to 6 decimals)
 */
export function estimateCost(model, promptTokens = 1000, completionTokens = 1000) {
  const pricing = basePricing[model] || basePricing["gpt-4o-mini"];
  const inputCost = (promptTokens / 1000) * pricing.input;
  const outputCost = (completionTokens / 1000) * pricing.output;
  const total = (inputCost + outputCost) * (1 + PROFIT_MARGIN);
  return total.toFixed(6);
}

/**
 * List all available models and their adjusted (with profit margin) pricing.
 */
export function listAllPricing() {
  const adjusted = {};
  for (const [model, price] of Object.entries(basePricing)) {
    adjusted[model] = {
      input: (price.input * (1 + PROFIT_MARGIN)).toFixed(6),
      output: (price.output * (1 + PROFIT_MARGIN)).toFixed(6),
    };
  }
  return adjusted;
}

// Debug example if run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("💰 NexMind.One model pricing (USD per 1K tokens, incl. profit):");
  console.table(listAllPricing());
}
