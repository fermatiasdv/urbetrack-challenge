import { beforeEach, describe, expect, it } from 'vitest'
import { useAssetsStore } from './useAssetsStore'
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
  },
  {
    id: '2',
    type: 'CONTAINER',
    status: 'FULL',
    lat: -34.5875,
    lng: -58.4205,
    address: 'Av. Santa Fe 2',
    zoneId: '2'
  }
]

beforeEach(() => {
  useAssetsStore.setState({ assets: [], hasHydrated: false })
})

describe('useAssetsStore.removeAsset', () => {
  it('removes only the asset matching the given id', () => {
    useAssetsStore.getState().setAssets(ASSETS)

    useAssetsStore.getState().removeAsset('1')

    expect(useAssetsStore.getState().assets).toEqual([ASSETS[1]])
  })

  it('is a no-op when the id does not match any asset', () => {
    useAssetsStore.getState().setAssets(ASSETS)

    useAssetsStore.getState().removeAsset('999')

    expect(useAssetsStore.getState().assets).toEqual(ASSETS)
  })

  it('does not reset hasHydrated (a delete must not look like a fresh load)', () => {
    useAssetsStore.getState().setAssets(ASSETS)

    useAssetsStore.getState().removeAsset('1')

    expect(useAssetsStore.getState().hasHydrated).toBe(true)
  })
})

describe('useAssetsStore.addAsset', () => {
  it('appends the new asset', () => {
    useAssetsStore.getState().setAssets(ASSETS)
    const created: Asset = {
      id: '3',
      type: 'BENCH',
      status: 'OK',
      lat: 0,
      lng: 0,
      address: 'Nueva dirección',
      zoneId: '3'
    }

    useAssetsStore.getState().addAsset(created)

    expect(useAssetsStore.getState().assets).toEqual([...ASSETS, created])
  })
})

describe('useAssetsStore.setAssets', () => {
  it('marks the store as hydrated', () => {
    expect(useAssetsStore.getState().hasHydrated).toBe(false)

    useAssetsStore.getState().setAssets(ASSETS)

    expect(useAssetsStore.getState().hasHydrated).toBe(true)
  })
})

describe('useAssetsStore.updateAsset', () => {
  it('merges the given changes into the matching asset only', () => {
    useAssetsStore.getState().setAssets(ASSETS)

    useAssetsStore.getState().updateAsset('1', { status: 'DAMAGED' })

    expect(useAssetsStore.getState().assets).toEqual([
      { ...ASSETS[0], status: 'DAMAGED' },
      ASSETS[1]
    ])
  })

  it('is a no-op when the id does not match any asset', () => {
    useAssetsStore.getState().setAssets(ASSETS)

    useAssetsStore.getState().updateAsset('999', { status: 'DAMAGED' })

    expect(useAssetsStore.getState().assets).toEqual(ASSETS)
  })
})
