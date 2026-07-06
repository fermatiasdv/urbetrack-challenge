/**
 * Rounds a lat/lng pair to 4 decimal places, the precision used across the
 * app for both display (docs/feature/07-assets-page.md) and zone derivation
 * (docs/specs/geo-zone-derivation.md, CA-06).
 */
export function roundCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  const factor = 10000

  return {
    lat: Math.round(lat * factor) / factor,
    lng: Math.round(lng * factor) / factor
  }
}
