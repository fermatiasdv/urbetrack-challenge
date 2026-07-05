export type VehicleType = 'TRUCK' | 'VAN' | 'PICKUP'

export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'

export interface RawVehicle {
  id: string
  type: VehicleType
  plate: string
  status: VehicleStatus
  zoneId: string
  lat: number
  lng: number
}

export interface VehicleRow extends RawVehicle {
  zoneName: string
}

/** Subset of backend zones (see api/src/data/zones.ts). */
export const ZONES: Record<string, string> = {
  '1': 'Microcentro',
  '2': 'Palermo',
  '3': 'Recoleta',
  '4': 'Belgrano',
  '5': 'Caballito'
}

export function zoneNameFor(zoneId: string): string {
  return ZONES[zoneId] ?? zoneId
}
