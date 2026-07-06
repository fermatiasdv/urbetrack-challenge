import { describe, expect, it } from 'vitest'
import {
  assetMarkerColor,
  ASSET_STATUS_LEGEND_LABELS,
  ASSET_TYPE_LEGEND_LABELS
} from './assetMarkerColor'

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

describe('ASSET_STATUS_LEGEND_LABELS', () => {
  it('has a label for each AssetStatus', () => {
    expect(ASSET_STATUS_LEGEND_LABELS).toEqual({
      OK: 'OK',
      FULL: 'Completo',
      DAMAGED: 'Dañado',
      OUT_OF_SERVICE: 'Fuera de servicio'
    })
  })
})

describe('ASSET_TYPE_LEGEND_LABELS', () => {
  it('has a label for each AssetType', () => {
    expect(ASSET_TYPE_LEGEND_LABELS).toEqual({
      CONTAINER: 'Contenedor',
      BIN: 'Cesto',
      BENCH: 'Banco'
    })
  })
})
