import type { AssetType, Vehicle, VehicleType } from '../../../shared/types/domain.types'
import { supportedZoneFromName } from '../../../shared/geo/supportedZoneFromName'
import { zoneNameFor } from '../../../shared/utils/zoneNameFor'
import type { AssociatedIncident, GeoTaggedAsset } from '../types'

/**
 * Manual-assignment compatibility matrix (docs/feature/maps-asign-vehicle.md
 * §"Compatibilidad por tipo") — strictly **1 to 1**, each vehicle type carries
 * exactly one asset type. Not to be confused with the *cumulative* matrix of
 * the automatic engine in docs/feature/11-vehicle-assignment-engine.md.
 */
export const VEHICLE_ASSET_COMPAT: Record<VehicleType, AssetType> = {
  TRUCK: 'CONTAINER',
  VAN: 'BIN',
  PICKUP: 'BENCH'
}

export function vehicleCanCarry(vehicleType: VehicleType, assetType: AssetType): boolean {
  return VEHICLE_ASSET_COMPAT[vehicleType] === assetType
}

function isActiveInZone(
  vehicle: Vehicle,
  targetZone: GeoTaggedAsset['derivedZone'],
  zonesById: Map<string, string>
): boolean {
  if (vehicle.status !== 'ACTIVE') {
    return false
  }
  return supportedZoneFromName(zoneNameFor(vehicle.zoneId, zonesById)) === targetZone
}

/**
 * Vehicles that can be manually assigned to `asset`: `ACTIVE`, in the asset's
 * derived zone, and compatible with the asset's type
 * (docs/feature/maps-asign-vehicle.md §"Vehículos elegibles"). Capacity is not
 * considered (unlimited assignments per vehicle).
 */
export function eligibleVehiclesForAsset(
  asset: GeoTaggedAsset,
  vehicles: Vehicle[],
  zonesById: Map<string, string>
): Vehicle[] {
  return vehicles.filter(
    (vehicle) =>
      isActiveInZone(vehicle, asset.derivedZone, zonesById) &&
      vehicleCanCarry(vehicle.type, asset.type)
  )
}

/**
 * Vehicles that can be manually assigned to `incident`. Type compatibility is
 * evaluated against the incident's **associated asset** (same matrix); an
 * independent incident (`associatedAsset === null`) has no type restriction —
 * any `ACTIVE` vehicle in its zone qualifies
 * (docs/feature/maps-asign-vehicle.md §"Compatibilidad por tipo").
 */
export function eligibleVehiclesForIncident(
  incident: AssociatedIncident,
  associatedAsset: GeoTaggedAsset | null,
  vehicles: Vehicle[],
  zonesById: Map<string, string>
): Vehicle[] {
  return vehicles.filter((vehicle) => {
    if (!isActiveInZone(vehicle, incident.derivedZone, zonesById)) {
      return false
    }
    if (associatedAsset === null) {
      return true
    }
    return vehicleCanCarry(vehicle.type, associatedAsset.type)
  })
}
