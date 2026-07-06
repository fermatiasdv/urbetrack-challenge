import { describe, expect, it } from 'vitest'
import type { Vehicle } from '../../../shared/types/domain.types'
import { zoneHasAvailableVehicle } from './zoneHasAvailableVehicle'

const zonesById = new Map([['z-microcentro', 'Microcentro']])

function vehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v-1',
    plate: 'AA123BB',
    type: 'TRUCK',
    status: 'ACTIVE',
    capacity: 5000,
    zoneId: 'z-microcentro',
    ...overrides
  }
}

describe('zoneHasAvailableVehicle', () => {
  it('returns true when the zone has an ACTIVE vehicle', () => {
    expect(zoneHasAvailableVehicle('MICROCENTRO', [vehicle()], zonesById)).toBe(true)
  })

  it('returns false when the zone has no vehicle at all', () => {
    expect(zoneHasAvailableVehicle('PALERMO', [vehicle()], zonesById)).toBe(false)
  })

  it('returns false when every vehicle in the zone is MAINTENANCE or OUT_OF_SERVICE', () => {
    const vehicles = [
      vehicle({ id: 'v-maintenance', status: 'MAINTENANCE' }),
      vehicle({ id: 'v-oos', status: 'OUT_OF_SERVICE' })
    ]

    expect(zoneHasAvailableVehicle('MICROCENTRO', vehicles, zonesById)).toBe(false)
  })

  it('is independent of pending incidents (decision #2, option (a))', () => {
    // No incidents/assignments parameter exists at all — the signature itself
    // proves the "no ACTIVE vehicle at all" semantics.
    expect(zoneHasAvailableVehicle.length).toBe(3)
  })
})
