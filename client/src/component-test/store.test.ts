import { beforeEach, describe, expect, it } from 'vitest'
import { useVehiclesStore } from './useVehiclesStore'
import { FAKE_VEHICLES } from './data'

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: [] })
})

describe('useVehiclesStore', () => {
  it('holds exactly two vehicles with zoneName derived and the assigned coordinates', () => {
    useVehiclesStore.getState().setVehicles(FAKE_VEHICLES)
    const { vehicles } = useVehiclesStore.getState()

    expect(vehicles).toHaveLength(2)

    const truck = vehicles.find((v) => v.id === '1')
    expect(truck).toMatchObject({
      type: 'TRUCK',
      plate: 'ABC123',
      status: 'ACTIVE',
      zoneId: '1',
      zoneName: 'Microcentro',
      lat: -34.61361,
      lng: -58.42566
    })

    const van = vehicles.find((v) => v.id === '2')
    expect(van).toMatchObject({
      type: 'VAN',
      plate: 'DEF456',
      status: 'MAINTENANCE',
      zoneId: '2',
      zoneName: 'Palermo',
      lat: -34.6061,
      lng: -58.4354
    })
  })

  it('updatePlate only changes the targeted vehicle', () => {
    useVehiclesStore.getState().setVehicles(FAKE_VEHICLES)
    useVehiclesStore.getState().updatePlate('1', 'XYZ999')

    const { vehicles } = useVehiclesStore.getState()
    expect(vehicles.find((v) => v.id === '1')?.plate).toBe('XYZ999')
    expect(vehicles.find((v) => v.id === '2')?.plate).toBe('DEF456')
  })
})
