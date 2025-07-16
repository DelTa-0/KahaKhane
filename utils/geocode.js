const fetch = require('node-fetch');

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'KahaKhane/1.0 aryalmadhave123@gmail.com' }
  });
  const data = await res.json();
  if (data && data.length > 0) {
    const { lat, lon } = data[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon) };
  }
  return null;
}

module.exports = geocode;
