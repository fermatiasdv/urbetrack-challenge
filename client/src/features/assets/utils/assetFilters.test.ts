import { describe, expect, it } from 'vitest'
import { DEFAULT_ASSET_FILTERS, filterAssets, type AssetFilters } from './assetFilters'
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
const BENCH_ASSET: Asset = {
  id: '3',
  type: 'BENCH',
  status: 'OUT_OF_SERVICE',
  lat: -34.5801,
  lng: -58.4176,
  address: 'Av. Las Heras 3',
  zoneId: '3'
}

const ASSETS: Asset[] = [BIN_ASSET, CONTAINER_ASSET, BENCH_ASSET]

describe('filterAssets', () => {
  it('returns every asset when filters are the defaults', () => {
    expect(filterAssets(ASSETS, DEFAULT_ASSET_FILTERS)).toEqual(ASSETS)
  })

  it('filters by exact type', () => {
    const filters: AssetFilters = { ...DEFAULT_ASSET_FILTERS, type: 'CONTAINER' }

    expect(filterAssets(ASSETS, filters)).toEqual([CONTAINER_ASSET])
  })

  it('filters by exact status', () => {
    const filters: AssetFilters = { ...DEFAULT_ASSET_FILTERS, status: 'OUT_OF_SERVICE' }

    expect(filterAssets(ASSETS, filters)).toEqual([BENCH_ASSET])
  })

  it('matches every asset when zoneIds is empty ("todas las zonas")', () => {
    expect(filterAssets(ASSETS, DEFAULT_ASSET_FILTERS)).toEqual(ASSETS)
  })

  it('filters by one or more selected zoneIds', () => {
    const filters: AssetFilters = { ...DEFAULT_ASSET_FILTERS, zoneIds: ['1', '3'] }

    expect(filterAssets(ASSETS, filters)).toEqual([BIN_ASSET, BENCH_ASSET])
  })

  it('combines all 3 criteria with AND', () => {
    const filters: AssetFilters = { type: 'BENCH', status: 'OUT_OF_SERVICE', zoneIds: ['3'] }

    expect(filterAssets(ASSETS, filters)).toEqual([BENCH_ASSET])
  })

  it('returns an empty array when no asset matches every criterion', () => {
    const filters: AssetFilters = { ...DEFAULT_ASSET_FILTERS, type: 'BENCH', status: 'OK' }

    expect(filterAssets(ASSETS, filters)).toEqual([])
  })
})
