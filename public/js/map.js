// 👇 recommendationsData is already injected in your EJS
console.log("logging", recommendationsData);

let map;

// Utility to add a marker on Google Maps with custom icons and auto-popup
function addMarker(lat, lng, html, color = 'red', autoOpen = false) {
  let icon;
  if (color === 'blue') {
    icon = {
      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      scaledSize: new google.maps.Size(32, 32)
    };
  } else {
    icon = {
      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      scaledSize: new google.maps.Size(32, 32)
    };
  }
  const marker = new google.maps.Marker({
    position: { lat, lng },
    map,
    icon
  });

  const infowindow = new google.maps.InfoWindow({
    content: html
  });

  marker.addListener('click', () => {
    infowindow.open(map, marker);
  });
  if (autoOpen) {
    infowindow.open(map, marker);
  }
  return marker;
}

// Initialize the map
function initMap() {
  // Default center (Kathmandu)
  const defaultCenter = { lat: 27.7172, lng: 85.3240 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultCenter,
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true
  });

  // Plot restaurant markers with clustering
  const bounds = new google.maps.LatLngBounds();
  const markers = [];
  recommendationsData.forEach(r => {
    if (r.restaurant.location && Array.isArray(r.restaurant.location.coordinates)) {
      const [lng, lat] = r.restaurant.location.coordinates;
      const marker = addMarker(
        lat, lng,
        `<b>${r.restaurant.name}</b><br>${r.restaurant.address || ''}<br>${r.distanceKm ? r.distanceKm.toFixed(2) + ' km away' : ''}`
      );
      markers.push(marker);
      bounds.extend({ lat, lng });
    }
  });

  // Marker clustering (if many restaurants)
  if (window.MarkerClusterer) {
    new MarkerClusterer(map, markers, {
      imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    });
  }

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, 50);
  }

  // Handle user location from query or text
  const urlParams = new URLSearchParams(window.location.search);
  const latParam = urlParams.get('lat');
  const lngParam = urlParams.get('lng');
  const locationText = urlParams.get('location');

  if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    console.log('📍 Using lat/lng from query:', lat, lng);
    map.panTo({ lat, lng });
    addMarker(lat, lng, '<b>You are here!</b>', 'blue', true);
  } else if (locationText && locationText.trim() !== '') {
    console.log('🌐 Using text location from query:', locationText);
    geocodeLocation(locationText.trim());
  } else if (navigator.geolocation) {
    console.log('🛰️ Using browser geolocation as fallback...');
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      map.panTo({ lat, lng });
      addMarker(lat, lng, '<b>You are here!</b>', 'blue', true);
    }, err => console.warn('Geolocation error:', err));
  }
}

// Geocode text location
async function geocodeLocation(text) {
  try {
    const res = await fetch(`/api/geocode?location=${encodeURIComponent(text)}`);
    const data = await res.json();
    if (data && data.coordinates) {
      const [lng, lat] = data.coordinates;
      map.panTo({ lat, lng });
      addMarker(lat, lng, `<b>Location: ${text}</b>`, 'blue', true);
    }
  } catch (err) {
    console.error('Error fetching geocode for text location:', err);
  }
}
