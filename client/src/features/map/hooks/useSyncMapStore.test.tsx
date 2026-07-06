import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { useSyncMapStore } from './useSyncMapStore'
import { useAssetsStore } from '../../../shared/services/assets/useAssetsStore'
import { useIncidentsStore } from '../../../shared/services/incidents/useIncidentsStore'
import { useMapStore } from '../store/useMapStore'
import type { Asset } from '../../../shared/types/domain.types'

const INSIDE_ASSET: Asset = {
  id: 'asset-inside',
  type: 'BIN',
  status: 'OK',
  lat: -34.605,
  lng: -58.375,
  address: 'Av. Corrientes 1',
  zoneId: '1'
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

beforeEach(() => {
  useAssetsStore.setState({ assets: [], hasHydrated: false })
  useIncidentsStore.setState({ incidents: [], hasHydrated: false })
  useMapStore.setState({ assets: [], incidents: [] })
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) => {
      if (url.endsWith('/assets')) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) })
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) })
    })
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useSyncMapStore', () => {
  it('reflects a local mutation on the shared assets store without a new fetch', async () => {
    const { result } = renderHook(() => useSyncMapStore(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    useAssetsStore.getState().setAssets([INSIDE_ASSET])

    await waitFor(() => expect(useMapStore.getState().assets).toHaveLength(1))
    expect(useMapStore.getState().assets[0]?.id).toBe('asset-inside')
  })
})
