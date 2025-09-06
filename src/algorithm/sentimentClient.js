// sentimentClient.js
const axios = require("axios");

const SENTIMENT_API = process.env.SENTIMENT_API_URL || "http://localhost:8000";
const BATCH_SIZE = 256;
const REQUEST_TIMEOUT_MS = 60000;
const cache = new Map();

function normalizeText(t) {
  return (t || "").trim();
}

async function predictBatch(texts) {
  const results = new Array(texts.length);
  const toFetch = [];
  const origIndices = [];

  for (let i = 0; i < texts.length; i++) {
    const t = normalizeText(texts[i]);
    if (cache.has(t)) results[i] = cache.get(t);
    else {
      origIndices.push(i);
      toFetch.push(t);
    }
  }

  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    const batchOrigIndices = origIndices.slice(i, i + BATCH_SIZE);
    try {
      const res = await axios.post(`${SENTIMENT_API}/predict_batch`, { texts: batch }, { timeout: REQUEST_TIMEOUT_MS });
      const positives = res.data?.positive || [];
      for (let j = 0; j < positives.length; j++) {
        const origIndex = batchOrigIndices[j];
        results[origIndex] = positives[j];
        cache.set(batch[j], positives[j]);
      }
    } catch (err) {
      console.error("sentiment API error:", err.message || err);
      for (let j = 0; j < batch.length; j++) results[batchOrigIndices[j]] = 0.5;
    }
  }

  for (let i = 0; i < texts.length; i++) if (typeof results[i] !== "number") results[i] = 0.5;

  return results;
}

async function getSentimentScore(text) {
  try {
    const [score] = await predictBatch([text]);
    return score;
  } catch (err) {
    console.error("getSentimentScore error:", err.message || err);
    return 0.5;
  }
}

module.exports = { predictBatch, getSentimentScore };
