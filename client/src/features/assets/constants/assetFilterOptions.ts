/**
 * Static filter option lists for `AssetsFilterBar`
 * (docs/feature/07-assets-page.md, "Decisiones propuestas" #6). Same pattern
 * as `features/vehicles/constants/vehicleFilterOptions.ts`: derived from the
 * real `AssetType`/`AssetStatus` unions and reusing
 * `assetTypeLabel`/`assetStatusLabel` (`utils/assetFormat.ts`) for their
 * labels, so they never drift from the rest of the UI if the backend enum
 * changes. Zone options are NOT here — they come from the shared
 * `useZonesQuery` (dynamic, backend-driven).
 */
import type { AssetStatus, AssetType } from '../../../shared/types/domain.types'
import { assetStatusLabel, assetTypeLabel } from '../utils/assetFormat'

export type AssetTypeFilter = 'ALL' | AssetType
export type AssetStatusFilter = 'ALL' | AssetStatus

interface FilterOption<TValue extends string> {
  value: TValue
  label: string
}

const ASSET_TYPES: AssetType[] = ['BIN', 'CONTAINER', 'BENCH']
const ASSET_STATUSES: AssetStatus[] = ['OK', 'DAMAGED', 'FULL', 'OUT_OF_SERVICE']

export const ASSET_TYPE_FILTER_OPTIONS: FilterOption<AssetTypeFilter>[] = [
  { value: 'ALL', label: 'Todos los tipos' },
  ...ASSET_TYPES.map((type) => ({ value: type, label: assetTypeLabel(type) }))
]

export const ASSET_STATUS_FILTER_OPTIONS: FilterOption<AssetStatusFilter>[] = [
  { value: 'ALL', label: 'Todos los estados' },
  ...ASSET_STATUSES.map((status) => ({ value: status, label: assetStatusLabel(status) }))
]
