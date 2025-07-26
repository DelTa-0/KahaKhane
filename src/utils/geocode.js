const fetch = require("node-fetch");
const { APP_CONFIG } = require("../config/app.config");
require("dotenv").config();


module.exports = async function geocode(address) {
  const apiKey = APP_CONFIG.OPENCAGE_API_KEY;
  if (!apiKey) {
    console.error("OpenCage API key not found!");
    return null;
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    address
  )}&key=${apiKey}&language=en`;
  

  const res = await fetch(url);
  const data = await res.json();

  if (data && data.results && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry;
    return {
      coordinates: [lng, lat],
    };
  } else {
    return null;
  }
};
