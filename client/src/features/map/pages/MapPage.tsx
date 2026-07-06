import type { JSX } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Flex, Heading, Skeleton } from '@radix-ui/themes'
import { useSyncMapStore } from '../hooks/useSyncMapStore'
import { useMapStore } from '../store/useMapStore'
import { ZoneLayer } from '../components/ZoneLayer'
import { AssetMarkersLayer } from '../components/AssetMarkersLayer'
import { IncidentMarkersLayer } from '../components/IncidentMarkersLayer'
import { HeatmapLayer } from '../components/HeatmapLayer'
import { HeatmapLegend } from '../components/HeatmapLegend'
import { HeatmapFilters } from '../components/HeatmapFilters'
import { MapEntityTabs } from '../components/MapEntityTabs'
import {
  mapContainerStyle,
  mapLayoutStyle,
  heatmapSidebarStyle
} from '../components/mapPage.styles'

// Centered roughly on `BA_BOUNDS` (api/src/utils/geo.ts), covering the 5
// supported zones (shared/geo/zones.ts).
const MAP_CENTER: [number, number] = [-34.6155, -58.433]
const MAP_ZOOM = 12

/**
 * Map screen (docs/feature/10-maps-create.md). Note: `AvailabilityAlert` is
 * intentionally absent here — it is deferred to
 * docs/feature/11-vehicle-assignment-engine.md (not yet approved).
 */
export function MapPage(): JSX.Element {
  const { isLoading } = useSyncMapStore()
  const heatmapEnabled = useMapStore((state) => state.heatmapEnabled)
  const toggleHeatmap = useMapStore((state) => state.toggleHeatmap)

  return (
    <div>
      <Flex justify="between" align="center" mb="4">
        <Heading as="h1">Mapa</Heading>
        <label>
          <input type="checkbox" checked={heatmapEnabled} onChange={toggleHeatmap} /> Mapa de calor
        </label>
      </Flex>

      {isLoading ? (
        <Skeleton height="520px" />
      ) : (
        <Flex style={mapLayoutStyle} direction="column" gap="4">
          <Flex style={mapLayoutStyle}>
            <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} style={mapContainerStyle}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ZoneLayer />
              <AssetMarkersLayer />
              <IncidentMarkersLayer />
              {heatmapEnabled ? <HeatmapLayer /> : null}
            </MapContainer>

            {heatmapEnabled ? (
              <Flex direction="column" gap="4" style={heatmapSidebarStyle}>
                <HeatmapFilters />
                <HeatmapLegend />
              </Flex>
            ) : null}
          </Flex>

          <MapEntityTabs />
        </Flex>
      )}
    </div>
  )
}
