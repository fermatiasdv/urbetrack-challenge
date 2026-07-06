import type { SupportedZone, Vehicle } from '../../../shared/types/domain.types'
import { supportedZoneFromName } from '../../../shared/geo/supportedZoneFromName'
import { zoneNameFor } from '../../../shared/utils/zoneNameFor'
import type { AssociatedIncident, GeoTaggedAsset } from '../types'
import { INCIDENT_TYPE_PRIORITY } from './incidentTypePriority'
import { hasSufficientCapacity, isVehicleCompatibleWithAsset } from './vehicleCompatibility'

export interface Assignment {
  incidentId: string
  assetId: string
  vehicleId: string
}

/**
 * Motor automático de asignación vehículo↔activo/incidente
 * (docs/feature/11-vehicle-assignment-engine.md). Para cada incidente
 * (procesados por prioridad de contención), resuelve un único vehículo:
 *
 * 1. Excluye vehículos `MAINTENANCE`/`OUT_OF_SERVICE` (CA-01) y descarta los
 *    incidentes cuyo activo asociado esté `OUT_OF_SERVICE` (CA-02).
 * 2. Ordena incidentes por `INCIDENT_TYPE_PRIORITY` (CA-05): un vehículo ya
 *    asignado a un incidente de mayor prioridad sale del pool para el resto
 *    de la pasada (contención).
 * 3. Determina los candidatos: si el incidente tiene activo asociado, se
 *    filtran por `VEHICLE_ASSET_COMPATIBILITY` + `ASSET_MIN_CAPACITY` contra
 *    el tipo de ese activo, y la zona objetivo es su `derivedZone`. Si no
 *    tiene activo asociado (incidente independiente), cualquier vehículo del
 *    pool es candidato y la zona objetivo es la `derivedZone` del incidente.
 * 4. Entre candidatos, prioriza `ACTIVE` > misma zona > menor capacidad
 *    (CA-04) y asigna el primero, removiéndolo del pool.
 */
export function assignVehicles(
  vehicles: Vehicle[],
  assets: GeoTaggedAsset[],
  incidents: AssociatedIncident[],
  zonesById: Map<string, string>
): Assignment[] {
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]))
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status !== 'MAINTENANCE' && vehicle.status !== 'OUT_OF_SERVICE'
  )
  const pool = new Set(availableVehicles.map((vehicle) => vehicle.id))

  const orderedIncidents = [...incidents].sort(
    (a, b) => INCIDENT_TYPE_PRIORITY[a.type] - INCIDENT_TYPE_PRIORITY[b.type]
  )

  const assignments: Assignment[] = []

  for (const incident of orderedIncidents) {
    const resolved = resolveTarget(incident, assetsById)
    if (resolved === null) {
      continue
    }

    const candidates = availableVehicles.filter(
      (vehicle) => pool.has(vehicle.id) && resolved.isCompatible(vehicle)
    )
    if (candidates.length === 0) {
      continue
    }

    const [best] = [...candidates].sort((a, b) => compareCandidates(a, b, resolved.zone, zonesById))
    if (!best) {
      continue
    }

    assignments.push({ incidentId: incident.id, assetId: resolved.assetId, vehicleId: best.id })
    pool.delete(best.id)
  }

  return assignments
}

interface ResolvedTarget {
  assetId: string
  zone: SupportedZone
  isCompatible: (vehicle: Vehicle) => boolean
}

/**
 * Resolves what an incident needs a vehicle for. Returns `null` when the
 * incident must be skipped entirely (its associated asset is `OUT_OF_SERVICE`,
 * CA-02) — as opposed to an incident with no associated asset at all, which
 * is still assignable without a type/capacity restriction.
 */
function resolveTarget(
  incident: AssociatedIncident,
  assetsById: Map<string, GeoTaggedAsset>
): ResolvedTarget | null {
  if (incident.associatedAssetId === null) {
    return {
      assetId: incident.id,
      zone: incident.derivedZone,
      isCompatible: () => true
    }
  }

  const asset = assetsById.get(incident.associatedAssetId)
  if (!asset || asset.status === 'OUT_OF_SERVICE') {
    return null
  }

  return {
    assetId: asset.id,
    zone: asset.derivedZone,
    isCompatible: (vehicle) =>
      isVehicleCompatibleWithAsset(vehicle.type, asset.type) &&
      hasSufficientCapacity(vehicle.capacity, asset.type)
  }
}

function compareCandidates(
  a: Vehicle,
  b: Vehicle,
  targetZone: SupportedZone,
  zonesById: Map<string, string>
): number {
  const activeDiff = Number(b.status === 'ACTIVE') - Number(a.status === 'ACTIVE')
  if (activeDiff !== 0) {
    return activeDiff
  }

  const zoneDiff =
    Number(isInZone(b, targetZone, zonesById)) - Number(isInZone(a, targetZone, zonesById))
  if (zoneDiff !== 0) {
    return zoneDiff
  }

  return a.capacity - b.capacity
}

function isInZone(
  vehicle: Vehicle,
  targetZone: SupportedZone,
  zonesById: Map<string, string>
): boolean {
  return supportedZoneFromName(zoneNameFor(vehicle.zoneId, zonesById)) === targetZone
}
