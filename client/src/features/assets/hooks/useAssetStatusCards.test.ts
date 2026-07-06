import { describe, expect, it } from 'vitest'
import { buildAssetStatusCards } from './useAssetStatusCards'
import type { Asset } from '../../../shared/types/domain.types'

function asset(id: string, status: Asset['status']): Asset {
  return { id, type: 'BIN', status, lat: 0, lng: 0, address: `Address ${id}`, zoneId: '1' }
}

describe('buildAssetStatusCards', () => {
  it('returns 5 cards with counts and percentages computed from the assets list', () => {
    const assets: Asset[] = [
      asset('1', 'OK'),
      asset('2', 'OK'),
      asset('3', 'DAMAGED'),
      asset('4', 'FULL'),
      asset('5', 'OUT_OF_SERVICE')
    ]

    const cards = buildAssetStatusCards(assets)
    expect(cards).toHaveLength(5)

    const byKey = Object.fromEntries(cards.map((card) => [card.key, card]))

    expect(byKey.total?.value).toBe(5)
    expect(byKey.ok?.value).toBe(2)
    expect(byKey.damaged?.value).toBe(1)
    expect(byKey.full?.value).toBe(1)
    expect(byKey.outOfService?.value).toBe(1)

    expect(byKey.ok?.secondaryText).toContain('40%')
    expect(byKey.damaged?.secondaryText).toContain('20%')
    expect(byKey.full?.secondaryText).toContain('20%')
    expect(byKey.outOfService?.secondaryText).toContain('20%')
  })

  it('does not divide by zero when there are no assets', () => {
    const cards = buildAssetStatusCards([])
    const byKey = Object.fromEntries(cards.map((card) => [card.key, card]))

    expect(byKey.total?.value).toBe(0)
    expect(byKey.ok?.secondaryText).toContain('0%')
    expect(byKey.damaged?.secondaryText).toContain('0%')
    expect(byKey.full?.secondaryText).toContain('0%')
    expect(byKey.outOfService?.secondaryText).toContain('0%')
  })

  it('always adds ok + damaged + full + outOfService up to the total', () => {
    const assets: Asset[] = [
      asset('1', 'OK'),
      asset('2', 'DAMAGED'),
      asset('3', 'FULL'),
      asset('4', 'OUT_OF_SERVICE'),
      asset('5', 'OK')
    ]

    const cards = buildAssetStatusCards(assets)
    const byKey = Object.fromEntries(cards.map((card) => [card.key, card]))
    const sum =
      (byKey.ok?.value ?? 0) +
      (byKey.damaged?.value ?? 0) +
      (byKey.full?.value ?? 0) +
      (byKey.outOfService?.value ?? 0)

    expect(sum).toBe(byKey.total?.value)
  })
})
