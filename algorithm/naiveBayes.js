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

// Naive Bayes Sentiment Analysis Function
function predict_naive_bayes(words) {
  const scores = {};
  const totalDocs = model.class_counts[0] + model.class_counts[1];

  for (let label of [0, 1]) { // 0: Negative, 1: Positive
    let logProb = Math.log((model.class_counts[label] + 1) / (totalDocs + 2)); // Laplace smoothing on prior probability

    for (let word of words) {
      const wordFreq = (model.word_counts[label][word] || 0) + 1;  // Laplace smoothing on word frequency
      const wordProb = wordFreq / (model.total_words[label] + model.vocab_size);  // Probability of word in the class
      logProb += Math.log(wordProb);  // Log probability
    }
    
    scores[label] = logProb;
  }

  return scores[1] > scores[0] ? 1 : 0; // 1 for positive, 0 for negative
}

module.exports = { predict_naive_bayes, tokenize };
