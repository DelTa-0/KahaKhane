// src/utils/recommender.js
// Recommendation engine for restaurants based on content, sentiment, and distance
// Compute TF-IDF vectors for a list of tokenized documents
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
      const tf = doc.length > 0 ? termCount / doc.length : 0;
      return tf * idf[term];
    });
  });

  return { vectors, vocabList };
}

// Cosine similarity between two vectors
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

// Haversine distance between two coordinates [lng, lat]
function haversineDistance(coord1, coord2) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371; // km
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
  // Build docs and TF-IDF (content-based similarity)
  const docs = restaurants.map(r => {
    const menuNames = (r.menu || []).map(item => item.name).join(" ");
    return `${r.name || ""} ${r.address || ""} ${menuNames}`.toLowerCase();
  });
  const { vectors } = computeTFIDF(docs.map(d => d.split(/\s+/)));

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
      orderedRestaurantIds.has(String(r._id)) ? idx : -1
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
  // ✅ Sentiment from DB (already scored at review submission)
  // -------------------------
  const sentimentMap = {};
  (reviews || []).forEach(rv => {
    const restIdStr = rv.restaurantId ? String(rv.restaurantId) : null;
    if (!restIdStr || rv.sentimentScore == null) return;
    if (!sentimentMap[restIdStr]) sentimentMap[restIdStr] = [];
    sentimentMap[restIdStr].push(rv.sentimentScore);
  });

  // -------------------------
  // ✅ Compute scores for each restaurant
  // -------------------------
  const scored = restaurants.map((r, idx) => {
    const id = r._id ? String(r._id) : null;

    // Content similarity (profile vs restaurant TF-IDF)
    const contentScore =
      profileVector.length > 0 ? cosineSimilarity(profileVector, vectors[idx]) : 0;

    // Average sentiment score from DB
    let sentimentScore = 0;
    if (id && sentimentMap[id]) {
      const arr = sentimentMap[id];
      sentimentScore = arr.reduce((a, b) => a + b, 0) / arr.length;
    }

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
      distanceKm: distanceScore
    };
  });

  // -------------------------
  // ✅ Normalize distance to a penalty and compute final score
  // -------------------------
  const maxDist = Math.max(...scored.map(s => s.distanceKm));
  scored.forEach(s => {
    s.distancePenalty = maxDist > 0 ? s.distanceKm / maxDist : 0;
  });

  const α = 0.3; // weight: content
  const γ = 0.4; // weight: sentiment
  const δ = 0.3; // weight: distance penalty
  scored.forEach(s => {
    s.finalScore =
      α * s.contentScore +
      γ * s.sentimentScore -
      δ * s.distancePenalty;
  });

  // Sort by final score
  scored.sort((a, b) => b.finalScore - a.finalScore);

  return scored;
}

module.exports = { buildRecommendations };
