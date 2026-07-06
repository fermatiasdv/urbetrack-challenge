import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { createAsset, fetchAssets, useAssetsQuery } from './useAssetsQuery'
import { useAssetsStore } from '../store/useAssetsStore'
import type { Asset } from '../../../shared/types/domain.types'

const ASSETS: Asset[] = [
  {
    id: '1',
    type: 'BIN',
    status: 'OK',
    lat: -34.6037,
    lng: -58.3816,
    address: 'Av. Corrientes 1',
    zoneId: '1'
  }
]

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

beforeEach(() => {
  useAssetsStore.setState({ assets: [], hasHydrated: false })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchAssets', () => {
  it('returns the parsed JSON body when the response is ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(ASSETS)
      })
    )

    await expect(fetchAssets()).resolves.toEqual(ASSETS)
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

    await expect(fetchAssets()).rejects.toThrow('Failed to fetch assets: 500')
  })
})

describe('useAssetsQuery', () => {
  it('hydrates the Zustand store once the query resolves', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(ASSETS)
      })
    )

    const { result } = renderHook(() => useAssetsQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    await waitFor(() => expect(useAssetsStore.getState().assets).toEqual(ASSETS))
    expect(useAssetsStore.getState().hasHydrated).toBe(true)
  })

  it('does not re-hydrate the store once it has already been hydrated locally', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(ASSETS)
      })
    )

    useAssetsStore.setState({ assets: [], hasHydrated: true })

    const { result } = renderHook(() => useAssetsQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useAssetsStore.getState().assets).toEqual([])
  })
})

describe('createAsset', () => {
  const PAYLOAD = {
    type: 'BIN' as const,
    status: 'OK' as const,
    address: 'Av. Corrientes 1',
    zoneId: '1',
    lat: -34.6037,
    lng: -58.3816
  }

  it('POSTs the payload and returns the created asset', async () => {
    const created: Asset = { id: '99', ...PAYLOAD }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve(created)
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(createAsset(PAYLOAD)).resolves.toEqual(created)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/assets',
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

    await expect(createAsset(PAYLOAD)).rejects.toThrow('Failed to create asset: 400')
  })
})
