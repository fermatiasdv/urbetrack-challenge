import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HeatmapLayer } from './HeatmapLayer'
import { useMapStore } from '../store/useMapStore'
import type { AssociatedIncident } from '../types'

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

describe('HeatmapLayer', () => {
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
    heatLayerMock.mockClear()
    addToMock.mockClear()

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
    heatLayerMock.mockClear()

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
    removeLayerMock.mockClear()

    useMapStore.setState({
      incidents: [makeIncident({ status: 'REPORTED' })],
      heatmapFilters: { statuses: ['REPORTED'], types: ['OVERFLOW'] }
    })

    const { unmount } = render(<HeatmapLayer />)
    unmount()

    expect(removeLayerMock).toHaveBeenCalledTimes(1)
  })

  it('renders nothing', () => {
    useMapStore.setState({ incidents: [], heatmapFilters: { statuses: [], types: [] } })

    const { container } = render(<HeatmapLayer />)

    expect(container).toBeEmptyDOMElement()
  })

  it('defers layer creation until map.getSize() reports a non-zero size (IndexSizeError guard)', () => {
    heatLayerMock.mockClear()
    addToMock.mockClear()
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
    getSizeMock.mockReset()
    getSizeMock.mockReturnValue({ x: 800, y: 520 })
  })
})
