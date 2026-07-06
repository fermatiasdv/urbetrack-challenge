import { describe, expect, it } from 'vitest'
import { supportedZoneFromName } from './supportedZoneFromName'

describe('supportedZoneFromName', () => {
  it('maps the exact backend zone names to their SupportedZone', () => {
    expect(supportedZoneFromName('Microcentro')).toBe('MICROCENTRO')
    expect(supportedZoneFromName('Palermo')).toBe('PALERMO')
    expect(supportedZoneFromName('Recoleta')).toBe('RECOLETA')
    expect(supportedZoneFromName('Belgrano')).toBe('BELGRANO')
    expect(supportedZoneFromName('Caballito')).toBe('CABALLITO')
  })

  it('is case-insensitive and trims surrounding whitespace', () => {
    expect(supportedZoneFromName('  palermo  ')).toBe('PALERMO')
    expect(supportedZoneFromName('MICROCENTRO')).toBe('MICROCENTRO')
  })

  it('strips accents before matching', () => {
    expect(supportedZoneFromName('Bélgrano')).toBe('BELGRANO')
  })

  it('returns null for a name outside the 5 supported zones', () => {
    expect(supportedZoneFromName('Villa Crespo')).toBeNull()
    expect(supportedZoneFromName('')).toBeNull()
  })
})
