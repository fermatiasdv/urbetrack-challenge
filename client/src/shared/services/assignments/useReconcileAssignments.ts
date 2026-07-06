import { useEffect } from 'react'
import { useAssetsStore } from '../assets/useAssetsStore'
import { useIncidentsStore } from '../incidents/useIncidentsStore'
import { useVehiclesStore } from '../../../features/vehicles/store/useVehiclesStore'
import { reconcileAssignments } from './reconcileAssignments'
import { useAssignmentsStore } from './useAssignmentsStore'

/**
 * Keeps `useAssignmentsStore` free of stale pairs. Subscribed to the shared
 * `assets`/`incidents`/`vehicles` stores, it re-runs `reconcileAssignments`
 * whenever any of them (or the assignments themselves) change, and writes back
 * only when something was actually pruned (`changed`), so it never loops.
 *
 * Mounted **once in `AppLayout`** — the only component present on every route —
 * so the auto-unassign rule (docs/feature/maps-asign-vehicle.md
 * §"Desasignación automática") also fires for changes made outside the map,
 * e.g. sending a vehicle to `MAINTENANCE` from `/vehiculos`.
 */
export function useReconcileAssignments(): void {
  const assets = useAssetsStore((state) => state.assets)
  const incidents = useIncidentsStore((state) => state.incidents)
  const vehicles = useVehiclesStore((state) => state.vehicles)
  const assetToVehicle = useAssignmentsStore((state) => state.assetToVehicle)
  const incidentToVehicle = useAssignmentsStore((state) => state.incidentToVehicle)
  const setAll = useAssignmentsStore((state) => state.setAll)

  useEffect(() => {
    const result = reconcileAssignments({
      assetToVehicle,
      incidentToVehicle,
      assets,
      incidents,
      vehicles
    })
    if (result.changed) {
      setAll({
        assetToVehicle: result.assetToVehicle,
        incidentToVehicle: result.incidentToVehicle
      })
    }
  }, [assets, incidents, vehicles, assetToVehicle, incidentToVehicle, setAll])
}
