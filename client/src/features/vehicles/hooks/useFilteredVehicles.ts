import { useMemo } from 'react'
import { useVehiclesStore } from '../store/useVehiclesStore'
import { useVehicleFiltersStore } from '../store/useVehicleFiltersStore'
import { filterVehicles } from '../utils/vehicleFilters'
import type { Vehicle } from '../types/vehicle.types'

/**
 * Derives the filtered vehicle list from `useVehiclesStore` + `useVehicleFiltersStore`
 * (docs/feature/04-vehicles-filtertable.md, "Decisiones propuestas" #8). `VehiclesTable` reads
 * from this hook instead of `useVehiclesStore` directly, so it stays unaware of how filtering
 * works and the filtering logic stays testable on its own.
 */
export function useFilteredVehicles(): Vehicle[] {
  const vehicles = useVehiclesStore((state) => state.vehicles)
  const plate = useVehicleFiltersStore((state) => state.plate)
  const type = useVehicleFiltersStore((state) => state.type)
  const capacity = useVehicleFiltersStore((state) => state.capacity)
  const status = useVehicleFiltersStore((state) => state.status)
  const zoneIds = useVehicleFiltersStore((state) => state.zoneIds)

  return useMemo(
    () => filterVehicles(vehicles, { plate, type, capacity, status, zoneIds }),
    [vehicles, plate, type, capacity, status, zoneIds]
  )
}
