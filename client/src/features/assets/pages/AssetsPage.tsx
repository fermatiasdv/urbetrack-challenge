import type { JSX } from 'react'
import { Flex, Skeleton } from '@radix-ui/themes'
import { Plus } from 'lucide-react'
import { HeaderPage, type HeaderPageProps } from '../../../shared/components/HeaderPage'
import { StatusSummaryCards } from '../../../shared/components/StatusSummaryCards'
import { useAssetsQuery } from '../../../shared/services/assets/useAssetsQuery'
import { useAssetStatusCards } from '../hooks/useAssetStatusCards'
import { useAssetModalStore } from '../store/useAssetModalStore'
import { AssetModal } from '../components/AssetModal'
import { AssetsFilterBar } from '../components/AssetsFilterBar'
import { AssetsTable } from '../components/AssetsTable'

/**
 * Opens the "Agregar Activo" create modal
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #5):
 * replaces the previous placeholder now that the modal supports a `'create'`
 * mode.
 */
function handleAddAsset(): void {
  useAssetModalStore.getState().openCreate()
}

const assetsHeaderProps: HeaderPageProps = {
  title: 'Activos',
  subtitle: 'Estado de los activos urbanos en tiempo real',
  action: {
    label: 'Agregar Activo',
    icon: Plus,
    onClick: handleAddAsset
  }
}

export function AssetsPage(): JSX.Element {
  const { isLoading } = useAssetsQuery()
  const cards = useAssetStatusCards()

  return (
    <Flex direction="column" gap="5">
      <HeaderPage {...assetsHeaderProps} />
      {isLoading ? (
        <Skeleton height="140px" />
      ) : (
        <>
          <StatusSummaryCards cards={cards} columns={{ initial: '1', sm: '2', lg: '5' }} />
          <AssetsFilterBar />
          <AssetsTable />
        </>
      )}
      <AssetModal />
    </Flex>
  )
}
