import { useMemo } from 'react'
import { AlertTriangle, Ban, CheckCircle2, Package, Wrench } from 'lucide-react'
import type { StatusSummaryCardData } from '../../../shared/components/StatusSummaryCard'
import { formatPercentage } from '../../../shared/utils/formatPercentage'
import type { Asset, AssetStatus } from '../../../shared/types/domain.types'
import { useAssetsStore } from '../store/useAssetsStore'

export type AssetStatusKey = 'total' | 'ok' | 'damaged' | 'full' | 'outOfService'

function countByStatus(assets: Asset[], status: AssetStatus): number {
  return assets.filter((asset) => asset.status === status).length
}

/**
 * Pure builder for the 5 asset status cards (Total + OK/Dañados/Completos/Fuera de servicio),
 * mirroring `buildVehicleStatusCards` (docs/feature/07-assets-page.md, "Decisiones propuestas" #3).
 */
export function buildAssetStatusCards(assets: Asset[]): StatusSummaryCardData<AssetStatusKey>[] {
  const total = assets.length
  const okCount = countByStatus(assets, 'OK')
  const damagedCount = countByStatus(assets, 'DAMAGED')
  const fullCount = countByStatus(assets, 'FULL')
  const outOfServiceCount = countByStatus(assets, 'OUT_OF_SERVICE')

  return [
    {
      key: 'total',
      label: 'Total de Activos',
      value: total,
      icon: Package,
      secondaryText: `${formatPercentage(total, total)} del total registrado`,
      iconBoxColorRole: 'primary',
      secondaryTextColorRole: 'muted'
    },
    {
      key: 'ok',
      label: 'OK',
      value: okCount,
      icon: CheckCircle2,
      secondaryText: `${formatPercentage(okCount, total)} del total de activos`,
      iconBoxColorRole: 'success',
      secondaryTextColorRole: 'muted'
    },
    {
      key: 'damaged',
      label: 'Dañados',
      value: damagedCount,
      icon: Wrench,
      secondaryText: `${formatPercentage(damagedCount, total)} requieren reparación`,
      iconBoxColorRole: 'tertiary',
      secondaryTextColorRole: 'muted'
    },
    {
      key: 'full',
      label: 'Completos',
      value: fullCount,
      icon: AlertTriangle,
      secondaryText: `${formatPercentage(fullCount, total)} requieren recolección`,
      iconBoxColorRole: 'error',
      secondaryTextColorRole: 'error'
    },
    {
      key: 'outOfService',
      label: 'Fuera de servicio',
      value: outOfServiceCount,
      icon: Ban,
      secondaryText: `${formatPercentage(outOfServiceCount, total)} dados de baja`,
      iconBoxColorRole: 'neutral',
      secondaryTextColorRole: 'neutral'
    }
  ]
}

/** Derives the 5 status cards from the assets store (memoized). */
export function useAssetStatusCards(): StatusSummaryCardData<AssetStatusKey>[] {
  const assets = useAssetsStore((state) => state.assets)
  return useMemo(() => buildAssetStatusCards(assets), [assets])
}
