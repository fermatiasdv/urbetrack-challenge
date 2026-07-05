export type AssetStatus = 'OK' | 'DAMAGED' | 'FULL' | 'OUT_OF_SERVICE'
export type AssetType = 'BIN' | 'CONTAINER' | 'BENCH'
export type IncidentStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED'
export type IncidentType = 'OVERFLOW' | 'DAMAGE' | 'LITTERING' | 'OTHER'
export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'
export type VehicleType = 'TRUCK' | 'VAN' | 'PICKUP'

export interface UrbanAsset {
  id: string
  type: AssetType
  status: AssetStatus
  lat: number
  lng: number
  address: string
  zoneId: string
}

export interface Zone {
  id: string
  name: string
}

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

export interface Vehicle {
  id: string
  plate: string
  type: VehicleType
  status: VehicleStatus
  capacity: number
  zoneId: string
}
