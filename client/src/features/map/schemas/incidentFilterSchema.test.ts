import { describe, expect, it } from 'vitest'
import { IncidentFilterSchema } from './incidentFilterSchema'

describe('IncidentFilterSchema', () => {
  it('accepts a valid combination of statuses and types', () => {
    const result = IncidentFilterSchema.safeParse({
      statuses: ['REPORTED', 'RESOLVED'],
      types: ['OVERFLOW']
    })

    expect(result.success).toBe(true)
  })

  it('accepts empty arrays (nothing selected)', () => {
    expect(IncidentFilterSchema.safeParse({ statuses: [], types: [] }).success).toBe(true)
  })

  it('rejects an invalid type value', () => {
    const result = IncidentFilterSchema.safeParse({ statuses: [], types: ['UNKNOWN'] })

    expect(result.success).toBe(false)
  })

  it('rejects a missing field', () => {
    const result = IncidentFilterSchema.safeParse({ statuses: ['REPORTED'] })

    expect(result.success).toBe(false)
  })
})
