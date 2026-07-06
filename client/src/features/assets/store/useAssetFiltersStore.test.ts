import { beforeEach, describe, expect, it } from 'vitest'
import { useAssetFiltersStore } from './useAssetFiltersStore'
import { DEFAULT_ASSET_FILTERS } from '../utils/assetFilters'

beforeEach(() => {
  useAssetFiltersStore.setState(DEFAULT_ASSET_FILTERS)
})

describe('useAssetFiltersStore', () => {
  it('starts with the default filters', () => {
    expect(useAssetFiltersStore.getState()).toMatchObject(DEFAULT_ASSET_FILTERS)
  })

  it('setType updates only the type filter', () => {
    useAssetFiltersStore.getState().setType('BIN')

    expect(useAssetFiltersStore.getState().type).toBe('BIN')
  })

  it('setStatus updates only the status filter', () => {
    useAssetFiltersStore.getState().setStatus('DAMAGED')

    expect(useAssetFiltersStore.getState().status).toBe('DAMAGED')
  })

  it('setZoneIds updates only the zoneIds filter', () => {
    useAssetFiltersStore.getState().setZoneIds(['1', '2'])

    expect(useAssetFiltersStore.getState().zoneIds).toEqual(['1', '2'])
  })

  it('reset restores every field to its default, discarding all prior changes', () => {
    const state = useAssetFiltersStore.getState()
    state.setType('CONTAINER')
    state.setStatus('FULL')
    state.setZoneIds(['1'])

    useAssetFiltersStore.getState().reset()

    expect(useAssetFiltersStore.getState()).toMatchObject(DEFAULT_ASSET_FILTERS)
  })
})
