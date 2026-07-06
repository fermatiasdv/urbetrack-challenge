import { useMemo } from 'react'
import { AlertCircle, CheckCircle2, TrendingUp, Truck, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Vehicle, VehicleStatus } from '../types/vehicle.types'
import { useVehiclesStore } from '../store/useVehiclesStore'

export type VehicleStatusKey = 'total' | 'active' | 'maintenance' | 'outOfService'

export interface VehicleStatusCardData {
  key: VehicleStatusKey
  label: string
  value: number
  icon: LucideIcon
  secondaryIcon?: LucideIcon
  secondaryText: string
}

/**
 * One decimal when the result isn't an integer (`18.5%`), no decimals when it
 * is (`69%`), `0%` when there is nothing to divide by.
 * See docs/feature/02-vehicle-statuscard.md, decisiones #1 y #7.
 */
export function formatPercentage(count: number, total: number): string {
  if (total === 0) return '0%'
  const percentage = Math.round((count / total) * 1000) / 10
  return `${percentage}%`
}

function countByStatus(vehicles: Vehicle[], status: VehicleStatus): number {
  return vehicles.filter((vehicle) => vehicle.status === status).length
}

/**
 * Pure builder for the 4 status cards from a vehicles list — replaces the 4
 * hardcoded mockup cards with data mapped dynamically over one array.
 * See docs/feature/02-vehicle-statuscard.md, "Decisiones propuestas" #1.
 */
export function buildVehicleStatusCards(vehicles: Vehicle[]): VehicleStatusCardData[] {
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
      secondaryText: `${formatPercentage(total, total)} de la flota registrada`
    },
    {
      key: 'active',
      label: 'Activos',
      value: activeCount,
      icon: CheckCircle2,
      secondaryText: `${formatPercentage(activeCount, total)} del total de vehículos`
    },
    {
      key: 'maintenance',
      label: 'En mantenimiento',
      value: maintenanceCount,
      icon: Wrench,
      secondaryText: `${formatPercentage(maintenanceCount, total)} agendados para reparar`
    },
    {
      key: 'outOfService',
      label: 'Fuera de servicio',
      value: outOfServiceCount,
      icon: AlertCircle,
      secondaryText: `${formatPercentage(outOfServiceCount, total)} prioridad crítica`
    }
  ]
}

/** Derives the 4 status cards from the vehicles store (memoized). */
export function useVehicleStatusCards(): VehicleStatusCardData[] {
  const vehicles = useVehiclesStore((state) => state.vehicles)
  return useMemo(() => buildVehicleStatusCards(vehicles), [vehicles])
}
