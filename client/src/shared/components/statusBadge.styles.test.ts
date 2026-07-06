import { describe, expect, it } from 'vitest'
import { statusBadgeStyleFor, statusDotStyleFor } from './statusBadge.styles'

describe('statusBadgeStyleFor / statusDotStyleFor', () => {
  it('returns styles for every color role, including neutral', () => {
    const roles = ['primary', 'success', 'tertiary', 'error', 'neutral'] as const

    for (const role of roles) {
      expect(statusBadgeStyleFor(role).backgroundColor).toBeTruthy()
      expect(statusDotStyleFor(role).backgroundColor).toBeTruthy()
    }
  })
})
