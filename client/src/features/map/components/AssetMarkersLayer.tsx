import { useMemo, type JSX } from 'react'
import { Marker, Popup, Tooltip } from 'react-leaflet'
import { Text } from '@radix-ui/themes'
import { useMapStore } from '../store/useMapStore'
import { useVehiclesStore } from '../../vehicles/store/useVehiclesStore'
import { useAssignmentsStore } from '../../../shared/services/assignments/useAssignmentsStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import { assetMarkerColor } from '../utils/assetMarkerColor'
import { createColorMarkerIcon } from '../utils/createColorMarkerIcon'
import { eligibleVehiclesForAsset } from '../utils/vehicleEligibility'
import { AssetTooltip } from './AssetTooltip'
import { AssignmentControl } from './AssignmentControl'
import type { AssociatedIncident, GeoTaggedAsset } from '../types'

function findAssociatedIncident(
  asset: GeoTaggedAsset,
  incidents: AssociatedIncident[]
): AssociatedIncident | null {
  return incidents.find((incident) => incident.associatedAssetId === asset.id) ?? null
}

/**
 * One Leaflet marker per geo-tagged asset, colored by `AssetStatus`
 * (docs/feature/10-maps-create.md, CA-03). Shows `AssetTooltip` on hover
 * (CA-10/CA-11) and, on click, a `Popup` with the manual vehicle-assignment
 * control (docs/feature/maps-asign-vehicle.md §5) — but the control only
 * appears for assets in status `OK` (assignment gating). If more than one
 * incident is associated to the same asset (unexpected with the current
 * 40-incident fixed dataset), the first match is used.
 */
export function AssetMarkersLayer(): JSX.Element {
  const assets = useMapStore((state) => state.assets)
  const incidents = useMapStore((state) => state.incidents)
  const vehicles = useVehiclesStore((state) => state.vehicles)
  const assetToVehicle = useAssignmentsStore((state) => state.assetToVehicle)
  const assignAssetVehicle = useAssignmentsStore((state) => state.assignAssetVehicle)
  const clearAssetVehicle = useAssignmentsStore((state) => state.clearAssetVehicle)
  const { data: zones } = useZonesQuery()

  const zonesById = useMemo(
    () => new Map((zones ?? []).map((zone) => [zone.id, zone.name])),
    [zones]
  )

  return (
    <>
      {assets.map((asset) => (
        <Marker
          key={asset.id}
          position={[asset.lat, asset.lng]}
          icon={createColorMarkerIcon(assetMarkerColor(asset.status))}
        >
          <Tooltip>
            <AssetTooltip associatedIncident={findAssociatedIncident(asset, incidents)} />
          </Tooltip>
          <Popup>
            {asset.status === 'OK' ? (
              <AssignmentControl
                eligibleVehicles={eligibleVehiclesForAsset(asset, vehicles, zonesById)}
                assignedVehicleId={assetToVehicle[asset.id] ?? null}
                onAssign={(vehicleId) => assignAssetVehicle(asset.id, vehicleId)}
                onClear={() => clearAssetVehicle(asset.id)}
              />
            ) : (
              <Text as="p" size="2" color="gray">
                La asignación de vehículo requiere que el activo esté en estado OK.
              </Text>
            )}
          </Popup>
        </Marker>
      ))}
    </>
  )
}
