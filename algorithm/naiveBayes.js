const fs = require('fs');

// Load the trained model parameters from the JSON file
const model = JSON.parse(fs.readFileSync('model_params.json', 'utf8'));

// Tokenize helper function
function tokenize(text) {
  if (typeof text !== 'string') {
    console.warn('⚠️ tokenize() expected a string but got:', text);
    return [];
  }
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Naive Bayes Sentiment Analysis Function
 * @param {string[]} words - Array of tokenized words
 * @param {boolean} granular - If true, returns log-probabilities for both classes
 * @returns {number|object} 1/0 for binary, or {logProb0, logProb1} for granular
 */
function predict_naive_bayes(words, granular = false) {
  if (!Array.isArray(words)) {
    console.warn('⚠️ predict_naive_bayes expected an array but got:', words);
    words = [];
  }
  const scores = {};
  const totalDocs = model.class_counts[0] + model.class_counts[1];

  // Handle empty input: return neutral log-probabilities
  if (words.length === 0) {
    const prior0 = Math.log((model.class_counts[0] + 1) / (totalDocs + 2));
    const prior1 = Math.log((model.class_counts[1] + 1) / (totalDocs + 2));
    if (granular) return { logProb0: prior0, logProb1: prior1 };
    return prior1 > prior0 ? 1 : 0;
  }

  for (let label of [0, 1]) { // 0: Negative, 1: Positive
    let logProb = Math.log((model.class_counts[label] + 1) / (totalDocs + 2)); // Laplace smoothing on prior probability

    for (let word of words) {
      const wordFreq = (model.word_counts[label][word] || 0) + 1;  // Laplace smoothing on word frequency
      const wordProb = wordFreq / (model.total_words[label] + model.vocab_size);  // Probability of word in the class
      logProb += Math.log(wordProb);  // Log probability
    }
    scores[label] = logProb;
  }

  if (granular) {
    return { logProb0: scores[0], logProb1: scores[1] };
  }
  return scores[1] > scores[0] ? 1 : 0; // 1 for positive, 0 for negative
}

/**
 * Get probability of positive sentiment
 * @param {string[]} words - Array of tokenized words
 * @returns {number} Probability of positive sentiment (0-1)
 */
function getPositiveProbability(words) {
  const { logProb0, logProb1 } = predict_naive_bayes(words, true);
  const maxLog = Math.max(logProb0, logProb1);
  const exp0 = Math.exp(logProb0 - maxLog);
  const exp1 = Math.exp(logProb1 - maxLog);
  const sumExp = exp0 + exp1;
  return exp1 / sumExp;
}

module.exports = { predict_naive_bayes, tokenize, getPositiveProbability };
