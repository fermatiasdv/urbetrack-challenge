import type { SupportedZone } from '../types/domain.types'

/**
 * Display name for each `SupportedZone` (docs/feature/12-availability-alert.md,
 * revisión 2026-07-06). Inverse of `supportedZoneFromName` — this one goes
 * `SupportedZone -> nombre visible`, using the same 5 names confirmed against
 * the backend in `docs/verified-scope.md` §2.1.
 */
export const SUPPORTED_ZONE_LABELS: Record<SupportedZone, string> = {
  MICROCENTRO: 'Microcentro',
  RECOLETA: 'Recoleta',
  PALERMO: 'Palermo',
  BELGRANO: 'Belgrano',
  CABALLITO: 'Caballito'
}
