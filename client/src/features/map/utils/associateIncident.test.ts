import { describe, expect, it } from 'vitest'
import { associateIncidents } from './associateIncident'
import type { GeoTaggedAsset, GeoTaggedIncident } from '../types'

function makeAsset(overrides: Partial<GeoTaggedAsset>): GeoTaggedAsset {
  return {
    id: 'asset-1',
    type: 'BIN',
    status: 'OK',
    lat: -34.6037,
    lng: -58.3816,
    address: 'Av. Corrientes 1',
    zoneId: '1',
    derivedZone: 'MICROCENTRO',
    ...overrides
  }
}

function makeIncident(overrides: Partial<GeoTaggedIncident>): GeoTaggedIncident {
  return {
    id: 'incident-1',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'Contenedor desbordado',
    lat: -34.6037,
    lng: -58.3816,
    zoneId: '1',
    createdAt: '2024-01-15T10:30:00Z',
    derivedZone: 'MICROCENTRO',
    ...overrides
  }
}

describe('associateIncidents', () => {
  it('associates an OVERFLOW incident to a BIN within 100m and adopts its coordinates', () => {
    const asset = makeAsset({ lat: -34.6, lng: -58.38 })
    const incident = makeIncident({ lat: -34.6001, lng: -58.3801 })

    const [result] = associateIncidents([incident], [asset])

    expect(result?.associatedAssetId).toBe(asset.id)
    expect(result?.lat).toBe(asset.lat)
    expect(result?.lng).toBe(asset.lng)
  })

  it('associates an OVERFLOW incident to a CONTAINER within 100m', () => {
    const asset = makeAsset({ type: 'CONTAINER', lat: -34.6, lng: -58.38 })
    const incident = makeIncident({ lat: -34.6001, lng: -58.3801 })

    const [result] = associateIncidents([incident], [asset])

    expect(result?.associatedAssetId).toBe(asset.id)
  })

  it('does not associate when the nearest compatible asset is farther than 100m', () => {
    const asset = makeAsset({ lat: -34.65, lng: -58.42 })
    const incident = makeIncident({ lat: -34.6, lng: -58.38 })

    const [result] = associateIncidents([incident], [asset])

    expect(result?.associatedAssetId).toBeNull()
    expect(result?.lat).toBe(incident.lat)
    expect(result?.lng).toBe(incident.lng)
  })

  it('never associates to a BENCH, even within range', () => {
    const asset = makeAsset({ type: 'BENCH', lat: -34.6, lng: -58.38 })
    const incident = makeIncident({ lat: -34.6001, lng: -58.3801 })

    const [result] = associateIncidents([incident], [asset])

    expect(result?.associatedAssetId).toBeNull()
  })

  it('never associates a non-OVERFLOW incident, even with a BIN nearby', () => {
    const asset = makeAsset({ lat: -34.6, lng: -58.38 })
    const incident = makeIncident({ type: 'DAMAGE', lat: -34.6001, lng: -58.3801 })

    const [result] = associateIncidents([incident], [asset])

    expect(result?.associatedAssetId).toBeNull()
  })

  it('picks the closest of multiple compatible candidates', () => {
    const near = makeAsset({ id: 'near', lat: -34.6002, lng: -58.3802 })
    const far = makeAsset({ id: 'far', lat: -34.6008, lng: -58.3808 })
    const incident = makeIncident({ lat: -34.6, lng: -58.38 })

    const [result] = associateIncidents([incident], [far, near])

    expect(result?.associatedAssetId).toBe('near')
  })
})
