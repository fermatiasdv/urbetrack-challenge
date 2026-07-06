import type { IncidentType } from '../../../shared/types/domain.types'

/**
 * Prioridad de contención entre tipos de incidente
 * (docs/feature/11-vehicle-assignment-engine.md §"Prioridad entre tipos de
 * incidente"). Menor número = mayor prioridad: se procesan en el orden
 * `OVERFLOW > DAMAGE > LITTERING > OTHER`, de forma que un vehículo ya
 * asignado a un incidente de mayor prioridad deja de estar disponible para
 * los de menor prioridad en la misma pasada de `assignVehicles`.
 */
export const INCIDENT_TYPE_PRIORITY: Record<IncidentType, number> = {
  OVERFLOW: 0,
  DAMAGE: 1,
  LITTERING: 2,
  OTHER: 3
}

export function compareIncidentPriority(a: IncidentType, b: IncidentType): number {
  return INCIDENT_TYPE_PRIORITY[a] - INCIDENT_TYPE_PRIORITY[b]
}
