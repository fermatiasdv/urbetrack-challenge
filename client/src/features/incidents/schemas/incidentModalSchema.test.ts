import { describe, expect, it } from 'vitest'
import { incidentModalFormSchema } from './incidentModalSchema'

describe('incidentModalFormSchema', () => {
  it.each(['REPORTED', 'IN_PROGRESS', 'RESOLVED'])('accepts a valid status: %s', (status) => {
    const result = incidentModalFormSchema.safeParse({ status })

    expect(result.success).toBe(true)
  })

  it('rejects an invalid status', () => {
    const result = incidentModalFormSchema.safeParse({ status: 'UNKNOWN' })

    expect(result.success).toBe(false)
  })
})
