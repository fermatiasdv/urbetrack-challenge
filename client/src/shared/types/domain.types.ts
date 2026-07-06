/**
 * Vehicle domain types (client-side), mirrored from the mock backend
 * (`api/src/types/index.ts`, `api/src/schemas/vehicle.schema.ts`).
 * See docs/feature/02-vehicle-statuscard.md.
 */
export type VehicleType = 'TRUCK' | 'VAN' | 'PICKUP'

export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'

export interface Vehicle {
  id: string
  plate: string
  type: VehicleType
  status: VehicleStatus
  capacity: number
  zoneId: string
}

/**
 * Zone domain type (client-side), mirrored from the mock backend
 * (`api/src/data/zones.ts`). See docs/verified-scope.md §2.1.
 */
export interface Zone {
  id: string
  name: string
}
