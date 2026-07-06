import { describe, expect, it } from 'vitest'
import { buildHeatmapData } from './buildHeatmapData'
import type { AssociatedIncident, HeatmapFilters } from '../types'

function makeIncident(overrides: Partial<AssociatedIncident>): AssociatedIncident {
  return {
    id: 'incident-1',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'Contenedor desbordado',
    lat: -34.6037,
    lng: -58.3816,
    zoneId: '1',
    createdAt: '2024-01-15T10:30:00Z',
    derivedZone: 'MICROCENTRO',
    associatedAssetId: null,
    ...overrides
  }
}

const ALL_FILTERS: HeatmapFilters = {
  statuses: ['REPORTED', 'IN_PROGRESS', 'RESOLVED'],
  types: ['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']
}

describe('buildHeatmapData', () => {
  it('returns every incident when all statuses and types are selected', () => {
    const incidents = [
      makeIncident({ id: '1', status: 'REPORTED' }),
      makeIncident({ id: '2', status: 'RESOLVED', type: 'DAMAGE' })
    ]

    expect(buildHeatmapData(incidents, ALL_FILTERS)).toHaveLength(2)
  })

  it('filters by status', () => {
    const incidents = [
      makeIncident({ id: '1', status: 'REPORTED' }),
      makeIncident({ id: '2', status: 'RESOLVED' })
    ]

    const result = buildHeatmapData(incidents, { ...ALL_FILTERS, statuses: ['REPORTED'] })

    expect(result).toHaveLength(1)
    expect(result[0]?.status).toBe('REPORTED')
  })

  it('filters by type', () => {
    const incidents = [
      makeIncident({ id: '1', type: 'OVERFLOW' }),
      makeIncident({ id: '2', type: 'LITTERING' })
    ]

    const result = buildHeatmapData(incidents, { ...ALL_FILTERS, types: ['LITTERING'] })

    expect(result).toHaveLength(1)
  })

  it('combines status and type filters (AND)', () => {
    const incidents = [
      makeIncident({ id: '1', status: 'REPORTED', type: 'OVERFLOW' }),
      makeIncident({ id: '2', status: 'REPORTED', type: 'LITTERING' }),
      makeIncident({ id: '3', status: 'RESOLVED', type: 'OVERFLOW' })
    ]

    const result = buildHeatmapData(incidents, {
      statuses: ['REPORTED'],
      types: ['OVERFLOW']
    })

    expect(result).toHaveLength(1)
  })

  it('returns an empty array when no status is selected', () => {
    const incidents = [makeIncident({})]

    expect(buildHeatmapData(incidents, { ...ALL_FILTERS, statuses: [] })).toEqual([])
  })

  it('projects only lat/lng/status', () => {
    const incidents = [makeIncident({ lat: -34.1, lng: -58.1, status: 'IN_PROGRESS' })]

    expect(buildHeatmapData(incidents, ALL_FILTERS)).toEqual([
      { lat: -34.1, lng: -58.1, status: 'IN_PROGRESS' }
    ])
  })
})
