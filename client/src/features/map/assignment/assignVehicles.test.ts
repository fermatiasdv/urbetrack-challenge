import { describe, expect, it } from 'vitest'
import type { Vehicle } from '../../../shared/types/domain.types'
import type { AssociatedIncident, GeoTaggedAsset } from '../types'
import { assignVehicles } from './assignVehicles'

const zonesById = new Map([
  ['z-microcentro', 'Microcentro'],
  ['z-palermo', 'Palermo']
])

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

function asset(overrides: Partial<GeoTaggedAsset> = {}): GeoTaggedAsset {
  return {
    id: 'a-1',
    type: 'BIN',
    status: 'OK',
    lat: -34.605,
    lng: -58.375,
    address: 'Calle Falsa 123',
    zoneId: 'z-microcentro',
    derivedZone: 'MICROCENTRO',
    ...overrides
  }
}

function incident(overrides: Partial<AssociatedIncident> = {}): AssociatedIncident {
  return {
    id: 'i-1',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'desborde',
    lat: -34.605,
    lng: -58.375,
    zoneId: 'z-microcentro',
    createdAt: '2026-07-01T00:00:00.000Z',
    derivedZone: 'MICROCENTRO',
    associatedAssetId: 'a-1',
    ...overrides
  }
}

describe('assignVehicles', () => {
  it('CA-01: exclude vehicles that are MAINTENANCE or OUT_OF_SERVICE', () => {
    const vehicles = [
      vehicle({ id: 'v-maintenance', status: 'MAINTENANCE' }),
      vehicle({ id: 'v-oos', status: 'OUT_OF_SERVICE' })
    ]
    const assets = [asset()]
    const incidents = [incident()]

    expect(assignVehicles(vehicles, assets, incidents, zonesById)).toEqual([])
  })

  it('CA-02: an OUT_OF_SERVICE asset drops its associated incident from the process', () => {
    const vehicles = [vehicle()]
    const assets = [asset({ status: 'OUT_OF_SERVICE' })]
    const incidents = [incident()]

    expect(assignVehicles(vehicles, assets, incidents, zonesById)).toEqual([])
  })

  it('CA-03: respects the compatibility table exactly (PICKUP cannot carry BIN)', () => {
    const vehicles = [vehicle({ type: 'PICKUP', capacity: 1000 })]
    const assets = [asset({ type: 'BIN' })]
    const incidents = [incident()]

    expect(assignVehicles(vehicles, assets, incidents, zonesById)).toEqual([])
  })

  it('filters out a compatible vehicle without enough capacity for the asset type', () => {
    const vehicles = [vehicle({ type: 'VAN', capacity: 500 })]
    const assets = [asset({ type: 'BIN' })]
    const incidents = [incident()]

    expect(assignVehicles(vehicles, assets, incidents, zonesById)).toEqual([])
  })

  it('assigns an independent incident (no associated asset) with no type restriction', () => {
    const vehicles = [vehicle({ id: 'v-pickup', type: 'PICKUP', capacity: 1000 })]
    const assets: GeoTaggedAsset[] = []
    const incidents = [
      incident({
        id: 'i-independent',
        type: 'OTHER',
        associatedAssetId: null,
        derivedZone: 'MICROCENTRO'
      })
    ]

    expect(assignVehicles(vehicles, assets, incidents, zonesById)).toEqual([
      { incidentId: 'i-independent', assetId: 'i-independent', vehicleId: 'v-pickup' }
    ])
  })

  it('CA-04: prioritizes the vehicle in the same zone over one in a different zone', () => {
    const vehicles = [
      vehicle({ id: 'v-other-zone', zoneId: 'z-palermo', capacity: 5000 }),
      vehicle({ id: 'v-same-zone', zoneId: 'z-microcentro', capacity: 5000 })
    ]
    const assets = [asset()]
    const incidents = [incident()]

    expect(assignVehicles(vehicles, assets, incidents, zonesById)).toEqual([
      { incidentId: 'i-1', assetId: 'a-1', vehicleId: 'v-same-zone' }
    ])
  })

  it('CA-04: among same-zone candidates, picks the one with the least sufficient capacity', () => {
    const vehicles = [
      vehicle({ id: 'v-big', type: 'TRUCK', capacity: 5000, zoneId: 'z-microcentro' }),
      vehicle({ id: 'v-small', type: 'VAN', capacity: 1000, zoneId: 'z-microcentro' })
    ]
    const assets = [asset({ type: 'BIN' })]
    const incidents = [incident()]

    expect(assignVehicles(vehicles, assets, incidents, zonesById)).toEqual([
      { incidentId: 'i-1', assetId: 'a-1', vehicleId: 'v-small' }
    ])
  })

  it('CA-05: OVERFLOW is processed before OTHER when they compete for the same vehicle', () => {
    const vehicles = [
      vehicle({ id: 'v-only', type: 'VAN', capacity: 1000, zoneId: 'z-microcentro' })
    ]
    const assets = [
      asset({ id: 'a-overflow', type: 'BIN', zoneId: 'z-microcentro' }),
      asset({ id: 'a-other', type: 'BIN', zoneId: 'z-microcentro' })
    ]
    const incidents = [
      incident({
        id: 'i-other',
        type: 'OTHER',
        associatedAssetId: 'a-other',
        derivedZone: 'MICROCENTRO'
      }),
      incident({
        id: 'i-overflow',
        type: 'OVERFLOW',
        associatedAssetId: 'a-overflow',
        derivedZone: 'MICROCENTRO'
      })
    ]

    const result = assignVehicles(vehicles, assets, incidents, zonesById)

    expect(result).toEqual([
      { incidentId: 'i-overflow', assetId: 'a-overflow', vehicleId: 'v-only' }
    ])
  })

  it('removes an assigned vehicle from the pool for the rest of the pass', () => {
    const vehicles = [
      vehicle({ id: 'v-only', type: 'TRUCK', capacity: 5000, zoneId: 'z-microcentro' })
    ]
    const assets = [
      asset({ id: 'a-1', type: 'BENCH', zoneId: 'z-microcentro' }),
      asset({ id: 'a-2', type: 'BENCH', zoneId: 'z-microcentro' })
    ]
    const incidents = [
      incident({ id: 'i-1', type: 'OVERFLOW', associatedAssetId: 'a-1' }),
      incident({ id: 'i-2', type: 'DAMAGE', associatedAssetId: 'a-2' })
    ]

    expect(assignVehicles(vehicles, assets, incidents, zonesById)).toEqual([
      { incidentId: 'i-1', assetId: 'a-1', vehicleId: 'v-only' }
    ])
  })
})
