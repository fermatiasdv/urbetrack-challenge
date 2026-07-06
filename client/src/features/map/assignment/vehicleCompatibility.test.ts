import { describe, expect, it } from 'vitest'
import {
  ASSET_MIN_CAPACITY,
  hasSufficientCapacity,
  isVehicleCompatibleWithAsset,
  VEHICLE_ASSET_COMPATIBILITY
} from './vehicleCompatibility'

describe('VEHICLE_ASSET_COMPATIBILITY / isVehicleCompatibleWithAsset', () => {
  it('PICKUP solo opera BENCH', () => {
    expect(VEHICLE_ASSET_COMPATIBILITY.PICKUP).toEqual(['BENCH'])
    expect(isVehicleCompatibleWithAsset('PICKUP', 'BENCH')).toBe(true)
    expect(isVehicleCompatibleWithAsset('PICKUP', 'BIN')).toBe(false)
    expect(isVehicleCompatibleWithAsset('PICKUP', 'CONTAINER')).toBe(false)
  })

  it('VAN opera BENCH o BIN', () => {
    expect(VEHICLE_ASSET_COMPATIBILITY.VAN).toEqual(['BENCH', 'BIN'])
    expect(isVehicleCompatibleWithAsset('VAN', 'BENCH')).toBe(true)
    expect(isVehicleCompatibleWithAsset('VAN', 'BIN')).toBe(true)
    expect(isVehicleCompatibleWithAsset('VAN', 'CONTAINER')).toBe(false)
  })

  it('TRUCK opera BENCH, BIN o CONTAINER', () => {
    expect(VEHICLE_ASSET_COMPATIBILITY.TRUCK).toEqual(['BENCH', 'BIN', 'CONTAINER'])
    expect(isVehicleCompatibleWithAsset('TRUCK', 'BENCH')).toBe(true)
    expect(isVehicleCompatibleWithAsset('TRUCK', 'BIN')).toBe(true)
    expect(isVehicleCompatibleWithAsset('TRUCK', 'CONTAINER')).toBe(true)
  })
})

describe('ASSET_MIN_CAPACITY / hasSufficientCapacity', () => {
  it('BENCH no exige capacidad mínima', () => {
    expect(ASSET_MIN_CAPACITY.BENCH).toBe(0)
    expect(hasSufficientCapacity(0, 'BENCH')).toBe(true)
  })

  it('BIN exige al menos 1000kg', () => {
    expect(ASSET_MIN_CAPACITY.BIN).toBe(1000)
    expect(hasSufficientCapacity(999, 'BIN')).toBe(false)
    expect(hasSufficientCapacity(1000, 'BIN')).toBe(true)
  })

  it('CONTAINER exige al menos 2000kg', () => {
    expect(ASSET_MIN_CAPACITY.CONTAINER).toBe(2000)
    expect(hasSufficientCapacity(1999, 'CONTAINER')).toBe(false)
    expect(hasSufficientCapacity(2000, 'CONTAINER')).toBe(true)
  })
})
