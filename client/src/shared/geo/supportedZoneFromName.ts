import type { SupportedZone } from '../types/domain.types'

const SUPPORTED_ZONES: SupportedZone[] = [
  'MICROCENTRO',
  'PALERMO',
  'RECOLETA',
  'BELGRANO',
  'CABALLITO'
]

// Unicode combining diacritical marks (U+0300–U+036F), left over after an
// NFD normalization — stripped so `"Belgrano"`/`"Bélgrano"` normalize alike.
const COMBINING_MARKS = /[̀-ͯ]/g

/**
 * Normalizes a backend zone **name** (`Zone.name`, e.g. `"Microcentro"`) to its
 * `SupportedZone` (e.g. `"MICROCENTRO"`), or `null` if it doesn't match any of
 * the 5 supported zones (docs/feature/maps-asign-vehicle.md §4).
 *
 * A vehicle carries a `zoneId`; an asset/incident carries a coordinate-derived
 * `derivedZone: SupportedZone` (MAP-00). To compare them for the "same zone"
 * assignment rule, the vehicle's `zoneId` is first translated to its name via
 * `zoneNameFor`, then normalized here — accents stripped and upper-cased — so
 * `"Microcentro"` and `"MICROCENTRO"` reconcile without depending on raw ids
 * (docs/verified-scope.md §10.5).
 */
export function supportedZoneFromName(name: string): SupportedZone | null {
  const normalized = name.normalize('NFD').replace(COMBINING_MARKS, '').trim().toUpperCase()

  return SUPPORTED_ZONES.find((zone) => zone === normalized) ?? null
}
