import type { JSX } from 'react'
import { Marker, Tooltip } from 'react-leaflet'
import { Text } from '@radix-ui/themes'
import { useMapStore } from '../store/useMapStore'
import { INCIDENT_STATUS_COLORS } from '../constants/incidentStatusColors'
import { createColorMarkerIcon } from '../utils/createColorMarkerIcon'

/**
 * One marker per incident **without** an associated asset
 * (`associatedAssetId === null`) — associated incidents are already
 * represented through their asset's marker/tooltip in `AssetMarkersLayer`,
 * so rendering them again here would duplicate the same point
 * (docs/feature/10-maps-create.md, CA-09). Colored by incident status, same
 * palette as the heatmap legend.
 */
export function IncidentMarkersLayer(): JSX.Element {
  const incidents = useMapStore((state) => state.incidents)
  const independentIncidents = incidents.filter((incident) => incident.associatedAssetId === null)

  return (
    <>
      {independentIncidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.lat, incident.lng]}
          icon={createColorMarkerIcon(INCIDENT_STATUS_COLORS[incident.status])}
        >
          <Tooltip>
            <Text size="2">
              <Text as="div">Tipo de incidente: {incident.type}</Text>
              <Text as="div">Estado del incidente: {incident.status}</Text>
            </Text>
          </Tooltip>
        </Marker>
      ))}
    </>
  )
}
