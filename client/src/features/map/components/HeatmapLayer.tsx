import { useEffect, type JSX } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import { useMapStore } from '../store/useMapStore'
import { buildAssetHeatmapData, buildHeatmapData } from '../utils/buildHeatmapData'
import { INCIDENT_STATUS_COLORS } from '../constants/incidentStatusColors'
import { assetMarkerColor } from '../utils/assetMarkerColor'
import type { AssetStatus, IncidentStatus } from '../../../shared/types/domain.types'

const STATUSES: IncidentStatus[] = ['REPORTED', 'IN_PROGRESS', 'RESOLVED']
const ASSET_STATUSES: AssetStatus[] = ['OK', 'FULL', 'DAMAGED', 'OUT_OF_SERVICE']

// Asset heat tuning (docs/feature/14-assets-in-heatmap.md, "Densidad y tuning"):
// ~1500 assets vs. 40 incidents would saturate the map with the incident
// defaults, so asset points contribute less heat, over a slightly smaller
// radius, with a higher saturation ceiling. Values de partida a afinar
// visualmente.
const ASSET_POINT_INTENSITY = 0.4
const ASSET_HEAT_MAX = 3.0
const ASSET_HEAT_RADIUS = 20

/**
 * Renders the incident heatmap via `leaflet.heat`
 * (docs/feature/10-maps-create.md, decisión #4). `leaflet.heat` colors an
 * entire layer through a single gradient, it cannot color individual points
 * within one layer — so one `L.heatLayer` is mounted per incident status,
 * each with a monochrome gradient matching `INCIDENT_STATUS_COLORS` (same
 * palette as `HeatmapLegend`), and only the statuses/types selected in
 * `heatmapFilters` contribute points.
 *
 * Assets radiate too (docs/feature/14-assets-in-heatmap.md): the same
 * per-status-layer mechanism is applied to assets, one `L.heatLayer` per
 * selected `AssetStatus` colored by `assetMarkerColor`, filtered by
 * `assetHeatmapFilters`. Asset layers use a lower per-point intensity and a
 * higher saturation ceiling so ~1500 assets don't blanket the map (see the
 * `ASSET_*` tuning constants).
 *
 * Guard against `map.getSize()` being `0x0` (docs/feature/10-maps-create.md,
 * "Addendum — fix `IndexSizeError`"): `leaflet.heat` sizes its canvas from
 * `map.getSize()` when the layer is added, and `heatmapEnabled` defaults to
 * `true` (CA-05) — so this layer can mount before the map container has a
 * resolved layout size. Creating the layer against a `0x0` canvas throws
 * `IndexSizeError` on the first `draw()`. We poll via `requestAnimationFrame`
 * until the map reports a real size before creating the layers.
 */
export function HeatmapLayer(): JSX.Element | null {
  const map = useMap()
  const incidents = useMapStore((state) => state.incidents)
  const assets = useMapStore((state) => state.assets)
  const heatmapFilters = useMapStore((state) => state.heatmapFilters)
  const assetHeatmapFilters = useMapStore((state) => state.assetHeatmapFilters)

  useEffect(() => {
    let cancelled = false
    let frameId: number | null = null
    let layers: L.Layer[] = []

    const createLayers = (): void => {
      if (cancelled) return

      const size = map.getSize()
      if (size.x === 0 || size.y === 0) {
        frameId = requestAnimationFrame(createLayers)
        return
      }

      const incidentLayers = STATUSES.filter((status) =>
        heatmapFilters.statuses.includes(status)
      ).map((status) => {
        const points = buildHeatmapData(incidents, {
          statuses: [status],
          types: heatmapFilters.types
        })

        const color = INCIDENT_STATUS_COLORS[status]

        const tuples = points.map((point): L.HeatLatLngTuple => [point.lat, point.lng, 1])

        return L.heatLayer(tuples, {
          radius: 25,
          blur: 15,
          gradient: { 0.4: color, 1: color }
        }).addTo(map)
      })

      const assetLayers = ASSET_STATUSES.filter((status) =>
        assetHeatmapFilters.statuses.includes(status)
      ).map((status) => {
        const points = buildAssetHeatmapData(assets, {
          statuses: [status],
          types: assetHeatmapFilters.types
        })

        const color = assetMarkerColor(status)

        const tuples = points.map((point): L.HeatLatLngTuple => [
          point.lat,
          point.lng,
          ASSET_POINT_INTENSITY
        ])

        return L.heatLayer(tuples, {
          radius: ASSET_HEAT_RADIUS,
          blur: 15,
          max: ASSET_HEAT_MAX,
          gradient: { 0.4: color, 1: color }
        }).addTo(map)
      })

      layers = [...incidentLayers, ...assetLayers]
    }

    createLayers()

    return () => {
      cancelled = true
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
      for (const layer of layers) {
        map.removeLayer(layer)
      }
    }
  }, [map, incidents, assets, heatmapFilters, assetHeatmapFilters])

  return null
}
