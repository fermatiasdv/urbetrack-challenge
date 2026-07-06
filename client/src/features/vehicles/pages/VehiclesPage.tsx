import type { JSX } from 'react'
import { Skeleton } from '@radix-ui/themes'
import { useVehiclesQuery } from '../api/useVehiclesQuery'
import { VehicleStatusCards } from '../components/VehicleStatusCards'
import { VehiclesTable } from '../components/VehiclesTable'

export function VehiclesPage(): JSX.Element {
  const { isLoading } = useVehiclesQuery()

  return (
    <div>
      <h1>Vehículos</h1>
      {isLoading ? (
        <Skeleton height="140px" />
      ) : (
        <>
          <VehicleStatusCards />
          <VehiclesTable />
        </>
      )}
    </div>
  )
}
