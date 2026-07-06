import { beforeEach, describe, expect, it } from 'vitest'
import { useIncidentModalStore } from './useIncidentModalStore'

beforeEach(() => {
  useIncidentModalStore.setState({ incidentId: null, mode: null })
})

describe('useIncidentModalStore', () => {
  it('starts closed', () => {
    expect(useIncidentModalStore.getState().incidentId).toBeNull()
    expect(useIncidentModalStore.getState().mode).toBeNull()
  })

  it('open sets the incidentId and mode', () => {
    useIncidentModalStore.getState().open('1', 'details')

    expect(useIncidentModalStore.getState()).toMatchObject({ incidentId: '1', mode: 'details' })
  })

  it('openCreate sets mode to create with no incidentId', () => {
    useIncidentModalStore.getState().openCreate()

    expect(useIncidentModalStore.getState()).toMatchObject({ incidentId: null, mode: 'create' })
  })

  it('close resets incidentId and mode', () => {
    useIncidentModalStore.getState().open('1', 'edit')

    useIncidentModalStore.getState().close()

    expect(useIncidentModalStore.getState().incidentId).toBeNull()
    expect(useIncidentModalStore.getState().mode).toBeNull()
  })
})
