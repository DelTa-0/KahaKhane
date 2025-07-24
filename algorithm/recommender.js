// recommender.js

// ✅ Import Naive Bayes predictor and tokenizer
const { predict_naive_bayes, tokenize } = require('./naiveBayes');

// -------------------------
// ✅ Build documents for TF-IDF
// -------------------------
function buildDocuments(restaurants) {
  return restaurants.map(r => {
    const menuNames = (r.menu || []).map(item => item.name).join(' ');
    const combined = `${r.name || ''} ${r.address || ''} ${menuNames}`;
    return tokenize(combined);
  });
}

// -------------------------
// ✅ TF-IDF computation
// -------------------------
function computeTFIDF(docs) {
  const vocab = new Set();
  docs.forEach(doc => doc.forEach(term => vocab.add(term)));
  const vocabList = Array.from(vocab);

  const docCount = docs.length;
  const docFreq = {};
  vocabList.forEach(t => (docFreq[t] = 0));

  docs.forEach(doc => {
    const seen = new Set(doc);
    seen.forEach(t => docFreq[t]++);
  });

  const idf = {};
  vocabList.forEach(t => {
    idf[t] = Math.log(docCount / (1 + docFreq[t]));
  });

  const vectors = docs.map(doc => {
    return vocabList.map(term => {
      const termCount = doc.filter(t => t === term).length;
      const tf = termCount / doc.length;
      return tf * idf[term];
    });
  });

  return { vectors, vocabList };
}

// -------------------------
// ✅ Cosine Similarity
// -------------------------
function cosineSimilarity(vecA, vecB) {
  let dot = 0,
    magA = 0,
    magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// -------------------------
// ✅ Haversine distance (in km)
// -------------------------
function haversineDistance(coord1, coord2) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(coord2[1] - coord1[1]);
  const dLon = toRad(coord2[0] - coord1[0]);
  const lat1 = toRad(coord1[1]);
  const lat2 = toRad(coord2[1]);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// -------------------------
// ✅ Main Recommendation Function
// -------------------------
function buildRecommendations({ restaurants, user, reviews }) {
  // Build docs and TF-IDF
  const docs = buildDocuments(restaurants);
  const { vectors } = computeTFIDF(docs);

  // Build profile vector from user's past orders
  const orderedRestaurantIds = new Set();
  (user.orders || []).forEach(order => {
    (order.items || []).forEach(item => {
      orderedRestaurantIds.add(String(item.restaurant));
    });
  });

  let profileVector = new Array(vectors[0]?.length || 0).fill(0);
  const orderedIndexes = restaurants
    .map((r, idx) =>
      orderedRestaurantIds.has(String(r.restaurant_id)) ? idx : -1
    )
    .filter(idx => idx >= 0);

  orderedIndexes.forEach(idx => {
    for (let i = 0; i < profileVector.length; i++) {
      profileVector[i] += vectors[idx][i];
    }
  });

  if (orderedIndexes.length > 0) {
    profileVector = profileVector.map(v => v / orderedIndexes.length);
  }

  // -------------------------
  // ✅ Build sentiment map from reviews using Naive Bayes
  // -------------------------
  const sentimentMap = {};
  (reviews || []).forEach(rv => {
    const id = String(rv.restaurant_id);

    // Predict sentiment using the trained Naive Bayes model
    const cleanedReview = tokenize(rv.reviewText); // Tokenize the review text
    const sentimentScore = predict_naive_bayes(cleanedReview); // Get the sentiment (0 or 1)

    if (!sentimentMap[id]) sentimentMap[id] = [];
    sentimentMap[id].push(sentimentScore);
  });

  // Compute scores for each restaurant
  const scored = restaurants.map((r, idx) => {
    const id = String(r.restaurant_id);

    const contentScore =
      profileVector.length > 0 ? cosineSimilarity(profileVector, vectors[idx]) : 0;

    // Average sentiment score for this restaurant
    let sentimentScore = 0;
    if (sentimentMap[id]) {
      const arr = sentimentMap[id];
      sentimentScore = arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    // Popularity score (if stored in your data)
    const popularityScore = r.popularity || 0;

    // Distance
    let distanceScore = 0;
    if (user.location && r.location && r.location.coordinates) {
      const userCoord = user.location.coordinates; // [lng, lat]
      const restCoord = r.location.coordinates; // [lng, lat]
      distanceScore = haversineDistance(userCoord, restCoord);
    }

    return {
      restaurant: r,
      contentScore,
      sentimentScore,
      popularityScore,
      distanceKm: distanceScore
    };
  });

  // Normalize distance to a score penalty (0 to 1)
  const maxDist = Math.max(...scored.map(s => s.distanceKm));
  scored.forEach(s => {
    s.distancePenalty = maxDist > 0 ? s.distanceKm / maxDist : 0;
  });

  // Final weighted score
  const α = 0.4,
    β = 0.3,
    γ = 0.2,
    δ = 0.1;
  scored.forEach(s => {
    s.finalScore =
      α * s.contentScore +
      β * s.popularityScore +
      γ * s.sentimentScore - 
      δ * s.distancePenalty;
  });

  // Sort by final score
  scored.sort((a, b) => b.finalScore - a.finalScore);
  return scored;
}

// -------------------------
// ✅ Export
// -------------------------
module.exports = {
  buildRecommendations,
  computeTFIDF,
  cosineSimilarity,
  haversineDistance
};
