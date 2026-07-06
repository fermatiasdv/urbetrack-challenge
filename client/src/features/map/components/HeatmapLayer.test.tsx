import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HeatmapLayer } from './HeatmapLayer'
import { useMapStore } from '../store/useMapStore'
import type { AssociatedIncident, GeoTaggedAsset } from '../types'

const { heatLayerMock, removeLayerMock, addToMock } = vi.hoisted(() => ({
  heatLayerMock: vi.fn(),
  removeLayerMock: vi.fn(),
  addToMock: vi.fn()
}))

vi.mock('leaflet', () => ({
  default: {
    heatLayer: (...args: unknown[]) => {
      const layer = { addTo: addToMock }
      addToMock.mockReturnValue(layer)
      heatLayerMock(...args)
      return layer
    }
  }
}))

vi.mock('leaflet.heat', () => ({}))

const getSizeMock = vi.fn(() => ({ x: 800, y: 520 }))

vi.mock('react-leaflet', () => ({
  useMap: () => ({ removeLayer: removeLayerMock, getSize: getSizeMock })
}))

function makeIncident(overrides: Partial<AssociatedIncident>): AssociatedIncident {
  return {
    id: 'incident-1',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'Contenedor desbordado',
    lat: -34.6,
    lng: -58.38,
    zoneId: '1',
    createdAt: '2024-01-15T10:30:00Z',
    derivedZone: 'MICROCENTRO',
    associatedAssetId: null,
    ...overrides
  }
}

function makeAsset(overrides: Partial<GeoTaggedAsset>): GeoTaggedAsset {
  return {
    id: 'asset-1',
    type: 'BIN',
    status: 'OK',
    lat: -34.6,
    lng: -58.38,
    address: 'Av. Corrientes 1',
    zoneId: '1',
    derivedZone: 'MICROCENTRO',
    ...overrides
  }
}

// Clean baseline: nothing radiates unless a test opts in. Incident and asset
// filters both start empty so each test controls exactly which layers appear.
beforeEach(() => {
  heatLayerMock.mockClear()
  addToMock.mockClear()
  removeLayerMock.mockClear()
  getSizeMock.mockReset()
  getSizeMock.mockReturnValue({ x: 800, y: 520 })
  useMapStore.setState({
    assets: [],
    incidents: [],
    heatmapFilters: { statuses: [], types: [] },
    assetHeatmapFilters: { statuses: [], types: [] }
  })
})

describe('HeatmapLayer — incidents', () => {
  it('creates one L.heatLayer per selected status and adds it to the map', () => {
    useMapStore.setState({
      incidents: [
        makeIncident({ id: '1', status: 'REPORTED' }),
        makeIncident({ id: '2', status: 'IN_PROGRESS' }),
        makeIncident({ id: '3', status: 'RESOLVED' })
      ],
      heatmapFilters: {
        statuses: ['REPORTED', 'IN_PROGRESS', 'RESOLVED'],
        types: ['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']
      }
    })

    render(<HeatmapLayer />)

    expect(heatLayerMock).toHaveBeenCalledTimes(3)
    expect(addToMock).toHaveBeenCalledTimes(3)
  })

  it('only creates layers for the statuses selected in heatmapFilters', () => {
    useMapStore.setState({
      incidents: [makeIncident({ status: 'REPORTED' })],
      heatmapFilters: {
        statuses: ['REPORTED'],
        types: ['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']
      }
    })

    render(<HeatmapLayer />)

    expect(heatLayerMock).toHaveBeenCalledTimes(1)
  })

  it('passes lat/lng/intensity tuples matching the filtered incidents to L.heatLayer', () => {
    useMapStore.setState({
      incidents: [makeIncident({ status: 'REPORTED', lat: -34.1, lng: -58.1 })],
      heatmapFilters: { statuses: ['REPORTED'], types: ['OVERFLOW'] }
    })

    render(<HeatmapLayer />)

    expect(heatLayerMock).toHaveBeenCalledWith(
      [[-34.1, -58.1, 1]],
      expect.objectContaining({ radius: 25, blur: 15 })
    )
  })

  it('removes every created layer from the map on unmount', () => {
    useMapStore.setState({
      incidents: [makeIncident({ status: 'REPORTED' })],
      heatmapFilters: { statuses: ['REPORTED'], types: ['OVERFLOW'] }
    })

    const { unmount } = render(<HeatmapLayer />)
    unmount()

    expect(removeLayerMock).toHaveBeenCalledTimes(1)
  })

  it('renders nothing', () => {
    const { container } = render(<HeatmapLayer />)

    expect(container).toBeEmptyDOMElement()
  })

  it('defers layer creation until map.getSize() reports a non-zero size (IndexSizeError guard)', () => {
    getSizeMock.mockReset()
    getSizeMock.mockReturnValueOnce({ x: 0, y: 0 }).mockReturnValue({ x: 800, y: 520 })

    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0)
        return 1
      })

    useMapStore.setState({
      incidents: [makeIncident({ status: 'REPORTED' })],
      heatmapFilters: { statuses: ['REPORTED'], types: ['OVERFLOW'] }
    })

    render(<HeatmapLayer />)

    expect(rafSpy).toHaveBeenCalled()
    expect(heatLayerMock).toHaveBeenCalledTimes(1)

    rafSpy.mockRestore()
  })
})

