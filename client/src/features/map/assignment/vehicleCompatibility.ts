import type { AssetType, VehicleType } from '../../../shared/types/domain.types'

/**
 * Motor automático de asignación (docs/feature/11-vehicle-assignment-engine.md
 * §"Compatibilidad vehículo → tipo de activo"). Matriz **acumulativa**: cada
 * tipo de vehículo puede operar 1 o más tipos de activo. No confundir con
 * `VEHICLE_ASSET_COMPAT` de `docs/feature/maps-asign-vehicle.md`
 * (`features/map/utils/vehicleEligibility.ts`), que es 1 a 1 y pertenece a la
 * asignación manual — son dos reglas de negocio independientes.
 */
export const VEHICLE_ASSET_COMPATIBILITY: Record<VehicleType, AssetType[]> = {
  PICKUP: ['BENCH'],
  VAN: ['BENCH', 'BIN'],
  TRUCK: ['BENCH', 'BIN', 'CONTAINER']
}

/**
 * Capacidad mínima (kg) que un vehículo necesita para resolver un incidente
 * asociado a un activo del `AssetType` dado (Decisión confirmada #1 del spec).
 * Alineada 1:1 a la tabla de compatibilidad: `BENCH` no exige mínimo (todos
 * los vehículos compatibles alcanzan), `BIN` exige lo que un `VAN` carga como
 * mínimo (1000kg), `CONTAINER` lo que un `TRUCK` necesita para no quedar por
 * debajo del resto de la flota (2000kg).
 */
export const ASSET_MIN_CAPACITY: Record<AssetType, number> = {
  BENCH: 0,
  BIN: 1000,
  CONTAINER: 2000
}

export function isVehicleCompatibleWithAsset(
  vehicleType: VehicleType,
  assetType: AssetType
): boolean {
  return VEHICLE_ASSET_COMPATIBILITY[vehicleType].includes(assetType)
}

export function hasSufficientCapacity(vehicleCapacity: number, assetType: AssetType): boolean {
  return vehicleCapacity >= ASSET_MIN_CAPACITY[assetType]
}
