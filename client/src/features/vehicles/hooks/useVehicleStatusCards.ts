import { useMemo } from 'react'
import { AlertCircle, CheckCircle2, TrendingUp, Truck, Wrench } from 'lucide-react'
import type { StatusSummaryCardData } from '../../../shared/components/StatusSummaryCard'
import { formatPercentage } from '../../../shared/utils/formatPercentage'
import type { Vehicle, VehicleStatus } from '../../../shared/types/domain.types'
import { useVehiclesStore } from '../store/useVehiclesStore'

export type VehicleStatusKey = 'total' | 'active' | 'maintenance' | 'outOfService'

function countByStatus(vehicles: Vehicle[], status: VehicleStatus): number {
  return vehicles.filter((vehicle) => vehicle.status === status).length
}

/**
 * Pure builder for the 4 status cards from a vehicles list — replaces the 4
 * hardcoded mockup cards with data mapped dynamically over one array.
 * See docs/feature/02-vehicle-statuscard.md, "Decisiones propuestas" #1.
 *
 * Returns `StatusSummaryCardData` (docs/feature/07-assets-page.md,
 * "Generalización a `shared/`"): `iconBoxColorRole`/`secondaryTextColorRole`
 * replace the old vehicle-only `Record<VehicleStatusKey, ...>` color mapping,
 * so the shared `StatusSummaryCards` component can render this without
 * knowing anything about vehicles.
 */
export function buildVehicleStatusCards(
  vehicles: Vehicle[]
): StatusSummaryCardData<VehicleStatusKey>[] {
  const total = vehicles.length
  const activeCount = countByStatus(vehicles, 'ACTIVE')
  const maintenanceCount = countByStatus(vehicles, 'MAINTENANCE')
  const outOfServiceCount = countByStatus(vehicles, 'OUT_OF_SERVICE')

  return [
    {
      key: 'total',
      label: 'Total de Vehículos',
      value: total,
      icon: Truck,
      secondaryIcon: TrendingUp,
      secondaryText: `${formatPercentage(total, total)} de la flota registrada`,
      iconBoxColorRole: 'primary',
      secondaryTextColorRole: 'success'
    },
    {
      key: 'active',
      label: 'Activos',
      value: activeCount,
      icon: CheckCircle2,
      secondaryText: `${formatPercentage(activeCount, total)} del total de vehículos`,
      iconBoxColorRole: 'success',
      secondaryTextColorRole: 'muted'
    },
    {
      key: 'maintenance',
      label: 'En mantenimiento',
      value: maintenanceCount,
      icon: Wrench,
      secondaryText: `${formatPercentage(maintenanceCount, total)} agendados para reparar`,
      iconBoxColorRole: 'tertiary',
      secondaryTextColorRole: 'muted'
    },
    {
      key: 'outOfService',
      label: 'Fuera de servicio',
      value: outOfServiceCount,
      icon: AlertCircle,
      secondaryText: `${formatPercentage(outOfServiceCount, total)} prioridad crítica`,
      iconBoxColorRole: 'error',
      secondaryTextColorRole: 'error'
    }
  ]
}

/** Derives the 4 status cards from the vehicles store (memoized). */
export function useVehicleStatusCards(): StatusSummaryCardData<VehicleStatusKey>[] {
  const vehicles = useVehiclesStore((state) => state.vehicles)
  return useMemo(() => buildVehicleStatusCards(vehicles), [vehicles])
}
