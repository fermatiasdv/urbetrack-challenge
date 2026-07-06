import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useFilteredIncidents } from './useFilteredIncidents'
import { useIncidentsStore } from '../store/useIncidentsStore'
import { useIncidentFiltersStore } from '../store/useIncidentFiltersStore'
import { DEFAULT_INCIDENT_FILTERS } from '../utils/incidentFilters'
import type { Incident } from '../../../shared/types/domain.types'

const OVERFLOW_INCIDENT: Incident = {
  id: '1',
  type: 'OVERFLOW',
  status: 'REPORTED',
  description: 'Contenedor desbordado',
  lat: -34.6037,
  lng: -58.3816,
  zoneId: '1',
  createdAt: '2024-01-15T10:30:00Z'
}
const DAMAGE_INCIDENT: Incident = {
  id: '2',
  type: 'DAMAGE',
  status: 'RESOLVED',
  description: 'Banco roto',
  lat: -34.5875,
  lng: -58.4205,
  zoneId: '2',
  createdAt: '2024-01-14T14:20:00Z'
}

const INCIDENTS: Incident[] = [OVERFLOW_INCIDENT, DAMAGE_INCIDENT]

beforeEach(() => {
  useIncidentsStore.setState({ incidents: INCIDENTS, hasHydrated: true })
  useIncidentFiltersStore.setState(DEFAULT_INCIDENT_FILTERS)
})

describe('useFilteredIncidents', () => {
  it('returns every incident when filters are the defaults', () => {
    const { result } = renderHook(() => useFilteredIncidents())

    expect(result.current).toEqual(INCIDENTS)
  })

  it('reflects the current filters from useIncidentFiltersStore', () => {
    useIncidentFiltersStore.getState().setType('DAMAGE')

    const { result } = renderHook(() => useFilteredIncidents())

    expect(result.current).toEqual([DAMAGE_INCIDENT])
  })

  it('updates when the filters store changes after the initial render', () => {
    const { result } = renderHook(() => useFilteredIncidents())
    expect(result.current).toEqual(INCIDENTS)

    act(() => {
      useIncidentFiltersStore.getState().setStatus('RESOLVED')
    })

    expect(result.current).toEqual([DAMAGE_INCIDENT])
  })
})
