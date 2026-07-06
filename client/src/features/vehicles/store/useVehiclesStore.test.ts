import { beforeEach, describe, expect, it } from 'vitest'
import { useVehiclesStore } from './useVehiclesStore'
import type { Vehicle } from '../../../shared/types/domain.types'

const VEHICLES: Vehicle[] = [
  { id: '1', plate: 'ABC123', type: 'TRUCK', status: 'ACTIVE', capacity: 5000, zoneId: '1' },
  { id: '2', plate: 'DEF456', type: 'VAN', status: 'MAINTENANCE', capacity: 2000, zoneId: '2' }
]

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: [], hasHydrated: false })
})

describe('useVehiclesStore.removeVehicle', () => {
  it('removes only the vehicle matching the given id', () => {
    useVehiclesStore.getState().setVehicles(VEHICLES)

    useVehiclesStore.getState().removeVehicle('1')

    expect(useVehiclesStore.getState().vehicles).toEqual([VEHICLES[1]])
  })

  it('is a no-op when the id does not match any vehicle', () => {
    useVehiclesStore.getState().setVehicles(VEHICLES)

    useVehiclesStore.getState().removeVehicle('999')

    expect(useVehiclesStore.getState().vehicles).toEqual(VEHICLES)
  })

  it('does not reset hasHydrated (a delete must not look like a fresh load)', () => {
    useVehiclesStore.getState().setVehicles(VEHICLES)

    useVehiclesStore.getState().removeVehicle('1')

    expect(useVehiclesStore.getState().hasHydrated).toBe(true)
  })
})

describe('useVehiclesStore.setVehicles', () => {
  it('marks the store as hydrated', () => {
    expect(useVehiclesStore.getState().hasHydrated).toBe(false)

    useVehiclesStore.getState().setVehicles(VEHICLES)

    expect(useVehiclesStore.getState().hasHydrated).toBe(true)
  })
})

describe('useVehiclesStore.updateVehicle', () => {
  it('merges the given changes into the matching vehicle only', () => {
    useVehiclesStore.getState().setVehicles(VEHICLES)

    useVehiclesStore.getState().updateVehicle('1', { plate: 'XYZ789' })

    expect(useVehiclesStore.getState().vehicles).toEqual([
      { ...VEHICLES[0], plate: 'XYZ789' },
      VEHICLES[1]
    ])
  })

  it('is a no-op when the id does not match any vehicle', () => {
    useVehiclesStore.getState().setVehicles(VEHICLES)

    useVehiclesStore.getState().updateVehicle('999', { plate: 'XYZ789' })

    expect(useVehiclesStore.getState().vehicles).toEqual(VEHICLES)
  })
})
