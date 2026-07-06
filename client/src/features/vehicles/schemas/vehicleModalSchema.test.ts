import { describe, expect, it } from 'vitest'
import { vehicleModalFormSchema } from './vehicleModalSchema'

describe('vehicleModalFormSchema', () => {
  it.each(['ABC123', 'AB123CD'])('accepts a valid plate: %s', (plate) => {
    const result = vehicleModalFormSchema.safeParse({ plate })

    expect(result.success).toBe(true)
  })

  it('normalizes a lowercase plate to uppercase', () => {
    const result = vehicleModalFormSchema.safeParse({ plate: 'abc123' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.plate).toBe('ABC123')
    }
  })

  it('trims surrounding whitespace before validating', () => {
    const result = vehicleModalFormSchema.safeParse({ plate: '  ABC123  ' })

    expect(result.success).toBe(true)
  })

  it.each(['AB12CD', 'ABCDEF', '123456', 'ABC12345', 'AB123C', ''])(
    'rejects an invalid plate: %s',
    (plate) => {
      const result = vehicleModalFormSchema.safeParse({ plate })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Formato de placa inválido')
      }
    }
  )
})
