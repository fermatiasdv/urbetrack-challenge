import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useFilteredAssets } from './useFilteredAssets'
import { useAssetsStore } from '../../../shared/services/assets/useAssetsStore'
import { useAssetFiltersStore } from '../store/useAssetFiltersStore'
import { DEFAULT_ASSET_FILTERS } from '../utils/assetFilters'
import type { Asset } from '../../../shared/types/domain.types'

const BIN_ASSET: Asset = {
  id: '1',
  type: 'BIN',
  status: 'OK',
  lat: -34.6037,
  lng: -58.3816,
  address: 'Av. Corrientes 1',
  zoneId: '1'
}
const CONTAINER_ASSET: Asset = {
  id: '2',
  type: 'CONTAINER',
  status: 'FULL',
  lat: -34.5875,
  lng: -58.4205,
  address: 'Av. Santa Fe 2',
  zoneId: '2'
}

const ASSETS: Asset[] = [BIN_ASSET, CONTAINER_ASSET]

beforeEach(() => {
  useAssetsStore.setState({ assets: ASSETS, hasHydrated: true })
  useAssetFiltersStore.setState(DEFAULT_ASSET_FILTERS)
})

describe('useFilteredAssets', () => {
  it('returns every asset when filters are the defaults', () => {
    const { result } = renderHook(() => useFilteredAssets())

    expect(result.current).toEqual(ASSETS)
  })

  it('reflects the current filters from useAssetFiltersStore', () => {
    useAssetFiltersStore.getState().setType('CONTAINER')

    const { result } = renderHook(() => useFilteredAssets())

    expect(result.current).toEqual([CONTAINER_ASSET])
  })

  it('updates when the filters store changes after the initial render', () => {
    const { result } = renderHook(() => useFilteredAssets())
    expect(result.current).toEqual(ASSETS)

    act(() => {
      useAssetFiltersStore.getState().setStatus('FULL')
    })

    expect(result.current).toEqual([CONTAINER_ASSET])
  })
})
