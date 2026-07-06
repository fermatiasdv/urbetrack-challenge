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

/**
 * Rectangular geographic boundary, expressed as inclusive lat/lng limits.
 * See docs/specs/geo-zone-derivation.md (MAP-00).
 */
export interface BoundingBox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

/**
 * The 5 zones geographically supported by the system. Distinct from `Zone`
 * (the backend resource `{ id, name }`): a point's real-world zone is derived
 * exclusively from its coordinates against `shared/geo/zones.ts`, never from
 * the backend's `zoneId` (docs/verified-scope.md §10.5,
 * docs/specs/geo-zone-derivation.md).
 */
export type SupportedZone = 'MICROCENTRO' | 'PALERMO' | 'RECOLETA' | 'BELGRANO' | 'CABALLITO'

/**
 * Asset domain types (client-side), mirrored from the mock backend
 * (`api/src/schemas/asset.schema.ts`). See docs/verified-scope.md §2.3 and
 * docs/feature/07-assets-page.md.
 */
export type AssetType = 'BIN' | 'CONTAINER' | 'BENCH'

export type AssetStatus = 'OK' | 'DAMAGED' | 'FULL' | 'OUT_OF_SERVICE'

export interface Asset {
  id: string
  type: AssetType
  status: AssetStatus
  lat: number
  lng: number
  address: string
  zoneId: string
}

/**
 * Incident domain types (client-side), mirrored from the mock backend
 * (`api/src/schemas/incident.schema.ts`, `api/src/data/incidents.ts`).
 * See docs/feature/08-incidents-page.md.
 */
export type IncidentType = 'OVERFLOW' | 'DAMAGE' | 'LITTERING' | 'OTHER'

export type IncidentStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED'

export interface Incident {
  id: string
  type: IncidentType
  status: IncidentStatus
  description: string
  lat: number
  lng: number
  zoneId: string
  createdAt: string
}
