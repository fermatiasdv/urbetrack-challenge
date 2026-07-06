import { useState, type JSX } from 'react'
import { RowActionsMenu } from '../../../shared/components/RowActionsMenu'
import type { Asset } from '../../../shared/types/domain.types'
import { useAssetModalStore } from '../store/useAssetModalStore'
import { assetTypeLabel } from '../utils/assetFormat'
import { DeleteAssetAlertDialog } from './DeleteAssetAlertDialog'

export interface AssetRowActionsMenuProps {
  asset: Asset
}

/**
 * Kebab menu for an asset table row. Thin wrapper over the shared
 * `RowActionsMenu` (docs/feature/07-assets-page.md, "Generalización a
 * `shared/`"), same pattern as `VehicleRowActionsMenu`.
 */
export function AssetRowActionsMenu({ asset }: AssetRowActionsMenuProps): JSX.Element {
  const openModal = useAssetModalStore((state) => state.open)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <RowActionsMenu
        triggerAriaLabel={`Acciones para el activo ${assetTypeLabel(asset.type)} en ${asset.address}`}
        items={[
          { label: 'Detalles', onSelect: () => openModal(asset.id, 'details') },
          { label: 'Editar', onSelect: () => openModal(asset.id, 'edit') },
          { label: 'Eliminar', color: 'red', onSelect: () => setDeleteDialogOpen(true) }
        ]}
      />

      <DeleteAssetAlertDialog
        asset={asset}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}
