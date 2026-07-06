import { beforeEach, describe, expect, it } from 'vitest'
import { useIncidentFiltersStore } from './useIncidentFiltersStore'
import { DEFAULT_INCIDENT_FILTERS } from '../utils/incidentFilters'

beforeEach(() => {
  useIncidentFiltersStore.setState(DEFAULT_INCIDENT_FILTERS)
})

describe('useIncidentFiltersStore', () => {
  it('starts with the default filters', () => {
    expect(useIncidentFiltersStore.getState()).toMatchObject(DEFAULT_INCIDENT_FILTERS)
  })

  it('setType updates only the type filter', () => {
    useIncidentFiltersStore.getState().setType('OVERFLOW')

    expect(useIncidentFiltersStore.getState().type).toBe('OVERFLOW')
  })

  it('setStatus updates only the status filter', () => {
    useIncidentFiltersStore.getState().setStatus('RESOLVED')

    expect(useIncidentFiltersStore.getState().status).toBe('RESOLVED')
  })

  it('setZoneIds updates only the zoneIds filter', () => {
    useIncidentFiltersStore.getState().setZoneIds(['1', '2'])

    expect(useIncidentFiltersStore.getState().zoneIds).toEqual(['1', '2'])
  })

  it('reset restores every field to its default, discarding all prior changes', () => {
    const state = useIncidentFiltersStore.getState()
    state.setType('DAMAGE')
    state.setStatus('IN_PROGRESS')
    state.setZoneIds(['1'])

    useIncidentFiltersStore.getState().reset()

    expect(useIncidentFiltersStore.getState()).toMatchObject(DEFAULT_INCIDENT_FILTERS)
  })
})
