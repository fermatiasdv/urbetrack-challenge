import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { fetchVehicles, useVehiclesQuery } from './useVehiclesQuery'
import { useVehiclesStore } from '../store/useVehiclesStore'
import type { Vehicle } from '../types/vehicle.types'

const VEHICLES: Vehicle[] = [
  { id: '1', plate: 'ABC123', type: 'TRUCK', status: 'ACTIVE', capacity: 5000, zoneId: '1' }
]

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: [], hasHydrated: false })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchVehicles', () => {
  it('returns the parsed JSON body when the response is ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(VEHICLES)
      })
    )

    await expect(fetchVehicles()).resolves.toEqual(VEHICLES)
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve(null)
      })
    )

    await expect(fetchVehicles()).rejects.toThrow('Failed to fetch vehicles: 500')
  })
})

describe('useVehiclesQuery', () => {
  it('hydrates the Zustand store once the query resolves', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(VEHICLES)
      })
    )

    const { result } = renderHook(() => useVehiclesQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    await waitFor(() => expect(useVehiclesStore.getState().vehicles).toEqual(VEHICLES))
    expect(useVehiclesStore.getState().hasHydrated).toBe(true)
  })

  it('does not re-hydrate the store once it has already been hydrated locally', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(VEHICLES)
      })
    )

    // Simulates a local-only mutation (e.g. deleting a vehicle) that happened
    // after a previous hydration — the query cache/response is irrelevant
    // from this point on (docs/specs/architecture.md "Hidratación única").
    useVehiclesStore.setState({ vehicles: [], hasHydrated: true })

    const { result } = renderHook(() => useVehiclesQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useVehiclesStore.getState().vehicles).toEqual([])
  })
})
