import { describe, expect, it } from 'vitest'
import { compareIncidentPriority, INCIDENT_TYPE_PRIORITY } from './incidentTypePriority'

describe('INCIDENT_TYPE_PRIORITY / compareIncidentPriority', () => {
  it('orders OVERFLOW > DAMAGE > LITTERING > OTHER', () => {
    expect(INCIDENT_TYPE_PRIORITY.OVERFLOW).toBeLessThan(INCIDENT_TYPE_PRIORITY.DAMAGE)
    expect(INCIDENT_TYPE_PRIORITY.DAMAGE).toBeLessThan(INCIDENT_TYPE_PRIORITY.LITTERING)
    expect(INCIDENT_TYPE_PRIORITY.LITTERING).toBeLessThan(INCIDENT_TYPE_PRIORITY.OTHER)
  })

  it('compareIncidentPriority sorts a mixed list into the expected order', () => {
    const types: Array<keyof typeof INCIDENT_TYPE_PRIORITY> = [
      'OTHER',
      'OVERFLOW',
      'LITTERING',
      'DAMAGE'
    ]

    expect([...types].sort(compareIncidentPriority)).toEqual([
      'OVERFLOW',
      'DAMAGE',
      'LITTERING',
      'OTHER'
    ])
  })
})
