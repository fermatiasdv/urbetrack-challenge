import { describe, expect, it } from 'vitest'
import { filterIncidents, DEFAULT_INCIDENT_FILTERS } from './incidentFilters'
import type { Incident } from '../../../shared/types/domain.types'

const INCIDENTS: Incident[] = [
  {
    id: '1',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'a',
    lat: -34.6,
    lng: -58.3,
    zoneId: '1',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'DAMAGE',
    status: 'RESOLVED',
    description: 'b',
    lat: -34.5,
    lng: -58.4,
    zoneId: '2',
    createdAt: '2024-01-14T10:30:00Z'
  }
]

describe('filterIncidents', () => {
  it('returns every incident when filters are default', () => {
    expect(filterIncidents(INCIDENTS, DEFAULT_INCIDENT_FILTERS)).toEqual(INCIDENTS)
  })

  it('filters by type', () => {
    const result = filterIncidents(INCIDENTS, { ...DEFAULT_INCIDENT_FILTERS, type: 'DAMAGE' })
    expect(result).toEqual([INCIDENTS[1]])
  })

  it('filters by status', () => {
    const result = filterIncidents(INCIDENTS, { ...DEFAULT_INCIDENT_FILTERS, status: 'RESOLVED' })
    expect(result).toEqual([INCIDENTS[1]])
  })

  it('filters by zoneIds (empty means all zones)', () => {
    const result = filterIncidents(INCIDENTS, { ...DEFAULT_INCIDENT_FILTERS, zoneIds: ['1'] })
    expect(result).toEqual([INCIDENTS[0]])
  })

  it('applies all filters with AND semantics', () => {
    const result = filterIncidents(INCIDENTS, {
      type: 'OVERFLOW',
      status: 'REPORTED',
      zoneIds: ['1']
    })
    expect(result).toEqual([INCIDENTS[0]])
  })
})
