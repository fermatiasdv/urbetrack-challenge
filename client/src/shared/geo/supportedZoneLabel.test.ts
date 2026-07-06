import { describe, expect, it } from 'vitest'
import { SUPPORTED_ZONE_LABELS } from './supportedZoneLabel'
import { ZONES } from './zones'

describe('SUPPORTED_ZONE_LABELS', () => {
  it('covers exactly the 5 SupportedZone keys (CA-09)', () => {
    expect(Object.keys(SUPPORTED_ZONE_LABELS).sort()).toEqual(Object.keys(ZONES).sort())
  })

  it('maps each zone to its expected display name', () => {
    expect(SUPPORTED_ZONE_LABELS.MICROCENTRO).toBe('Microcentro')
    expect(SUPPORTED_ZONE_LABELS.RECOLETA).toBe('Recoleta')
    expect(SUPPORTED_ZONE_LABELS.PALERMO).toBe('Palermo')
    expect(SUPPORTED_ZONE_LABELS.BELGRANO).toBe('Belgrano')
    expect(SUPPORTED_ZONE_LABELS.CABALLITO).toBe('Caballito')
  })
})
