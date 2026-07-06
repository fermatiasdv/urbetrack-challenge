import L from 'leaflet'

/**
 * Builds a small colored circle marker icon (`L.divIcon`) for a literal hex
 * color, shared by `AssetMarkersLayer` (colored by `assetMarkerColor`) and
 * `IncidentMarkersLayer` (colored by `INCIDENT_STATUS_COLORS`). Avoids
 * depending on Leaflet's default marker image assets, which need extra
 * bundler configuration this project doesn't have set up.
 */
export function createColorMarkerIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'map-color-marker',
    html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #ffffff;box-shadow:0 0 2px rgba(0,0,0,0.5);"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
}