describe('HeatmapLayer — assets', () => {
  it('creates one L.heatLayer per selected asset status', () => {
    useMapStore.setState({
      assets: [
        makeAsset({ id: '1', status: 'OK' }),
        makeAsset({ id: '2', status: 'FULL' }),
        makeAsset({ id: '3', status: 'DAMAGED' }),
        makeAsset({ id: '4', status: 'OUT_OF_SERVICE' })
      ],
      assetHeatmapFilters: {
        statuses: ['OK', 'FULL', 'DAMAGED', 'OUT_OF_SERVICE'],
        types: ['CONTAINER', 'BIN', 'BENCH']
      }
    })

    render(<HeatmapLayer />)

    expect(heatLayerMock).toHaveBeenCalledTimes(4)
    expect(addToMock).toHaveBeenCalledTimes(4)
  })

  it('only creates asset layers for the statuses selected in assetHeatmapFilters', () => {
    useMapStore.setState({
      assets: [makeAsset({ id: '1', status: 'OK' }), makeAsset({ id: '2', status: 'FULL' })],
      assetHeatmapFilters: { statuses: ['FULL'], types: ['CONTAINER', 'BIN', 'BENCH'] }
    })

    render(<HeatmapLayer />)

    expect(heatLayerMock).toHaveBeenCalledTimes(1)
  })

  it('colors the asset layer with its marker color and uses the asset heat tuning', () => {
    useMapStore.setState({
      assets: [makeAsset({ status: 'FULL', type: 'CONTAINER', lat: -34.1, lng: -58.1 })],
      assetHeatmapFilters: { statuses: ['FULL'], types: ['CONTAINER'] }
    })

    render(<HeatmapLayer />)

    expect(heatLayerMock).toHaveBeenCalledWith(
      [[-34.1, -58.1, 0.4]],
      expect.objectContaining({
        radius: 20,
        blur: 15,
        max: 3,
        gradient: { 0.4: '#ef4444', 1: '#ef4444' }
      })
    )
  })

  it('creates both incident and asset layers when both are selected', () => {
    useMapStore.setState({
      incidents: [makeIncident({ status: 'REPORTED' })],
      heatmapFilters: { statuses: ['REPORTED'], types: ['OVERFLOW'] },
      assets: [makeAsset({ status: 'FULL' })],
      assetHeatmapFilters: { statuses: ['FULL'], types: ['CONTAINER', 'BIN', 'BENCH'] }
    })

    render(<HeatmapLayer />)

    expect(heatLayerMock).toHaveBeenCalledTimes(2)
    expect(addToMock).toHaveBeenCalledTimes(2)
  })
})
