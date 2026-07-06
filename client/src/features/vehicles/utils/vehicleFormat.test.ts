import { describe, expect, it } from 'vitest'
import { formatCapacity, vehicleStatusLabel, vehicleTypeLabel } from './vehicleFormat'

describe('vehicleTypeLabel', () => {
  it('maps each VehicleType to its Spanish label', () => {
    expect(vehicleTypeLabel('TRUCK')).toBe('Camión')
    expect(vehicleTypeLabel('VAN')).toBe('Furgoneta')
    expect(vehicleTypeLabel('PICKUP')).toBe('Camioneta')
  })
})

describe('vehicleStatusLabel', () => {
  it('maps each VehicleStatus to its Spanish label', () => {
    expect(vehicleStatusLabel('ACTIVE')).toBe('Activo')
    expect(vehicleStatusLabel('MAINTENANCE')).toBe('En mantenimiento')
    expect(vehicleStatusLabel('OUT_OF_SERVICE')).toBe('Fuera de servicio')
  })
})

describe('formatCapacity', () => {
  it('formats with a thousands separator and a KG suffix', () => {
    expect(formatCapacity(5500)).toBe('5.500 KG')
    expect(formatCapacity(1000)).toBe('1.000 KG')
  })
})
