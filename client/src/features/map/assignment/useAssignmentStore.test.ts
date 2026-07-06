import { beforeEach, describe, expect, it } from 'vitest'
import type { Vehicle } from '../../../shared/types/domain.types'
import type { AssociatedIncident, GeoTaggedAsset } from '../types'
import { useAssignmentStore } from './useAssignmentStore'

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

function asset(overrides: Partial<GeoTaggedAsset> = {}): GeoTaggedAsset {
  return {
    id: 'a-1',
    type: 'BENCH',
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

describe('useAssignmentStore', () => {
  beforeEach(() => {
    useAssignmentStore.setState({
      assignments: [],
      zoneAvailability: {
        MICROCENTRO: false,
        PALERMO: false,
        RECOLETA: false,
        BELGRANO: false,
        CABALLITO: false
      }
    })
  })

  it('starts with no assignments and every zone unavailable', () => {
    const state = useAssignmentStore.getState()
    expect(state.assignments).toEqual([])
    expect(Object.values(state.zoneAvailability).every((value) => value === false)).toBe(true)
  })

  it('recompute populates assignments and zoneAvailability for all 5 zones', () => {
    useAssignmentStore.getState().recompute([vehicle()], [asset()], [incident()], zonesById)

    const state = useAssignmentStore.getState()
    expect(state.assignments).toEqual([{ incidentId: 'i-1', assetId: 'a-1', vehicleId: 'v-1' }])
    expect(Object.keys(state.zoneAvailability).sort()).toEqual(
      ['BELGRANO', 'CABALLITO', 'MICROCENTRO', 'PALERMO', 'RECOLETA'].sort()
    )
    expect(state.zoneAvailability.MICROCENTRO).toBe(true)
    expect(state.zoneAvailability.PALERMO).toBe(false)
  })

  it('recompute with no vehicles leaves every zone unavailable', () => {
    useAssignmentStore.getState().recompute([], [asset()], [incident()], zonesById)

    const state = useAssignmentStore.getState()
    expect(state.assignments).toEqual([])
    expect(Object.values(state.zoneAvailability).every((value) => value === false)).toBe(true)
  })
})
