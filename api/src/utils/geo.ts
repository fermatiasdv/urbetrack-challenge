export const BA_BOUNDS = {
  minLat: -34.705,
  maxLat: -34.526,
  minLng: -58.531,
  maxLng: -58.335
}

export function randomCoord() {
  const lat = BA_BOUNDS.minLat + Math.random() * (BA_BOUNDS.maxLat - BA_BOUNDS.minLat)
  const lng = BA_BOUNDS.minLng + Math.random() * (BA_BOUNDS.maxLng - BA_BOUNDS.minLng)
  return { lat, lng }
}
