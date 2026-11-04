const R = 6371000; // earth radius in metres
const rad = (d) => (d * Math.PI) / 180;

// distance between two GPS points, in metres
function haversine(lat1, lng1, lat2, lng2) {
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// is a point inside a visit's geofence? (visit needs lat, lng, radius in metres)
function isInside(lat, lng, visit) {
  return haversine(lat, lng, visit.lat, visit.lng) <= visit.radius;
}

// total metres along an ordered list of points. Segments longer than maxJump (GPS glitches) are ignored
function routeDistance(points, maxJump = 5000) {
  let m = 0;
  for (let i = 1; i < points.length; i++) {
    const d = haversine(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng);
    if (d <= maxJump) m += d;
  }
  return m;
}

module.exports = { haversine, isInside, routeDistance };