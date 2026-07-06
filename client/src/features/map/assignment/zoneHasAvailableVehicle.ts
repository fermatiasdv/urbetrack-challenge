import type { SupportedZone, Vehicle } from '../../../shared/types/domain.types'
import { supportedZoneFromName } from '../../../shared/geo/supportedZoneFromName'
import { zoneNameFor } from '../../../shared/utils/zoneNameFor'

/**
 * Whether `zone` has at least one `ACTIVE` vehicle assigned to it (Decisión
 * confirmada #2 del spec, opción (a)): independiente de si hay incidentes
 * pendientes o no. Un vehículo `MAINTENANCE`/`OUT_OF_SERVICE` nunca cuenta,
 * aunque esté en la zona.
 *
 * Consumido, en el futuro, por `AvailabilityAlert`
 * (docs/feature/11-vehicle-assignment-engine.md) — una alerta por cada una de
 * las 5 zonas para la que esta función devuelva `false`.
 */
export function zoneHasAvailableVehicle(
  zone: SupportedZone,
  vehicles: Vehicle[],
  zonesById: Map<string, string>
): boolean {
  return vehicles.some(
    (vehicle) =>
      vehicle.status === 'ACTIVE' &&
      supportedZoneFromName(zoneNameFor(vehicle.zoneId, zonesById)) === zone
  )
}
