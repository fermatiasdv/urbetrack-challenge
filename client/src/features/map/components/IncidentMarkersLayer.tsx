import { useMemo, type JSX } from 'react'
import { Marker, Popup, Tooltip } from 'react-leaflet'
import { Text } from '@radix-ui/themes'
import { useMapStore } from '../store/useMapStore'
import { useVehiclesStore } from '../../vehicles/store/useVehiclesStore'
import { useAssignmentsStore } from '../../../shared/services/assignments/useAssignmentsStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import { INCIDENT_STATUS_COLORS } from '../constants/incidentStatusColors'
import { createColorMarkerIcon } from '../utils/createColorMarkerIcon'
import { eligibleVehiclesForIncident } from '../utils/vehicleEligibility'
import { AssignmentControl } from './AssignmentControl'

/**
 * One marker per incident **without** an associated asset
 * (`associatedAssetId === null`) — associated incidents are already
 * represented through their asset's marker/tooltip in `AssetMarkersLayer`,
 * so rendering them again here would duplicate the same point
 * (docs/feature/10-maps-create.md, CA-09). Colored by incident status, same
 * palette as the heatmap legend.
 *
 * On click, a `Popup` offers the manual vehicle-assignment control
 * (docs/feature/maps-asign-vehicle.md §5), gated to incidents in status
 * `REPORTED`. Independent incidents have no associated asset, so eligibility
 * carries no type restriction — any `ACTIVE` vehicle in the incident's zone.
 */
export function IncidentMarkersLayer(): JSX.Element {
  const incidents = useMapStore((state) => state.incidents)
  const vehicles = useVehiclesStore((state) => state.vehicles)
  const incidentToVehicle = useAssignmentsStore((state) => state.incidentToVehicle)
  const assignIncidentVehicle = useAssignmentsStore((state) => state.assignIncidentVehicle)
  const clearIncidentVehicle = useAssignmentsStore((state) => state.clearIncidentVehicle)
  const { data: zones } = useZonesQuery()

  const zonesById = useMemo(
    () => new Map((zones ?? []).map((zone) => [zone.id, zone.name])),
    [zones]
  )

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
          <Popup>
            {incident.status === 'REPORTED' ? (
              <AssignmentControl
                eligibleVehicles={eligibleVehiclesForIncident(incident, null, vehicles, zonesById)}
                assignedVehicleId={incidentToVehicle[incident.id] ?? null}
                onAssign={(vehicleId) => assignIncidentVehicle(incident.id, vehicleId)}
                onClear={() => clearIncidentVehicle(incident.id)}
              />
            ) : (
              <Text as="p" size="2" color="gray">
                La asignación de vehículo requiere que el incidente esté REPORTED.
              </Text>
            )}
          </Popup>
        </Marker>
      ))}
    </>
  )
}
