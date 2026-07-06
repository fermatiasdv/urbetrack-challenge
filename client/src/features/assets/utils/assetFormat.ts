/**
 * Display-formatting helpers for `AssetsTable`/`AssetModal`
 * (docs/feature/07-assets-page.md, "Decisiones propuestas" #4 y #7).
 * Pure functions, no React/store dependencies — unit-testable in isolation,
 * same pattern as `features/vehicles/utils/vehicleFormat.ts`.
 */
import type { StatusCardColorRole } from '../../../shared/components/statusSummaryCard.styles'
import type { AssetStatus, AssetType } from '../../../shared/types/domain.types'

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  BIN: 'Cesto',
  CONTAINER: 'Contenedor',
  BENCH: 'Banco'
}

const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  OK: 'OK',
  DAMAGED: 'Dañado',
  FULL: 'Completo',
  OUT_OF_SERVICE: 'Fuera de servicio'
}

/**
 * Maps each `AssetStatus` to the generic `colorRole` consumed by the shared
 * `StatusBadge`/`StatusSummaryCard`. Color palette confirmed in
 * docs/verified-scope.md §3.1/§10.2: `OK` verde (success), `FULL` rojo
 * (error), `DAMAGED` naranja (tertiary/warning), `OUT_OF_SERVICE` negro,
 * approximated as `'neutral'` (see docs/feature/07-assets-page.md, Gap 1 —
 * no dedicated "black" role exists in `designTokens`).
 */
const ASSET_STATUS_COLOR_ROLES: Record<AssetStatus, StatusCardColorRole> = {
  OK: 'success',
  FULL: 'error',
  DAMAGED: 'tertiary',
  OUT_OF_SERVICE: 'neutral'
}

const COORDINATE_DECIMALS = 4

export function assetTypeLabel(type: AssetType): string {
  return ASSET_TYPE_LABELS[type]
}

export function assetStatusLabel(status: AssetStatus): string {
  return ASSET_STATUS_LABELS[status]
}

export function assetStatusColorRole(status: AssetStatus): StatusCardColorRole {
  return ASSET_STATUS_COLOR_ROLES[status]
}

/**
 * Rounds a coordinate to 4 decimals for display (docs/scope.md disclaimer,
 * docs/verified-scope.md §4 y criterio de aceptación #3). Only affects
 * formatting, not the raw value kept in the store.
 */
export function formatCoordinate(value: number): string {
  return value.toFixed(COORDINATE_DECIMALS)
}
