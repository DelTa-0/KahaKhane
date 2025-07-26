    console.log("loogiing",recommendationsData)
  // --- Utility to add a marker ---
  function addMarker(lng, lat, html, color = 'red') {
    new maplibregl.Marker({ color })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup().setHTML(html))
      .addTo(map);
  }

  // --- Initialize the map ---
  const map = new maplibregl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/streets/style.json?key=My1QQEq7GZaZObIePKka',
    center: [85.3240, 27.7172], // Default center (Kathmandu)
    zoom: 13
  });

  map.addControl(new maplibregl.NavigationControl());

  // --- Plot restaurant markers ---
  const bounds = new maplibregl.LngLatBounds();
  recommendationsData.forEach(r => {
    if (r.restaurant.location && Array.isArray(r.restaurant.location.coordinates)) {
      const [lng, lat] = r.restaurant.location.coordinates;
      addMarker(lng, lat,
        `<b>${r.restaurant.name}</b><br>${r.restaurant.address || ''}<br>${r.distanceKm ? r.distanceKm.toFixed(2) + ' km away' : ''}`);
      bounds.extend([lng, lat]);
    }
  });
  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, { padding: 50 });
  }

  // --- Handle user location from query or text ---
  const urlParams = new URLSearchParams(window.location.search);
  const latParam = urlParams.get('lat');
  const lngParam = urlParams.get('lng');
  const locationText = urlParams.get('location');

  async function geocodeLocation(text) {
    try {
      const res = await fetch(`/api/geocode?location=${encodeURIComponent(text)}`);
      const data = await res.json();
      if (data && data.coordinates) {
        const [lng, lat] = data.coordinates;
        map.setCenter([lng, lat]);
        addMarker(lng, lat, `<b>Location: ${text}</b>`, 'blue');
      }
    } catch (err) {
      console.error('Error fetching geocode for text location:', err);
    }
  }

  // ✅ Priority 1: lat/lng directly in query
  if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    console.log('📍 Using lat/lng from query:', lat, lng);
    map.setCenter([lng, lat]);
    addMarker(lng, lat, '<b>You are here!</b>', 'blue');
  }
  // ✅ Priority 2: location text (no lat/lng given)
  else if (locationText && locationText.trim() !== '') {
    console.log('🌐 Using text location from query:', locationText);
    geocodeLocation(locationText.trim());
  }
  // ✅ Optional fallback: browser geolocation
  else if (navigator.geolocation) {
    console.log('🛰️ Using browser geolocation as fallback...');
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      map.setCenter([lng, lat]);
      addMarker(lng, lat, '<b>You are here!</b>', 'blue');
    }, err => console.warn('Geolocation error:', err));
  }