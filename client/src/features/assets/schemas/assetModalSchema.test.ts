import { describe, expect, it } from 'vitest'
import { assetModalFormSchema } from './assetModalSchema'

describe('assetModalFormSchema', () => {
  it.each(['OK', 'DAMAGED', 'FULL', 'OUT_OF_SERVICE'])('accepts a valid status: %s', (status) => {
    const result = assetModalFormSchema.safeParse({ status })

    expect(result.success).toBe(true)
  })

  it('rejects an invalid status', () => {
    const result = assetModalFormSchema.safeParse({ status: 'UNKNOWN' })

    expect(result.success).toBe(false)
  })
})
