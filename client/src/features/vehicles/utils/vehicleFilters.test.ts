import { describe, expect, it } from 'vitest'
import {
  DEFAULT_VEHICLE_FILTERS,
  filterVehicles,
  matchesCapacityFilter,
  type VehicleFilters
} from './vehicleFilters'
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
const PICKUP_VEHICLE: Vehicle = {
  id: '3',
  plate: 'GHI789',
  type: 'PICKUP',
  status: 'OUT_OF_SERVICE',
  capacity: 1000,
  zoneId: '3'
}

const VEHICLES: Vehicle[] = [TRUCK_VEHICLE, VAN_VEHICLE, PICKUP_VEHICLE]

describe('matchesCapacityFilter', () => {
  it('matches every capacity when the filter is ALL', () => {
    expect(matchesCapacityFilter(1, 'ALL')).toBe(true)
    expect(matchesCapacityFilter(999999, 'ALL')).toBe(true)
  })

  it('LTE_1000 includes the Pickup ceiling (1000) and excludes 1001', () => {
    expect(matchesCapacityFilter(1000, 'LTE_1000')).toBe(true)
    expect(matchesCapacityFilter(999, 'LTE_1000')).toBe(true)
    expect(matchesCapacityFilter(1001, 'LTE_1000')).toBe(false)
  })

  it('BETWEEN_1000_2000 excludes 1000 (belongs to LTE_1000) and includes the Van ceiling (2000)', () => {
    expect(matchesCapacityFilter(1000, 'BETWEEN_1000_2000')).toBe(false)
    expect(matchesCapacityFilter(1001, 'BETWEEN_1000_2000')).toBe(true)
    expect(matchesCapacityFilter(2000, 'BETWEEN_1000_2000')).toBe(true)
    expect(matchesCapacityFilter(2001, 'BETWEEN_1000_2000')).toBe(false)
  })

  it('GT_2000 excludes 2000 (belongs to BETWEEN_1000_2000) and includes Truck capacities up to 5000', () => {
    expect(matchesCapacityFilter(2000, 'GT_2000')).toBe(false)
    expect(matchesCapacityFilter(2001, 'GT_2000')).toBe(true)
    expect(matchesCapacityFilter(5000, 'GT_2000')).toBe(true)
  })
})

describe('filterVehicles', () => {
  it('returns every vehicle when filters are the defaults', () => {
    expect(filterVehicles(VEHICLES, DEFAULT_VEHICLE_FILTERS)).toEqual(VEHICLES)
  })

  it('filters by plate substring, case-insensitively', () => {
    const filters: VehicleFilters = { ...DEFAULT_VEHICLE_FILTERS, plate: 'def' }

    expect(filterVehicles(VEHICLES, filters)).toEqual([VAN_VEHICLE])
  })

  it('matches a plate substring that is not a prefix (substring covers prefix too)', () => {
    const filters: VehicleFilters = { ...DEFAULT_VEHICLE_FILTERS, plate: '456' }

    expect(filterVehicles(VEHICLES, filters)).toEqual([VAN_VEHICLE])
  })

  it('filters by exact type', () => {
    const filters: VehicleFilters = { ...DEFAULT_VEHICLE_FILTERS, type: 'VAN' }

    expect(filterVehicles(VEHICLES, filters)).toEqual([VAN_VEHICLE])
  })

  it('filters by exact status', () => {
    const filters: VehicleFilters = { ...DEFAULT_VEHICLE_FILTERS, status: 'OUT_OF_SERVICE' }

    expect(filterVehicles(VEHICLES, filters)).toEqual([PICKUP_VEHICLE])
  })

  it('filters by capacity range', () => {
    const filters: VehicleFilters = { ...DEFAULT_VEHICLE_FILTERS, capacity: 'GT_2000' }

    expect(filterVehicles(VEHICLES, filters)).toEqual([TRUCK_VEHICLE])
  })

  it('matches every vehicle when zoneIds is empty ("todas las zonas")', () => {
    expect(filterVehicles(VEHICLES, DEFAULT_VEHICLE_FILTERS)).toEqual(VEHICLES)
  })

  it('filters by one or more selected zoneIds', () => {
    const filters: VehicleFilters = { ...DEFAULT_VEHICLE_FILTERS, zoneIds: ['1', '3'] }

    expect(filterVehicles(VEHICLES, filters)).toEqual([TRUCK_VEHICLE, PICKUP_VEHICLE])
  })

  it('combines all 5 criteria with AND', () => {
    const filters: VehicleFilters = {
      plate: 'ghi',
      type: 'PICKUP',
      capacity: 'LTE_1000',
      status: 'OUT_OF_SERVICE',
      zoneIds: ['3']
    }

    expect(filterVehicles(VEHICLES, filters)).toEqual([PICKUP_VEHICLE])
  })

  it('returns an empty array when no vehicle matches every criterion', () => {
    const filters: VehicleFilters = { ...DEFAULT_VEHICLE_FILTERS, type: 'PICKUP', status: 'ACTIVE' }

    expect(filterVehicles(VEHICLES, filters)).toEqual([])
  })
})
