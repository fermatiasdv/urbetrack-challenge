import { describe, expect, it } from 'vitest'
import { designTokens } from './tokens'

describe('designTokens', () => {
  it('exposes the expected brand name', () => {
    expect(designTokens.name).toBe('Logistics & Asset Management System')
  })

  it('exposes the semantic color tokens', () => {
    expect(designTokens.colors.primary).toBe('#005dac')
    expect(designTokens.colors.success).toBe('#146c2e')
    expect(designTokens.colors.tertiary).toBe('#944700')
    expect(designTokens.colors.error).toBe('#ba1a1a')
  })

  it('exposes typography, rounded and spacing tokens', () => {
    expect(designTokens.typography.bodyMd.fontFamily).toBe("'Poppins', Arial, sans-serif")
    expect(designTokens.typography.headlineLg.fontSize).toBe('34px')
    expect(designTokens.rounded.DEFAULT).toBe('0.25rem')
    expect(designTokens.spacing.md).toBe('16px')
  })
})
