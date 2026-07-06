import type { JSX } from 'react'
import { Skeleton } from '@radix-ui/themes'
import { Plus } from 'lucide-react'
import { HeaderPage, type HeaderPageProps } from '../../../shared/components/HeaderPage'
import { useVehiclesQuery } from '../api/useVehiclesQuery'
import { useVehicleModalStore } from '../store/useVehicleModalStore'
import { VehicleModal } from '../components/VehicleModal'
import { VehicleStatusCards } from '../components/VehicleStatusCards'
import { VehiclesFilterBar } from '../components/VehiclesFilterBar'
import { VehiclesTable } from '../components/VehiclesTable'

/**
 * Opens the "Agregar Vehículo" create modal
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #5):
 * replaces the previous placeholder now that the modal supports a `'create'`
 * mode.
 */
function handleAddVehicle(): void {
  useVehicleModalStore.getState().openCreate()
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
      <VehicleModal />
    </div>
  )
}
