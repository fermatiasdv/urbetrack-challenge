import type { JSX } from 'react'
import { Flex, Skeleton } from '@radix-ui/themes'
import { Plus } from 'lucide-react'
import { HeaderPage, type HeaderPageProps } from '../../../shared/components/HeaderPage'
import { StatusSummaryCards } from '../../../shared/components/StatusSummaryCards'
import { useIncidentsQuery } from '../../../shared/services/incidents/useIncidentsQuery'
import { useIncidentStatusCards } from '../hooks/useIncidentStatusCards'
import { useIncidentModalStore } from '../store/useIncidentModalStore'
import { IncidentModal } from '../components/IncidentModal'
import { IncidentsFilterBar } from '../components/IncidentsFilterBar'
import { IncidentsTable } from '../components/IncidentsTable'

/**
 * Opens the "Agregar Incidente" create modal
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #5).
 * Unlike `handleAddVehicle`/`handleAddAsset` (previously placeholders), this
 * feature is built together with the create-modal spec, so the button is
 * wired to the real modal from the start.
 */
function handleAddIncident(): void {
  useIncidentModalStore.getState().openCreate()
}

const incidentsHeaderProps: HeaderPageProps = {
  title: 'Incidentes',
  subtitle: 'Incidentes reportados en la vía pública',
  action: {
    label: 'Agregar Incidente',
    icon: Plus,
    onClick: handleAddIncident
  }
}

export function IncidentsPage(): JSX.Element {
  const { isLoading } = useIncidentsQuery()
  const cards = useIncidentStatusCards()

  return (
    <Flex direction="column" gap="5">
      <HeaderPage {...incidentsHeaderProps} />
      {isLoading ? (
        <Skeleton height="140px" />
      ) : (
        <>
          <StatusSummaryCards cards={cards} columns={{ initial: '1', sm: '2', lg: '4' }} />
          <IncidentsFilterBar />
          <IncidentsTable />
        </>
      )}
      <IncidentModal />
    </Flex>
  )
}
