import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useReconcileAssignments } from './useReconcileAssignments'
import { useAssignmentsStore } from './useAssignmentsStore'
import { useAssetsStore } from '../assets/useAssetsStore'
import { useIncidentsStore } from '../incidents/useIncidentsStore'
import { useVehiclesStore } from '../../../features/vehicles/store/useVehiclesStore'
import type { Asset, Incident, Vehicle } from '../../types/domain.types'

const VEHICLE: Vehicle = {
  id: 'v1',
  plate: 'ABC123',
  type: 'TRUCK',
  status: 'ACTIVE',
  capacity: 5000,
  zoneId: '1'
}

const ASSET: Asset = {
  id: 'a1',
  type: 'CONTAINER',
  status: 'OK',
  lat: -34.6,
  lng: -58.38,
  address: 'Av. Corrientes 1',
  zoneId: '1'
}

const INCIDENT: Incident = {
  id: 'i1',
  type: 'OVERFLOW',
  status: 'REPORTED',
  description: 'x',
  lat: -34.6,
  lng: -58.38,
  zoneId: '1',
  createdAt: '2024-01-15T10:30:00Z'
}

beforeEach(() => {
  useAssignmentsStore.setState({ assetToVehicle: {}, incidentToVehicle: {} })
  useAssetsStore.setState({ assets: [ASSET], hasHydrated: true })
  useIncidentsStore.setState({ incidents: [INCIDENT], hasHydrated: true })
  useVehiclesStore.setState({ vehicles: [VEHICLE], hasHydrated: true })
})

describe('useReconcileAssignments', () => {
  it('prunes an assignment whose vehicle is no longer ACTIVE', async () => {
    useAssignmentsStore.setState({ assetToVehicle: { a1: 'v1' }, incidentToVehicle: {} })
    useVehiclesStore.setState({ vehicles: [{ ...VEHICLE, status: 'MAINTENANCE' }] })

    renderHook(() => useReconcileAssignments())

    await waitFor(() => expect(useAssignmentsStore.getState().assetToVehicle).toEqual({}))
  })

  it('prunes an incident assignment when the incident leaves REPORTED', async () => {
    useAssignmentsStore.setState({ assetToVehicle: {}, incidentToVehicle: { i1: 'v1' } })
    useIncidentsStore.setState({ incidents: [{ ...INCIDENT, status: 'RESOLVED' }] })

    renderHook(() => useReconcileAssignments())

    await waitFor(() => expect(useAssignmentsStore.getState().incidentToVehicle).toEqual({}))
  })

  it('leaves valid assignments untouched', async () => {
    useAssignmentsStore.setState({ assetToVehicle: { a1: 'v1' }, incidentToVehicle: { i1: 'v1' } })

    renderHook(() => useReconcileAssignments())

    // Give the effect a chance to run; a valid state must stay intact.
    await waitFor(() => expect(useAssignmentsStore.getState().assetToVehicle).toEqual({ a1: 'v1' }))
    expect(useAssignmentsStore.getState().incidentToVehicle).toEqual({ i1: 'v1' })
  })
})
