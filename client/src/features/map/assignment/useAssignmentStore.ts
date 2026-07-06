import { create } from 'zustand'
import type { SupportedZone, Vehicle } from '../../../shared/types/domain.types'
import { ZONES } from '../../../shared/geo/zones'
import type { AssociatedIncident, GeoTaggedAsset } from '../types'
import { assignVehicles, type Assignment } from './assignVehicles'
import { zoneHasAvailableVehicle } from './zoneHasAvailableVehicle'

const ALL_ZONES = Object.keys(ZONES) as SupportedZone[]

export interface AssignmentState {
  assignments: Assignment[]
  zoneAvailability: Record<SupportedZone, boolean>
  recompute: (
    vehicles: Vehicle[],
    assets: GeoTaggedAsset[],
    incidents: AssociatedIncident[],
    zonesById: Map<string, string>
  ) => void
}

const INITIAL_ZONE_AVAILABILITY: Record<SupportedZone, boolean> = ALL_ZONES.reduce(
  (acc, zone) => ({ ...acc, [zone]: false }),
  {} as Record<SupportedZone, boolean>
)

/**
 * Store propio del motor automático de asignación
 * (docs/feature/11-vehicle-assignment-engine.md, Decisión confirmada #3).
 * `recompute` es la única forma de escribir el estado: corre `assignVehicles`
 * y `zoneHasAvailableVehicle` (por cada una de las 5 zonas) sobre el snapshot
 * recibido. Se dispara desde `useSyncAssignmentStore` cada vez que cambian
 * `vehicles`, `assets` o `incidents` — no persiste entre sesiones (el mock no
 * tiene endpoint para esto, mismo criterio que el resto de los stores
 * derivados de la app).
 */
export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  zoneAvailability: INITIAL_ZONE_AVAILABILITY,

  recompute: (vehicles, assets, incidents, zonesById) => {
    const assignments = assignVehicles(vehicles, assets, incidents, zonesById)

    const zoneAvailability = ALL_ZONES.reduce(
      (acc, zone) => ({ ...acc, [zone]: zoneHasAvailableVehicle(zone, vehicles, zonesById) }),
      {} as Record<SupportedZone, boolean>
    )

    set({ assignments, zoneAvailability })
  }
}))
