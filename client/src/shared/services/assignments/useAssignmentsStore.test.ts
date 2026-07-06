import { beforeEach, describe, expect, it } from 'vitest'
import { useAssignmentsStore } from './useAssignmentsStore'

describe('useAssignmentsStore', () => {
  beforeEach(() => {
    useAssignmentsStore.setState({ assetToVehicle: {}, incidentToVehicle: {} })
  })

  it('assigns and clears an asset vehicle', () => {
    useAssignmentsStore.getState().assignAssetVehicle('a1', 'v1')
    expect(useAssignmentsStore.getState().assetToVehicle).toEqual({ a1: 'v1' })

    useAssignmentsStore.getState().clearAssetVehicle('a1')
    expect(useAssignmentsStore.getState().assetToVehicle).toEqual({})
  })

  it('assigns and clears an incident vehicle independently of assets', () => {
    useAssignmentsStore.getState().assignIncidentVehicle('i1', 'v2')
    useAssignmentsStore.getState().assignAssetVehicle('a1', 'v1')

    expect(useAssignmentsStore.getState().incidentToVehicle).toEqual({ i1: 'v2' })
    expect(useAssignmentsStore.getState().assetToVehicle).toEqual({ a1: 'v1' })

    useAssignmentsStore.getState().clearIncidentVehicle('i1')
    expect(useAssignmentsStore.getState().incidentToVehicle).toEqual({})
    expect(useAssignmentsStore.getState().assetToVehicle).toEqual({ a1: 'v1' })
  })

  it('reassigning overwrites the previous vehicle (single vehicle per entity)', () => {
    useAssignmentsStore.getState().assignAssetVehicle('a1', 'v1')
    useAssignmentsStore.getState().assignAssetVehicle('a1', 'v2')
    expect(useAssignmentsStore.getState().assetToVehicle).toEqual({ a1: 'v2' })
  })

  it('setAll replaces both maps', () => {
    useAssignmentsStore.getState().setAll({
      assetToVehicle: { a9: 'v9' },
      incidentToVehicle: { i9: 'v9' }
    })
    expect(useAssignmentsStore.getState().assetToVehicle).toEqual({ a9: 'v9' })
    expect(useAssignmentsStore.getState().incidentToVehicle).toEqual({ i9: 'v9' })
  })
})
