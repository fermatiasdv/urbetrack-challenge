import type { JSX } from 'react'
import { Skeleton } from '@radix-ui/themes'
import { Plus } from 'lucide-react'
import { HeaderPage, type HeaderPageProps } from '../../../shared/components/HeaderPage'
import { StatusSummaryCards } from '../../../shared/components/StatusSummaryCards'
import { useAssetsQuery } from '../api/useAssetsQuery'
import { useAssetStatusCards } from '../hooks/useAssetStatusCards'
import { AssetModal } from '../components/AssetModal'
import { AssetsFilterBar } from '../components/AssetsFilterBar'
import { AssetsTable } from '../components/AssetsTable'

/**
 * Placeholder: el alta de activos es un spec futuro
 * (docs/feature/07-assets-page.md, "Fuera de alcance"), mismo criterio que
 * `handleAddVehicle`.
 */
function handleAddAsset(): void {
  console.info('Agregar Activo: modal de alta pendiente de un spec futuro')
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
    <div>
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
    </div>
  )
}
