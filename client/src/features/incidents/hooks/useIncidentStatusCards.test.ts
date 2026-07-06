import { describe, expect, it } from 'vitest'
import { buildIncidentStatusCards } from './useIncidentStatusCards'
import type { Incident } from '../../../shared/types/domain.types'

const INCIDENTS: Incident[] = [
  {
    id: '1',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'a',
    lat: 0,
    lng: 0,
    zoneId: '1',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'DAMAGE',
    status: 'IN_PROGRESS',
    description: 'b',
    lat: 0,
    lng: 0,
    zoneId: '2',
    createdAt: '2024-01-14T10:30:00Z'
  },
  {
    id: '3',
    type: 'LITTERING',
    status: 'RESOLVED',
    description: 'c',
    lat: 0,
    lng: 0,
    zoneId: '3',
    createdAt: '2024-01-13T10:30:00Z'
  }
]

describe('buildIncidentStatusCards', () => {
  it('returns 4 cards with correct counts', () => {
    const cards = buildIncidentStatusCards(INCIDENTS)
    expect(cards).toHaveLength(4)
    expect(cards.map((card) => card.value)).toEqual([3, 1, 1, 1])
  })

  it('handles an empty list without dividing by zero', () => {
    const cards = buildIncidentStatusCards([])
    expect(cards.every((card) => card.value === 0)).toBe(true)
    expect(cards[0]?.secondaryText).toContain('0%')
  })
})
