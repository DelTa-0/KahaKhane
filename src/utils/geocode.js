const fetch = require('node-fetch');
require('dotenv').config();

module.exports = async function geocode(address) {
  const apiKey = process.env.OPENCAGE_API_KEY;
  console.log(apiKey,"Getting api key")
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}&language=en`;
console.log(url,"Getting url")
  const res = await fetch(url);
  const data = await res.json();

  if (data && data.results && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry;
    return {
      coordinates: [lng, lat]
    };
  } else {
    console.error('OpenCage error:', data.status ? data.status.message : 'No results');
    return null;
  }
};
