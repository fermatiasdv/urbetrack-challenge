import { beforeEach, describe, expect, it } from 'vitest'
import { useVehicleModalStore } from './useVehicleModalStore'

beforeEach(() => {
  useVehicleModalStore.setState({ vehicleId: null, mode: null })
})

describe('useVehicleModalStore', () => {
  it('starts closed', () => {
    expect(useVehicleModalStore.getState().vehicleId).toBeNull()
    expect(useVehicleModalStore.getState().mode).toBeNull()
  })

  it('open sets the vehicleId and mode', () => {
    useVehicleModalStore.getState().open('1', 'details')

    expect(useVehicleModalStore.getState()).toMatchObject({ vehicleId: '1', mode: 'details' })
  })

  it('close resets vehicleId and mode', () => {
    useVehicleModalStore.getState().open('1', 'edit')

    useVehicleModalStore.getState().close()

    expect(useVehicleModalStore.getState().vehicleId).toBeNull()
    expect(useVehicleModalStore.getState().mode).toBeNull()
  })
})
