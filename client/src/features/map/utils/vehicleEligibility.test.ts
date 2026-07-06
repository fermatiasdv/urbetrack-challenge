import { describe, expect, it } from 'vitest'
import {
  eligibleVehiclesForAsset,
  eligibleVehiclesForIncident,
  vehicleCanCarry
} from './vehicleEligibility'
import type { Vehicle } from '../../../shared/types/domain.types'
import type { AssociatedIncident, GeoTaggedAsset } from '../types'

// zoneId '1' -> 'Microcentro' -> MICROCENTRO
const ZONES_BY_ID = new Map([
  ['1', 'Microcentro'],
  ['2', 'Palermo']
])

const CONTAINER_ASSET: GeoTaggedAsset = {
  id: 'a1',
  type: 'CONTAINER',
  status: 'OK',
  lat: -34.6,
  lng: -58.38,
  address: 'x',
  zoneId: '1',
  derivedZone: 'MICROCENTRO'
}

function vehicle(overrides: Partial<Vehicle>): Vehicle {
  return {
    id: 'v',
    plate: 'AAA111',
    type: 'TRUCK',
    status: 'ACTIVE',
    capacity: 1000,
    zoneId: '1',
    ...overrides
  }
}

describe('vehicleCanCarry', () => {
  it('is 1-to-1: TRUCK↔CONTAINER, VAN↔BIN, PICKUP↔BENCH', () => {
    expect(vehicleCanCarry('TRUCK', 'CONTAINER')).toBe(true)
    expect(vehicleCanCarry('VAN', 'BIN')).toBe(true)
    expect(vehicleCanCarry('PICKUP', 'BENCH')).toBe(true)
    expect(vehicleCanCarry('TRUCK', 'BIN')).toBe(false)
    expect(vehicleCanCarry('VAN', 'CONTAINER')).toBe(false)
  })
})

describe('eligibleVehiclesForAsset', () => {
  it('keeps only ACTIVE, same-zone, type-compatible vehicles', () => {
    const vehicles: Vehicle[] = [
      vehicle({ id: 'ok' }), // TRUCK, ACTIVE, zona 1 -> compatible con CONTAINER
      vehicle({ id: 'maint', status: 'MAINTENANCE' }), // fuera por estado
      vehicle({ id: 'otherZone', zoneId: '2' }), // fuera por zona
      vehicle({ id: 'wrongType', type: 'VAN' }) // fuera por tipo (VAN->BIN)
    ]

    const result = eligibleVehiclesForAsset(CONTAINER_ASSET, vehicles, ZONES_BY_ID)

    expect(result.map((v) => v.id)).toEqual(['ok'])
  })
})

describe('eligibleVehiclesForIncident', () => {
  const incident: AssociatedIncident = {
    id: 'i1',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'x',
    lat: -34.6,
    lng: -58.38,
    zoneId: '1',
    createdAt: '2024-01-15T10:30:00Z',
    derivedZone: 'MICROCENTRO',
    associatedAssetId: 'a1'
  }

  it('uses the associated asset type for compatibility', () => {
    const vehicles: Vehicle[] = [vehicle({ id: 'truck' }), vehicle({ id: 'van', type: 'VAN' })]

    const result = eligibleVehiclesForIncident(incident, CONTAINER_ASSET, vehicles, ZONES_BY_ID)

    expect(result.map((v) => v.id)).toEqual(['truck'])
  })

  it('has no type restriction for an independent incident, only ACTIVE + zone', () => {
    const independent: AssociatedIncident = { ...incident, associatedAssetId: null }
    const vehicles: Vehicle[] = [
      vehicle({ id: 'truck' }),
      vehicle({ id: 'van', type: 'VAN' }),
      vehicle({ id: 'otherZone', zoneId: '2' })
    ]

    const result = eligibleVehiclesForIncident(independent, null, vehicles, ZONES_BY_ID)

    expect(result.map((v) => v.id)).toEqual(['truck', 'van'])
  })
})
