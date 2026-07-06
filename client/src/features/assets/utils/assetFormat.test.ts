import { describe, expect, it } from 'vitest'
import {
  assetStatusColorRole,
  assetStatusLabel,
  assetTypeLabel,
  formatCoordinate
} from './assetFormat'

describe('assetTypeLabel', () => {
  it('maps each AssetType to its Spanish label', () => {
    expect(assetTypeLabel('BIN')).toBe('Cesto')
    expect(assetTypeLabel('CONTAINER')).toBe('Contenedor')
    expect(assetTypeLabel('BENCH')).toBe('Banco')
  })
})

describe('assetStatusLabel', () => {
  it('maps each AssetStatus to its Spanish label', () => {
    expect(assetStatusLabel('OK')).toBe('OK')
    expect(assetStatusLabel('DAMAGED')).toBe('Dañado')
    expect(assetStatusLabel('FULL')).toBe('Completo')
    expect(assetStatusLabel('OUT_OF_SERVICE')).toBe('Fuera de servicio')
  })
})

describe('assetStatusColorRole', () => {
  it('maps each AssetStatus to its color role per docs/verified-scope.md §3.1', () => {
    expect(assetStatusColorRole('OK')).toBe('success')
    expect(assetStatusColorRole('FULL')).toBe('error')
    expect(assetStatusColorRole('DAMAGED')).toBe('tertiary')
    expect(assetStatusColorRole('OUT_OF_SERVICE')).toBe('neutral')
  })
})

describe('formatCoordinate', () => {
  it('rounds to 4 decimals', () => {
    expect(formatCoordinate(-34.60371234)).toBe('-34.6037')
    expect(formatCoordinate(-58.38)).toBe('-58.3800')
  })
})
