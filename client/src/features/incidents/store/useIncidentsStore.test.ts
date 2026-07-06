import { beforeEach, describe, expect, it } from 'vitest'
import { useIncidentsStore } from './useIncidentsStore'
import type { Incident } from '../../../shared/types/domain.types'

const INCIDENTS: Incident[] = [
  {
    id: '1',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'a',
    lat: -34.6,
    lng: -58.3,
    zoneId: '1',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'DAMAGE',
    status: 'IN_PROGRESS',
    description: 'b',
    lat: -34.5,
    lng: -58.4,
    zoneId: '2',
    createdAt: '2024-01-14T10:30:00Z'
  }
]

beforeEach(() => {
  useIncidentsStore.setState({ incidents: [], hasHydrated: false })
})

describe('useIncidentsStore.setIncidents', () => {
  it('marks the store as hydrated', () => {
    expect(useIncidentsStore.getState().hasHydrated).toBe(false)

    useIncidentsStore.getState().setIncidents(INCIDENTS)

    expect(useIncidentsStore.getState().hasHydrated).toBe(true)
  })
})

describe('useIncidentsStore.addIncident', () => {
  it('appends the new incident', () => {
    useIncidentsStore.getState().setIncidents(INCIDENTS)
    const created: Incident = {
      id: '3',
      type: 'OTHER',
      status: 'REPORTED',
      description: 'c',
      lat: 0,
      lng: 0,
      zoneId: '1',
      createdAt: '2024-01-16T00:00:00Z'
    }

    useIncidentsStore.getState().addIncident(created)

    expect(useIncidentsStore.getState().incidents).toEqual([...INCIDENTS, created])
  })
})

describe('useIncidentsStore.removeIncident', () => {
  it('removes only the incident matching the given id', () => {
    useIncidentsStore.getState().setIncidents(INCIDENTS)

    useIncidentsStore.getState().removeIncident('1')

    expect(useIncidentsStore.getState().incidents).toEqual([INCIDENTS[1]])
  })

  it('is a no-op when the id does not match any incident', () => {
    useIncidentsStore.getState().setIncidents(INCIDENTS)

    useIncidentsStore.getState().removeIncident('999')

    expect(useIncidentsStore.getState().incidents).toEqual(INCIDENTS)
  })
})

describe('useIncidentsStore.updateIncident', () => {
  it('merges the given changes into the matching incident only', () => {
    useIncidentsStore.getState().setIncidents(INCIDENTS)

    useIncidentsStore.getState().updateIncident('1', { status: 'RESOLVED' })

    expect(useIncidentsStore.getState().incidents).toEqual([
      { ...INCIDENTS[0], status: 'RESOLVED' },
      INCIDENTS[1]
    ])
  })
})
