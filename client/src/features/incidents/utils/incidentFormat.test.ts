import { describe, expect, it } from 'vitest'
import {
  formatIncidentDate,
  incidentStatusColorRole,
  incidentStatusLabel,
  incidentTypeLabel
} from './incidentFormat'

describe('incidentTypeLabel', () => {
  it('maps each IncidentType to its Spanish label', () => {
    expect(incidentTypeLabel('OVERFLOW')).toBe('Desbordamiento')
    expect(incidentTypeLabel('DAMAGE')).toBe('Daño')
    expect(incidentTypeLabel('LITTERING')).toBe('Basural')
    expect(incidentTypeLabel('OTHER')).toBe('Otro')
  })
})

describe('incidentStatusLabel', () => {
  it('maps each IncidentStatus to its Spanish label', () => {
    expect(incidentStatusLabel('REPORTED')).toBe('Reportado')
    expect(incidentStatusLabel('IN_PROGRESS')).toBe('En Progreso')
    expect(incidentStatusLabel('RESOLVED')).toBe('Resuelto')
  })
})

describe('incidentStatusColorRole', () => {
  it('maps each IncidentStatus to its color role', () => {
    expect(incidentStatusColorRole('REPORTED')).toBe('error')
    expect(incidentStatusColorRole('IN_PROGRESS')).toBe('tertiary')
    expect(incidentStatusColorRole('RESOLVED')).toBe('success')
  })
})

describe('formatIncidentDate', () => {
  it('formats an ISO date as dd/mm/aaaa hh:mm', () => {
    expect(formatIncidentDate('2024-01-15T10:30:00Z')).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)
  })
})
