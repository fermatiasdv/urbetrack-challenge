import { beforeEach, describe, expect, it } from 'vitest'
import { useMapStore } from './useMapStore'
import type { Asset, Incident } from '../../../shared/types/domain.types'

// A point inside MICROCENTRO (shared/geo/zones.ts) and one clearly outside
// all 5 supported zones (BA_BOUNDS but not any zone bounding box).
const INSIDE_ASSET: Asset = {
  id: 'asset-inside',
  type: 'BIN',
  status: 'OK',
  lat: -34.605,
  lng: -58.375,
  address: 'Av. Corrientes 1',
  zoneId: '1'
}

const OUTSIDE_ASSET: Asset = {
  id: 'asset-outside',
  type: 'BIN',
  status: 'OK',
  lat: -34.7,
  lng: -58.5,
  address: 'Fuera de zona',
  zoneId: '1'
}

const OVERFLOW_INCIDENT_NEAR_ASSET: Incident = {
  id: 'incident-1',
  type: 'OVERFLOW',
  status: 'REPORTED',
  description: 'Contenedor desbordado',
  lat: -34.6051,
  lng: -58.3751,
  zoneId: '1',
  createdAt: '2024-01-15T10:30:00Z'
}

const OUTSIDE_INCIDENT: Incident = {
  id: 'incident-outside',
  type: 'OVERFLOW',
  status: 'REPORTED',
  description: 'Fuera de zona',
  lat: -34.7,
  lng: -58.5,
  zoneId: '1',
  createdAt: '2024-01-15T10:30:00Z'
}

beforeEach(() => {
  useMapStore.setState({
    assets: [],
    incidents: [],
    heatmapEnabled: true,
    heatmapFilters: {
      statuses: ['REPORTED', 'IN_PROGRESS', 'RESOLVED'],
      types: ['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']
    },
    selectedZone: null
  })
})

describe('useMapStore.syncFromShared', () => {
  it('discards assets and incidents outside the 5 supported zones', () => {
    useMapStore.getState().syncFromShared([INSIDE_ASSET, OUTSIDE_ASSET], [OUTSIDE_INCIDENT])

    expect(useMapStore.getState().assets).toHaveLength(1)
    expect(useMapStore.getState().assets[0]?.id).toBe('asset-inside')
    expect(useMapStore.getState().incidents).toHaveLength(0)
  })

  it('tags surviving assets/incidents with their derived zone', () => {
    useMapStore.getState().syncFromShared([INSIDE_ASSET], [])

    expect(useMapStore.getState().assets[0]?.derivedZone).toBe('MICROCENTRO')
  })

  it('associates an OVERFLOW incident to a nearby compatible asset', () => {
    useMapStore.getState().syncFromShared([INSIDE_ASSET], [OVERFLOW_INCIDENT_NEAR_ASSET])

    const [incident] = useMapStore.getState().incidents

    expect(incident?.associatedAssetId).toBe(INSIDE_ASSET.id)
    expect(incident?.lat).toBe(INSIDE_ASSET.lat)
    expect(incident?.lng).toBe(INSIDE_ASSET.lng)
  })

  it('recomputes when called again with a different snapshot (e.g. after a local mutation)', () => {
    useMapStore.getState().syncFromShared([INSIDE_ASSET, OUTSIDE_ASSET], [])
    expect(useMapStore.getState().assets).toHaveLength(1)

    useMapStore.getState().syncFromShared([INSIDE_ASSET], [])
    expect(useMapStore.getState().assets).toHaveLength(1)

    useMapStore.getState().syncFromShared([], [])
    expect(useMapStore.getState().assets).toHaveLength(0)
  })
})

describe('useMapStore.toggleHeatmap', () => {
  it('flips heatmapEnabled', () => {
    expect(useMapStore.getState().heatmapEnabled).toBe(true)

    useMapStore.getState().toggleHeatmap()

    expect(useMapStore.getState().heatmapEnabled).toBe(false)
  })
})

describe('useMapStore.setHeatmapFilters', () => {
  it('replaces the current filters', () => {
    useMapStore.getState().setHeatmapFilters({ statuses: ['REPORTED'], types: ['OVERFLOW'] })

    expect(useMapStore.getState().heatmapFilters).toEqual({
      statuses: ['REPORTED'],
      types: ['OVERFLOW']
    })
  })
})

describe('useMapStore.setSelectedZone', () => {
  it('sets and clears the selected zone', () => {
    useMapStore.getState().setSelectedZone('PALERMO')
    expect(useMapStore.getState().selectedZone).toBe('PALERMO')

    useMapStore.getState().setSelectedZone(null)
    expect(useMapStore.getState().selectedZone).toBeNull()
  })
})
