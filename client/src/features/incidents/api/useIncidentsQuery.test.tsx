import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { createIncident, fetchIncidents, useIncidentsQuery } from './useIncidentsQuery'
import { useIncidentsStore } from '../store/useIncidentsStore'
import type { Incident } from '../../../shared/types/domain.types'

const INCIDENTS: Incident[] = [
  {
    id: '1',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'Contenedor desbordado',
    lat: -34.6037,
    lng: -58.3816,
    zoneId: '1',
    createdAt: '2024-01-15T10:30:00Z'
  }
]

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

beforeEach(() => {
  useIncidentsStore.setState({ incidents: [], hasHydrated: false })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchIncidents', () => {
  it('returns the parsed JSON body when the response is ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(INCIDENTS)
      })
    )

    await expect(fetchIncidents()).resolves.toEqual(INCIDENTS)
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

    await expect(fetchIncidents()).rejects.toThrow('Failed to fetch incidents: 500')
  })
})

describe('useIncidentsQuery', () => {
  it('hydrates the Zustand store once the query resolves', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(INCIDENTS)
      })
    )

    const { result } = renderHook(() => useIncidentsQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    await waitFor(() => expect(useIncidentsStore.getState().incidents).toEqual(INCIDENTS))
    expect(useIncidentsStore.getState().hasHydrated).toBe(true)
  })

  it('does not re-hydrate the store once it has already been hydrated locally', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(INCIDENTS)
      })
    )

    useIncidentsStore.setState({ incidents: [], hasHydrated: true })

    const { result } = renderHook(() => useIncidentsQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useIncidentsStore.getState().incidents).toEqual([])
  })
})

describe('createIncident', () => {
  const PAYLOAD = {
    type: 'OVERFLOW' as const,
    description: 'Contenedor desbordado',
    zoneId: '1',
    lat: -34.6037,
    lng: -58.3816
  }

  it('POSTs the payload and returns the created incident', async () => {
    const created: Incident = {
      id: '99',
      status: 'REPORTED',
      createdAt: '2024-01-16T00:00:00Z',
      ...PAYLOAD
    }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve(created)
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(createIncident(PAYLOAD)).resolves.toEqual(created)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/incidents',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve(null)
      })
    )

    await expect(createIncident(PAYLOAD)).rejects.toThrow('Failed to create incident: 400')
  })
})
