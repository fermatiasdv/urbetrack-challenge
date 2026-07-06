import { beforeEach, describe, expect, it } from 'vitest'
import { useVehicleFiltersStore } from './useVehicleFiltersStore'
import { DEFAULT_VEHICLE_FILTERS } from '../utils/vehicleFilters'

beforeEach(() => {
  useVehicleFiltersStore.setState(DEFAULT_VEHICLE_FILTERS)
})

describe('useVehicleFiltersStore', () => {
  it('starts with the default filters', () => {
    expect(useVehicleFiltersStore.getState()).toMatchObject(DEFAULT_VEHICLE_FILTERS)
  })

  it('setPlate updates only the plate filter', () => {
    useVehicleFiltersStore.getState().setPlate('ABC')

    expect(useVehicleFiltersStore.getState().plate).toBe('ABC')
    expect(useVehicleFiltersStore.getState().type).toBe('ALL')
  })

  it('setType updates only the type filter', () => {
    useVehicleFiltersStore.getState().setType('TRUCK')

    expect(useVehicleFiltersStore.getState().type).toBe('TRUCK')
  })

  it('setCapacity updates only the capacity filter', () => {
    useVehicleFiltersStore.getState().setCapacity('GT_2000')

    expect(useVehicleFiltersStore.getState().capacity).toBe('GT_2000')
  })

  it('setStatus updates only the status filter', () => {
    useVehicleFiltersStore.getState().setStatus('MAINTENANCE')

    expect(useVehicleFiltersStore.getState().status).toBe('MAINTENANCE')
  })

  it('setZoneIds updates only the zoneIds filter', () => {
    useVehicleFiltersStore.getState().setZoneIds(['1', '2'])

    expect(useVehicleFiltersStore.getState().zoneIds).toEqual(['1', '2'])
  })

  it('reset restores every field to its default, discarding all prior changes', () => {
    const state = useVehicleFiltersStore.getState()
    state.setPlate('ABC')
    state.setType('VAN')
    state.setCapacity('LTE_1000')
    state.setStatus('ACTIVE')
    state.setZoneIds(['1'])

    useVehicleFiltersStore.getState().reset()

    expect(useVehicleFiltersStore.getState()).toMatchObject(DEFAULT_VEHICLE_FILTERS)
  })
})
