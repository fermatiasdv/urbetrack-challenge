import { create } from 'zustand'
import type { IncidentStatusFilter, IncidentTypeFilter } from '../constants/incidentFilterOptions'
import { DEFAULT_INCIDENT_FILTERS, type IncidentFilters } from '../utils/incidentFilters'

export interface IncidentFiltersState extends IncidentFilters {
  setType: (type: IncidentTypeFilter) => void
  setStatus: (status: IncidentStatusFilter) => void
  setZoneIds: (zoneIds: string[]) => void
  reset: () => void
}

/**
 * Holds the current value of the 3 incident filters (Tipo/Estado/Zona), same
 * criterion as `useAssetFiltersStore`: lives in `features/incidents/` because
 * only this feature reads it.
 */
export const useIncidentFiltersStore = create<IncidentFiltersState>((set) => ({
  ...DEFAULT_INCIDENT_FILTERS,
  setType: (type) => set({ type }),
  setStatus: (status) => set({ status }),
  setZoneIds: (zoneIds) => set({ zoneIds }),
  reset: () => set(DEFAULT_INCIDENT_FILTERS)
}))
