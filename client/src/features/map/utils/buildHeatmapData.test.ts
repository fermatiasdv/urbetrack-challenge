import { describe, expect, it } from 'vitest'
import { buildAssetHeatmapData, buildHeatmapData } from './buildHeatmapData'
import type {
  AssetHeatmapFilters,
  AssociatedIncident,
  GeoTaggedAsset,
  HeatmapFilters
} from '../types'

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

function makeAsset(overrides: Partial<GeoTaggedAsset>): GeoTaggedAsset {
  return {
    id: 'asset-1',
    type: 'BIN',
    status: 'OK',
    lat: -34.6037,
    lng: -58.3816,
    address: 'Av. Corrientes 1',
    zoneId: '1',
    derivedZone: 'MICROCENTRO',
    ...overrides
  }
}

const ALL_ASSET_FILTERS: AssetHeatmapFilters = {
  statuses: ['OK', 'FULL', 'DAMAGED', 'OUT_OF_SERVICE'],
  types: ['CONTAINER', 'BIN', 'BENCH']
}

describe('buildAssetHeatmapData', () => {
  it('returns every asset when all statuses and types are selected', () => {
    const assets = [
      makeAsset({ id: '1', status: 'OK', type: 'BIN' }),
      makeAsset({ id: '2', status: 'FULL', type: 'CONTAINER' })
    ]

    expect(buildAssetHeatmapData(assets, ALL_ASSET_FILTERS)).toHaveLength(2)
  })

  it('filters by status', () => {
    const assets = [makeAsset({ id: '1', status: 'OK' }), makeAsset({ id: '2', status: 'FULL' })]

    const result = buildAssetHeatmapData(assets, { ...ALL_ASSET_FILTERS, statuses: ['FULL'] })

    expect(result).toHaveLength(1)
    expect(result[0]?.status).toBe('FULL')
  })

  it('filters by type', () => {
    const assets = [makeAsset({ id: '1', type: 'BIN' }), makeAsset({ id: '2', type: 'BENCH' })]

    const result = buildAssetHeatmapData(assets, { ...ALL_ASSET_FILTERS, types: ['BENCH'] })

    expect(result).toHaveLength(1)
  })

  it('combines status and type filters (AND)', () => {
    const assets = [
      makeAsset({ id: '1', status: 'FULL', type: 'CONTAINER' }),
      makeAsset({ id: '2', status: 'FULL', type: 'BENCH' }),
      makeAsset({ id: '3', status: 'OK', type: 'CONTAINER' })
    ]

    const result = buildAssetHeatmapData(assets, { statuses: ['FULL'], types: ['CONTAINER'] })

    expect(result).toHaveLength(1)
  })

  it('returns an empty array when no status is selected', () => {
    expect(buildAssetHeatmapData([makeAsset({})], { ...ALL_ASSET_FILTERS, statuses: [] })).toEqual(
      []
    )
  })

  it('projects only lat/lng/status', () => {
    const assets = [makeAsset({ lat: -34.2, lng: -58.2, status: 'DAMAGED' })]

    expect(buildAssetHeatmapData(assets, ALL_ASSET_FILTERS)).toEqual([
      { lat: -34.2, lng: -58.2, status: 'DAMAGED' }
    ])
  })
})
