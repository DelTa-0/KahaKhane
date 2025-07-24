// contentRecommender.js
// 💡 Academic-friendly implementation of Content-Based Recommendation (TF-IDF + Cosine Similarity)

// ================================
// ✅ Tokenize helper
// ================================
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // keep letters & numbers
    .split(/\s+/)
    .filter(Boolean);
}

// ================================
// ✅ Build docs from restaurant data
// Each doc is an array of words from name, address, menu names
// ================================
function buildDocuments(restaurants) {
  return restaurants.map(r => {
    const menuNames = (r.menu || []).map(item => item.name).join(' ');
    const combined = `${r.name || ''} ${r.address || ''} ${menuNames}`;
    return tokenize(combined);
  });
}

// ================================
// ✅ Compute TF-IDF vectors
// ================================
function computeTFIDF(docs) {
  // Build vocabulary
  const vocab = new Set();
  docs.forEach(doc => doc.forEach(term => vocab.add(term)));
  const vocabList = Array.from(vocab);

  // Count in how many docs each term appears
  const docCount = docs.length;
  const docFreq = {};
  vocabList.forEach(term => { docFreq[term] = 0; });
  docs.forEach(doc => {
    const seen = new Set(doc);
    seen.forEach(term => { docFreq[term]++; });
  });

  // IDF for each term
  const idf = {};
  vocabList.forEach(term => {
    idf[term] = Math.log(docCount / (1 + docFreq[term]));
  });

  // TF-IDF vector for each doc
  const vectors = docs.map(doc => {
    return vocabList.map(term => {
      const termCount = doc.filter(t => t === term).length;
      const tf = termCount / doc.length;
      return tf * idf[term];
    });
  });

  return { vectors, vocabList };
}

// ================================
// ✅ Cosine Similarity
// ================================
function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ================================
// ✅ Main function to recommend
// Pass in all restaurants & a base restaurant_id
// ================================
function recommendContentBased(restaurants, baseRestaurantId) {
  const docs = buildDocuments(restaurants);
  const { vectors } = computeTFIDF(docs);

  // Find the index of the base restaurant
  const baseIndex = restaurants.findIndex(r => String(r.restaurant_id) === String(baseRestaurantId));
  if (baseIndex === -1) {
    throw new Error('Base restaurant not found');
  }

  const baseVector = vectors[baseIndex];

  // Compute similarity for each restaurant
  const scored = restaurants.map((r, idx) => {
    if (idx === baseIndex) return null;
    return {
      restaurant: r,
      score: cosineSimilarity(baseVector, vectors[idx])
    };
  }).filter(Boolean);

  // Sort by similarity score
  scored.sort((a, b) => b.score - a.score);

  return scored; // [{restaurant, score}, ...]
}

// ================================
// ✅ Export
// ================================
module.exports = {
  recommendContentBased
};
