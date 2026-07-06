import { useEffect, type JSX } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import { useMapStore } from '../store/useMapStore'
import { buildHeatmapData } from '../utils/buildHeatmapData'
import { INCIDENT_STATUS_COLORS } from '../constants/incidentStatusColors'
import type { IncidentStatus } from '../../../shared/types/domain.types'

const STATUSES: IncidentStatus[] = ['REPORTED', 'IN_PROGRESS', 'RESOLVED']

/**
 * Renders the incident heatmap via `leaflet.heat`
 * (docs/feature/10-maps-create.md, decisión #4). `leaflet.heat` colors an
 * entire layer through a single gradient, it cannot color individual points
 * within one layer — so one `L.heatLayer` is mounted per incident status,
 * each with a monochrome gradient matching `INCIDENT_STATUS_COLORS` (same
 * palette as `HeatmapLegend`), and only the statuses/types selected in
 * `heatmapFilters` contribute points.
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
  const heatmapFilters = useMapStore((state) => state.heatmapFilters)

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

      layers = STATUSES.filter((status) => heatmapFilters.statuses.includes(status)).map(
        (status) => {
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
        }
      )
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
  }, [map, incidents, heatmapFilters])

  return null
}
