import { useEffect, useMemo } from 'react'
import { useVehiclesStore } from '../../vehicles/store/useVehiclesStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import { useMapStore } from '../store/useMapStore'
import { useAssignmentStore } from './useAssignmentStore'

/**
 * Keeps `useAssignmentStore` in sync with its 3 sources of truth
 * (docs/feature/11-vehicle-assignment-engine.md, Decisión confirmada #3):
 * `vehicles` (`useVehiclesStore`), `assets`/`incidents` (already geo-tagged
 * and associated by `useMapStore`) and `zonesById` (`useZonesQuery`). Mirrors
 * the `useSyncMapStore` pattern — recomputes on every identity change of any
 * of them, including local mutations made from `/activos`/`/incidentes`/
 * `/vehiculos`.
 */
export function useSyncAssignmentStore(): void {
  const vehicles = useVehiclesStore((state) => state.vehicles)
  const assets = useMapStore((state) => state.assets)
  const incidents = useMapStore((state) => state.incidents)
  const recompute = useAssignmentStore((state) => state.recompute)
  const { data: zones } = useZonesQuery()

  const zonesById = useMemo(
    () => new Map((zones ?? []).map((zone) => [zone.id, zone.name])),
    [zones]
  )

  useEffect(() => {
    recompute(vehicles, assets, incidents, zonesById)
  }, [vehicles, assets, incidents, zonesById, recompute])
}
