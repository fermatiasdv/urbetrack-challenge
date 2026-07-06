import { create } from 'zustand'
import { deriveZone } from '../../../shared/geo/deriveZone'
import type { Asset, Incident, SupportedZone } from '../../../shared/types/domain.types'
import type {
  AssociatedIncident,
  GeoTaggedAsset,
  GeoTaggedIncident,
  HeatmapFilters
} from '../types'
import { associateIncidents } from '../utils/associateIncident'

const ALL_HEATMAP_FILTERS: HeatmapFilters = {
  statuses: ['REPORTED', 'IN_PROGRESS', 'RESOLVED'],
  types: ['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']
}

export interface MapState {
  assets: GeoTaggedAsset[]
  incidents: AssociatedIncident[]
  heatmapEnabled: boolean
  heatmapFilters: HeatmapFilters
  selectedZone: SupportedZone | null

  syncFromShared: (assets: Asset[], incidents: Incident[]) => void
  toggleHeatmap: () => void
  setHeatmapFilters: (filters: HeatmapFilters) => void
  setSelectedZone: (zone: SupportedZone | null) => void
}

/**
 * Source of truth for the `map` feature (docs/feature/10-maps-create.md,
 * "MapStore"). Unlike `assets`/`incidents`, this store is not hydrated
 * directly by a query — it derives its data from the shared
 * `shared/services/assets`/`shared/services/incidents` stores via
 * `syncFromShared` (see `useSyncMapStore`), so it recomputes every time
 * those change, including local mutations made from `/activos`/`/incidentes`
 * (alta, edición, borrado) — keeping the map in sync in real time (CA #24 de
 * verified-scope.md).
 *
 * `syncFromShared` performs, in order:
 * 1. Zone derivation exclusively from coordinates (`deriveZone`, MAP-00) —
 *    points outside the 5 supported zones are discarded (CA-01).
 * 2. Incident↔asset association (`associateIncidents`) over the already
 *    zone-filtered data.
 *
 * `heatmapEnabled` defaults to `true` (CA-05) and `heatmapFilters` defaults
 * to every status/type selected.
 */
export const useMapStore = create<MapState>((set) => ({
  assets: [],
  incidents: [],
  heatmapEnabled: true,
  heatmapFilters: ALL_HEATMAP_FILTERS,
  selectedZone: null,

  syncFromShared: (assets, incidents) => {
    const geoTaggedAssets: GeoTaggedAsset[] = []

    for (const asset of assets) {
      const derivedZone = deriveZone(asset.lat, asset.lng)
      if (derivedZone !== null) {
        geoTaggedAssets.push({ ...asset, derivedZone })
      }
    }

    const geoTaggedIncidents: GeoTaggedIncident[] = []
    for (const incident of incidents) {
      const derivedZone = deriveZone(incident.lat, incident.lng)
      if (derivedZone !== null) {
        geoTaggedIncidents.push({ ...incident, derivedZone })
      }
    }

    const associatedIncidents = associateIncidents(geoTaggedIncidents, geoTaggedAssets)

    set({ assets: geoTaggedAssets, incidents: associatedIncidents })
  },
  toggleHeatmap: () => set((state) => ({ heatmapEnabled: !state.heatmapEnabled })),
  setHeatmapFilters: (filters) => set({ heatmapFilters: filters }),
  setSelectedZone: (zone) => set({ selectedZone: zone })
}))
