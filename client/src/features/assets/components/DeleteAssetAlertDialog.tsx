import type { JSX } from 'react'
import { ConfirmAlertDialog } from '../../../shared/components/ConfirmAlertDialog'
import type { Asset } from '../../../shared/types/domain.types'
import { useAssetsStore } from '../../../shared/services/assets/useAssetsStore'
import { assetTypeLabel } from '../utils/assetFormat'

export interface DeleteAssetAlertDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Confirmation dialog for the "Eliminar" row action of an asset. Thin wrapper
 * over the shared `ConfirmAlertDialog` (docs/feature/07-assets-page.md,
 * "Generalización a `shared/`"), same pattern as `DeleteVehicleAlertDialog`:
 * supplies the asset-specific copy and the `removeAsset` action.
 */
export function DeleteAssetAlertDialog({
  asset,
  open,
  onOpenChange
}: DeleteAssetAlertDialogProps): JSX.Element {
  const removeAsset = useAssetsStore((state) => state.removeAsset)

  return (
    <ConfirmAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title="¿Eliminar activo?"
      description={
        <>
          Se eliminará el activo <strong>{assetTypeLabel(asset.type)}</strong> ({asset.address}).
          Esta acción no se puede deshacer.
        </>
      }
      onAccept={() => removeAsset(asset.id)}
    />
  )
}
