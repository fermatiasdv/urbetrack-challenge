import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useFilteredVehicles } from './useFilteredVehicles'
import { useVehiclesStore } from '../store/useVehiclesStore'
import { useVehicleFiltersStore } from '../store/useVehicleFiltersStore'
import { DEFAULT_VEHICLE_FILTERS } from '../utils/vehicleFilters'
import type { Vehicle } from '../../../shared/types/domain.types'

const TRUCK_VEHICLE: Vehicle = {
  id: '1',
  plate: 'ABC123',
  type: 'TRUCK',
  status: 'ACTIVE',
  capacity: 5000,
  zoneId: '1'
}
const VAN_VEHICLE: Vehicle = {
  id: '2',
  plate: 'DEF456',
  type: 'VAN',
  status: 'MAINTENANCE',
  capacity: 2000,
  zoneId: '2'
}

const VEHICLES: Vehicle[] = [TRUCK_VEHICLE, VAN_VEHICLE]

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: VEHICLES, hasHydrated: true })
  useVehicleFiltersStore.setState(DEFAULT_VEHICLE_FILTERS)
})

describe('useFilteredVehicles', () => {
  it('returns every vehicle when filters are the defaults', () => {
    const { result } = renderHook(() => useFilteredVehicles())

    expect(result.current).toEqual(VEHICLES)
  })

  it('reflects the current filters from useVehicleFiltersStore', () => {
    useVehicleFiltersStore.getState().setType('VAN')

    const { result } = renderHook(() => useFilteredVehicles())

    expect(result.current).toEqual([VAN_VEHICLE])
  })

  it('updates when the filters store changes after the initial render', () => {
    const { result } = renderHook(() => useFilteredVehicles())
    expect(result.current).toEqual(VEHICLES)

    act(() => {
      useVehicleFiltersStore.getState().setStatus('MAINTENANCE')
    })

    expect(result.current).toEqual([VAN_VEHICLE])
  })
})
