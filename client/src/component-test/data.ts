import type { RawVehicle } from './types'

/** Exactly two fake vehicles, per spec §4. */
export const FAKE_VEHICLES: RawVehicle[] = [
  {
    id: '1',
    type: 'TRUCK',
    plate: 'ABC123',
    status: 'ACTIVE',
    zoneId: '1',
    lat: -34.61361,
    lng: -58.42566
  },
  {
    id: '2',
    type: 'VAN',
    plate: 'DEF456',
    status: 'MAINTENANCE',
    zoneId: '2',
    lat: -34.6061,
    lng: -58.4354
  }
]

export const FETCH_DELAY_MS = 1200

/** Simulates an async fetch of the fake vehicles, resolving after FETCH_DELAY_MS. */
export function fetchVehicles(): Promise<RawVehicle[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(FAKE_VEHICLES), FETCH_DELAY_MS)
  })
}
