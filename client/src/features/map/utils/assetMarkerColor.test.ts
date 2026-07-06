import { describe, expect, it } from 'vitest'
import { assetMarkerColor } from './assetMarkerColor'

describe('assetMarkerColor', () => {
  it('returns green for OK', () => {
    expect(assetMarkerColor('OK')).toBe('#22c55e')
  })

  it('returns red for FULL', () => {
    expect(assetMarkerColor('FULL')).toBe('#ef4444')
  })

  it('returns orange for DAMAGED', () => {
    expect(assetMarkerColor('DAMAGED')).toBe('#f97316')
  })

  it('returns black for OUT_OF_SERVICE', () => {
    expect(assetMarkerColor('OUT_OF_SERVICE')).toBe('#000000')
  })
})
