// zy b-sj vendor integration for Claude Sonnet 4-6 via Anthropic SDK
// Sensitive data (apiKey) is read from environment variable at runtime.
module.exports = {
  vendor: "zyb-sj",
  npmPackage: "@ai-sdk/anthropic",
  model: "claude-sonnet-4-6",
  // Base URL for the openproxy Anthropic endpoint
  baseURL: process.env.AI_BASE_URL || "https://openproxy.zuoyebang.cc/openproxy/rp/pt/anthropic",
  // API key is injected at runtime via environment variable
  apiKey: process.env.AI_API_KEY || "",
  // Headers to pass along with requests (constructed if apiKey is available)
  headers: process.env.AI_API_KEY
    ? { Authorization: `Bearer ${process.env.AI_API_KEY}` }
    : {},
  // Optional timeout for requests (ms)
  timeout: 15000
};
