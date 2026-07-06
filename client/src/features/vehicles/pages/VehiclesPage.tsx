import type { JSX } from 'react'
import { Skeleton } from '@radix-ui/themes'
import { Plus } from 'lucide-react'
import { HeaderPage, type HeaderPageProps } from '../../../shared/components/HeaderPage'
import { useVehiclesQuery } from '../api/useVehiclesQuery'
import { VehicleStatusCards } from '../components/VehicleStatusCards'
import { VehiclesFilterBar } from '../components/VehiclesFilterBar'
import { VehiclesTable } from '../components/VehiclesTable'

/**
 * Placeholder: el modal de alta de vehículo es un spec futuro
 * (docs/feature/05-vehicles-header.md, "Fuera de alcance").
 */
function handleAddVehicle(): void {
  console.info('Agregar Vehículo: modal de alta pendiente de un spec futuro')
}

const vehiclesHeaderProps: HeaderPageProps = {
  title: 'Vehículos',
  subtitle: 'Disponibilidad de los vehículos en tiempo real',
  action: {
    label: 'Agregar Vehículo',
    icon: Plus,
    onClick: handleAddVehicle
  }
}

export function VehiclesPage(): JSX.Element {
  const { isLoading } = useVehiclesQuery()

  return (
    <div>
      <HeaderPage {...vehiclesHeaderProps} />
      {isLoading ? (
        <Skeleton height="140px" />
      ) : (
        <>
          <VehicleStatusCards />
          <VehiclesFilterBar />
          <VehiclesTable />
        </>
      )}
    </div>
  )
}
