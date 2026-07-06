import { describe, expect, it } from 'vitest'
import { reconcileAssignments } from './reconcileAssignments'
import type { Asset, Incident, Vehicle } from '../../types/domain.types'

const ACTIVE_VEHICLE: Vehicle = {
  id: 'v1',
  plate: 'ABC123',
  type: 'TRUCK',
  status: 'ACTIVE',
  capacity: 5000,
  zoneId: '1'
}

const OK_ASSET: Asset = {
  id: 'a1',
  type: 'CONTAINER',
  status: 'OK',
  lat: -34.6,
  lng: -58.38,
  address: 'Av. Corrientes 1',
  zoneId: '1'
}

const REPORTED_INCIDENT: Incident = {
  id: 'i1',
  type: 'OVERFLOW',
  status: 'REPORTED',
  description: 'x',
  lat: -34.6,
  lng: -58.38,
  zoneId: '1',
  createdAt: '2024-01-15T10:30:00Z'
}

describe('reconcileAssignments', () => {
  it('keeps a valid pair and reports changed=false', () => {
    const result = reconcileAssignments({
      assetToVehicle: { a1: 'v1' },
      incidentToVehicle: { i1: 'v1' },
      assets: [OK_ASSET],
      incidents: [REPORTED_INCIDENT],
      vehicles: [ACTIVE_VEHICLE]
    })

    expect(result.assetToVehicle).toEqual({ a1: 'v1' })
    expect(result.incidentToVehicle).toEqual({ i1: 'v1' })
    expect(result.changed).toBe(false)
  })

  it('drops an asset assignment when its vehicle is no longer ACTIVE', () => {
    const result = reconcileAssignments({
      assetToVehicle: { a1: 'v1' },
      incidentToVehicle: {},
      assets: [OK_ASSET],
      incidents: [],
      vehicles: [{ ...ACTIVE_VEHICLE, status: 'MAINTENANCE' }]
    })

    expect(result.assetToVehicle).toEqual({})
    expect(result.changed).toBe(true)
  })

  it('drops an asset assignment when the asset becomes OUT_OF_SERVICE', () => {
    const result = reconcileAssignments({
      assetToVehicle: { a1: 'v1' },
      incidentToVehicle: {},
      assets: [{ ...OK_ASSET, status: 'OUT_OF_SERVICE' }],
      incidents: [],
      vehicles: [ACTIVE_VEHICLE]
    })

    expect(result.assetToVehicle).toEqual({})
    expect(result.changed).toBe(true)
  })

  it('keeps an asset assignment when the asset is FULL', () => {
    const result = reconcileAssignments({
      assetToVehicle: { a1: 'v1' },
      incidentToVehicle: {},
      assets: [{ ...OK_ASSET, status: 'FULL' }],
      incidents: [],
      vehicles: [ACTIVE_VEHICLE]
    })

    expect(result.assetToVehicle).toEqual({ a1: 'v1' })
    expect(result.changed).toBe(false)
  })

  it('keeps an asset assignment when the asset is DAMAGED', () => {
    const result = reconcileAssignments({
      assetToVehicle: { a1: 'v1' },
      incidentToVehicle: {},
      assets: [{ ...OK_ASSET, status: 'DAMAGED' }],
      incidents: [],
      vehicles: [ACTIVE_VEHICLE]
    })

    expect(result.assetToVehicle).toEqual({ a1: 'v1' })
    expect(result.changed).toBe(false)
  })

  it('drops an incident assignment when the incident is no longer REPORTED', () => {
    const result = reconcileAssignments({
      assetToVehicle: {},
      incidentToVehicle: { i1: 'v1' },
      assets: [],
      incidents: [{ ...REPORTED_INCIDENT, status: 'RESOLVED' }],
      vehicles: [ACTIVE_VEHICLE]
    })

    expect(result.incidentToVehicle).toEqual({})
    expect(result.changed).toBe(true)
  })

  it('drops pairs whose entities were deleted', () => {
    const result = reconcileAssignments({
      assetToVehicle: { a1: 'v1' },
      incidentToVehicle: { i1: 'v1' },
      assets: [],
      incidents: [],
      vehicles: []
    })

    expect(result.assetToVehicle).toEqual({})
    expect(result.incidentToVehicle).toEqual({})
    expect(result.changed).toBe(true)
  })
})
