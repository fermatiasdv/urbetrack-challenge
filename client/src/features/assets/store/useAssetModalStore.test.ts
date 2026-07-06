import { beforeEach, describe, expect, it } from 'vitest'
import { useAssetModalStore } from './useAssetModalStore'

beforeEach(() => {
  useAssetModalStore.setState({ assetId: null, mode: null })
})

describe('useAssetModalStore', () => {
  it('starts closed', () => {
    expect(useAssetModalStore.getState().assetId).toBeNull()
    expect(useAssetModalStore.getState().mode).toBeNull()
  })

  it('open sets the assetId and mode', () => {
    useAssetModalStore.getState().open('1', 'details')

    expect(useAssetModalStore.getState()).toMatchObject({ assetId: '1', mode: 'details' })
  })

  it('close resets assetId and mode', () => {
    useAssetModalStore.getState().open('1', 'edit')

    useAssetModalStore.getState().close()

    expect(useAssetModalStore.getState().assetId).toBeNull()
    expect(useAssetModalStore.getState().mode).toBeNull()
  })
})
