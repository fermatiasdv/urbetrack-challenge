import type { JSX } from 'react'
import { Rectangle, Tooltip } from 'react-leaflet'
import { ZONES } from '../../../shared/geo/zones'
import type { SupportedZone } from '../../../shared/types/domain.types'

const ZONE_RECTANGLE_STYLE = { color: '#64748b', weight: 1, fillOpacity: 0.03 }

/**
 * Draws the 5 supported zone bounding boxes (`shared/geo/zones.ts`, MAP-00)
 * as a light visual reference on the map — not requested explicitly in the
 * business rules, included as visual/debug context per
 * docs/feature/10-maps-create.md, "Gap #6" of the original draft.
 */
export function ZoneLayer(): JSX.Element {
  return (
    <>
      {(Object.keys(ZONES) as SupportedZone[]).map((zone) => {
        const box = ZONES[zone]
        return (
          <Rectangle
            key={zone}
            bounds={[
              [box.minLat, box.minLng],
              [box.maxLat, box.maxLng]
            ]}
            pathOptions={ZONE_RECTANGLE_STYLE}
          >
            <Tooltip sticky>{zone}</Tooltip>
          </Rectangle>
        )
      })}
    </>
  )
}
