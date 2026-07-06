import type { JSX } from 'react'
import { Marker, Tooltip } from 'react-leaflet'
import { useMapStore } from '../store/useMapStore'
import { assetMarkerColor } from '../utils/assetMarkerColor'
import { createColorMarkerIcon } from '../utils/createColorMarkerIcon'
import { AssetTooltip } from './AssetTooltip'
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
 * (CA-10/CA-11). If more than one incident is associated to the same asset
 * (unexpected with the current 40-incident fixed dataset), the first match
 * is used — see docs/feature/10-maps-create.md, "Nota abierta"/Gap #4 of the
 * original draft for the rationale.
 */
export function AssetMarkersLayer(): JSX.Element {
  const assets = useMapStore((state) => state.assets)
  const incidents = useMapStore((state) => state.incidents)

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
        </Marker>
      ))}
    </>
  )
}
