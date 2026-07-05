import { describe, expect, it } from 'vitest'
import { isAcceptablePrefix, isValidPlate } from './plate'

describe('isValidPlate', () => {
  it('accepts complete AAA111 plates', () => {
    expect(isValidPlate('ABC123')).toBe(true)
    expect(isValidPlate('abc123')).toBe(true)
  })

  it('accepts complete AA111AA plates', () => {
    expect(isValidPlate('AB123CD')).toBe(true)
    expect(isValidPlate('ab123cd')).toBe(true)
  })

  it('rejects incomplete or malformed plates', () => {
    expect(isValidPlate('')).toBe(false)
    expect(isValidPlate('ABC12')).toBe(false)
    expect(isValidPlate('ABC1234')).toBe(false)
    expect(isValidPlate('AB123C')).toBe(false)
    expect(isValidPlate('123ABC')).toBe(false)
    expect(isValidPlate('AAA1AA')).toBe(false)
  })
})

describe('isAcceptablePrefix', () => {
  it('accepts the empty string', () => {
    expect(isAcceptablePrefix('')).toBe(true)
  })

  it('accepts valid partial prefixes of either format', () => {
    expect(isAcceptablePrefix('A')).toBe(true)
    expect(isAcceptablePrefix('AB')).toBe(true)
    expect(isAcceptablePrefix('ABC')).toBe(true)
    expect(isAcceptablePrefix('ABC1')).toBe(true)
    expect(isAcceptablePrefix('ABC12')).toBe(true)
    expect(isAcceptablePrefix('ABC123')).toBe(true)
    expect(isAcceptablePrefix('AB123')).toBe(true)
    expect(isAcceptablePrefix('AB123C')).toBe(true)
    expect(isAcceptablePrefix('AB123CD')).toBe(true)
  })

  it('rejects prefixes that cannot lead to a valid plate', () => {
    expect(isAcceptablePrefix('1')).toBe(false)
    expect(isAcceptablePrefix('AB1C')).toBe(false)
    expect(isAcceptablePrefix('ABCD')).toBe(false)
    expect(isAcceptablePrefix('ABC1234')).toBe(false)
    expect(isAcceptablePrefix('AB123CDE')).toBe(false)
  })
})
