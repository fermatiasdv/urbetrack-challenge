import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { useSyncAssignmentStore } from './useSyncAssignmentStore'
import { useVehiclesStore } from '../../vehicles/store/useVehiclesStore'
import { useMapStore } from '../store/useMapStore'
import { useAssignmentStore } from './useAssignmentStore'
import type { Vehicle } from '../../../shared/types/domain.types'
import type { GeoTaggedAsset } from '../types'

const VEHICLE: Vehicle = {
  id: 'v-1',
  plate: 'AA123BB',
  type: 'TRUCK',
  status: 'ACTIVE',
  capacity: 5000,
  zoneId: 'z-1'
}

const ASSET: GeoTaggedAsset = {
  id: 'a-1',
  type: 'BENCH',
  status: 'OK',
  lat: -34.605,
  lng: -58.375,
  address: 'Av. Corrientes 1',
  zoneId: 'z-1',
  derivedZone: 'MICROCENTRO'
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: [], hasHydrated: false })
  useMapStore.setState({ assets: [], incidents: [] })
  useAssignmentStore.setState({
    assignments: [],
    zoneAvailability: {
      MICROCENTRO: false,
      PALERMO: false,
      RECOLETA: false,
      BELGRANO: false,
      CABALLITO: false
    }
  })
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([{ id: 'z-1', name: 'Microcentro' }])
      })
    )
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useSyncAssignmentStore', () => {
  it('recomputes zoneAvailability when the vehicles store changes', async () => {
    renderHook(() => useSyncAssignmentStore(), { wrapper })

    await waitFor(() =>
      expect(useAssignmentStore.getState().zoneAvailability.MICROCENTRO).toBe(false)
    )

    useVehiclesStore.getState().setVehicles([VEHICLE])

    await waitFor(() =>
      expect(useAssignmentStore.getState().zoneAvailability.MICROCENTRO).toBe(true)
    )
  })

  it('recomputes assignments when the map store gains an asset/incident', async () => {
    renderHook(() => useSyncAssignmentStore(), { wrapper })

    useVehiclesStore.getState().setVehicles([VEHICLE])
    useMapStore.setState({
      assets: [ASSET],
      incidents: [
        {
          id: 'i-1',
          type: 'OVERFLOW',
          status: 'REPORTED',
          description: 'desborde',
          lat: -34.605,
          lng: -58.375,
          zoneId: 'z-1',
          createdAt: '2026-07-01T00:00:00.000Z',
          derivedZone: 'MICROCENTRO',
          associatedAssetId: 'a-1'
        }
      ]
    })

    await waitFor(() => expect(useAssignmentStore.getState().assignments).toHaveLength(1))
    expect(useAssignmentStore.getState().assignments[0]).toEqual({
      incidentId: 'i-1',
      assetId: 'a-1',
      vehicleId: 'v-1'
    })
  })
})
