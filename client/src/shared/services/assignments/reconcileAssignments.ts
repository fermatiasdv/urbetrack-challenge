import type { Asset, Incident, Vehicle } from '../../types/domain.types'

export interface ReconcileInput {
  assetToVehicle: Record<string, string>
  incidentToVehicle: Record<string, string>
  assets: Asset[]
  incidents: Incident[]
  vehicles: Vehicle[]
}

export interface ReconcileResult {
  assetToVehicle: Record<string, string>
  incidentToVehicle: Record<string, string>
  changed: boolean
}

/**
 * Prunes assignments that are no longer valid (docs/feature/maps-asign-vehicle.md
 * §"Desasignación automática"). A pair is kept only when **both** ends are still
 * eligible:
 *
 * - the vehicle exists and is `ACTIVE`, and
 * - the asset exists and is `OK` (resp. the incident exists and is `REPORTED`).
 *
 * Any other transition — vehicle to `MAINTENANCE`/`OUT_OF_SERVICE`, asset off
 * `OK`, incident off `REPORTED`, or any of the three deleted — drops the pair.
 * This is a real removal, not a read-time filter: re-activating the vehicle
 * later does not resurrect the assignment.
 *
 * `changed` is `false` when nothing was pruned, so the caller can skip the
 * `set` (and the re-render / effect re-run it would cause).
 */
export function reconcileAssignments(input: ReconcileInput): ReconcileResult {
  const activeVehicleIds = new Set(
    input.vehicles.filter((vehicle) => vehicle.status === 'ACTIVE').map((vehicle) => vehicle.id)
  )
  const okAssetIds = new Set(
    input.assets.filter((asset) => asset.status === 'OK').map((asset) => asset.id)
  )
  const reportedIncidentIds = new Set(
    input.incidents
      .filter((incident) => incident.status === 'REPORTED')
      .map((incident) => incident.id)
  )

  const nextAssetToVehicle = pruneMap(
    input.assetToVehicle,
    (assetId, vehicleId) => okAssetIds.has(assetId) && activeVehicleIds.has(vehicleId)
  )
  const nextIncidentToVehicle = pruneMap(
    input.incidentToVehicle,
    (incidentId, vehicleId) =>
      reportedIncidentIds.has(incidentId) && activeVehicleIds.has(vehicleId)
  )

  const changed =
    countKeys(nextAssetToVehicle) !== countKeys(input.assetToVehicle) ||
    countKeys(nextIncidentToVehicle) !== countKeys(input.incidentToVehicle)

  return { assetToVehicle: nextAssetToVehicle, incidentToVehicle: nextIncidentToVehicle, changed }
}

function pruneMap(
  map: Record<string, string>,
  keep: (entityId: string, vehicleId: string) => boolean
): Record<string, string> {
  const next: Record<string, string> = {}
  for (const [entityId, vehicleId] of Object.entries(map)) {
    if (keep(entityId, vehicleId)) {
      next[entityId] = vehicleId
    }
  }
  return next
}

function countKeys(map: Record<string, string>): number {
  return Object.keys(map).length
}
