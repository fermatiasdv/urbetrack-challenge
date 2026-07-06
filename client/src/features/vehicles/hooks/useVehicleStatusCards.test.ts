import { describe, expect, it } from 'vitest'
import { buildVehicleStatusCards, formatPercentage } from './useVehicleStatusCards'
import type { Vehicle } from '../../../shared/types/domain.types'

function vehicle(id: string, status: Vehicle['status']): Vehicle {
  return { id, plate: `PLT${id}`, type: 'TRUCK', status, capacity: 1000, zoneId: '1' }
}

describe('formatPercentage', () => {
  it('returns 0% when total is 0', () => {
    expect(formatPercentage(0, 0)).toBe('0%')
  })

  it('returns an integer percentage without decimals', () => {
    expect(formatPercentage(69, 100)).toBe('69%')
  })

  it('returns one decimal when the result is not an integer', () => {
    expect(formatPercentage(84, 452)).toBe('18.6%')
    expect(formatPercentage(56, 452)).toBe('12.4%')
  })
})

describe('buildVehicleStatusCards', () => {
  it('returns 4 cards with counts and percentages computed from the vehicles list', () => {
    const vehicles: Vehicle[] = [
      vehicle('1', 'ACTIVE'),
      vehicle('2', 'ACTIVE'),
      vehicle('3', 'MAINTENANCE'),
      vehicle('4', 'OUT_OF_SERVICE')
    ]

    const cards = buildVehicleStatusCards(vehicles)
    expect(cards).toHaveLength(4)

    const byKey = Object.fromEntries(cards.map((card) => [card.key, card]))

    expect(byKey.total?.value).toBe(4)
    expect(byKey.active?.value).toBe(2)
    expect(byKey.maintenance?.value).toBe(1)
    expect(byKey.outOfService?.value).toBe(1)

    expect(byKey.active?.secondaryText).toContain('50%')
    expect(byKey.maintenance?.secondaryText).toContain('25%')
    expect(byKey.outOfService?.secondaryText).toContain('25%')
  })

  it('does not divide by zero when there are no vehicles', () => {
    const cards = buildVehicleStatusCards([])
    const byKey = Object.fromEntries(cards.map((card) => [card.key, card]))

    expect(byKey.total?.value).toBe(0)
    expect(byKey.active?.secondaryText).toContain('0%')
    expect(byKey.maintenance?.secondaryText).toContain('0%')
    expect(byKey.outOfService?.secondaryText).toContain('0%')
  })

  it('always adds active + maintenance + outOfService up to the total', () => {
    const vehicles: Vehicle[] = [
      vehicle('1', 'ACTIVE'),
      vehicle('2', 'MAINTENANCE'),
      vehicle('3', 'OUT_OF_SERVICE'),
      vehicle('4', 'ACTIVE'),
      vehicle('5', 'ACTIVE')
    ]

    const cards = buildVehicleStatusCards(vehicles)
    const byKey = Object.fromEntries(cards.map((card) => [card.key, card]))
    const sum =
      (byKey.active?.value ?? 0) +
      (byKey.maintenance?.value ?? 0) +
      (byKey.outOfService?.value ?? 0)

    expect(sum).toBe(byKey.total?.value)
  })
})
