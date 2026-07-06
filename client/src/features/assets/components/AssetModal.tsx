import { useEffect, useState, type JSX } from 'react'
import { Button, Dialog, Flex, Grid, IconButton, Select, Text } from '@radix-ui/themes'
import { Home, Info, MapPin, X } from 'lucide-react'
import type { Asset, AssetStatus } from '../../../shared/types/domain.types'
import { useAssetModalStore, type AssetModalMode } from '../store/useAssetModalStore'
import { useAssetsStore } from '../store/useAssetsStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import { zoneNameFor } from '../../../shared/utils/zoneNameFor'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import {
  assetStatusColorRole,
  assetStatusLabel,
  assetTypeLabel,
  formatCoordinate
} from '../utils/assetFormat'
import { assetModalContextBoxStyle } from './assetModal.styles'
import { assetModalFormSchema } from '../schemas/assetModalSchema'

type ViewMode = 'details' | 'edit'

const ASSET_STATUSES: AssetStatus[] = ['OK', 'DAMAGED', 'FULL', 'OUT_OF_SERVICE']

function initialViewMode(mode: AssetModalMode | null): ViewMode {
  return mode === 'edit' ? 'edit' : 'details'
}

/**
 * Detail/edit modal for an asset, mirroring `VehicleModal`
 * (docs/feature/07-assets-page.md, "Decisiones propuestas" #7). Mounted once
 * in `AssetsPage`, reads `useAssetModalStore` to know which asset (if any)
 * to show and in which mode. Renders nothing while `assetId` is `null`.
 *
 * Unlike vehicles, only `status` is editable (decisión explícita del usuario
 * que amplía docs/verified-scope.md §7.2, que originalmente definía este
 * modal como solo lectura); `type`, `zoneId`, `lat`, `lng` y `address`
 * permanecen de solo lectura incluso en modo edición.
 */
export function AssetModal(): JSX.Element | null {
  const assetId = useAssetModalStore((state) => state.assetId)
  const requestedMode = useAssetModalStore((state) => state.mode)
  const close = useAssetModalStore((state) => state.close)
  const assets = useAssetsStore((state) => state.assets)
  const updateAsset = useAssetsStore((state) => state.updateAsset)
  const { data: zones } = useZonesQuery()

  const foundAsset = assets.find((candidate) => candidate.id === assetId) ?? null

  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode(requestedMode))
  const [statusDraft, setStatusDraft] = useState<AssetStatus>('OK')
  const [statusError, setStatusError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null
  )

  // Reset all local/draft state whenever a (possibly different) asset modal
  // is opened, so a leftover draft from a previous asset never leaks into
  // the next one (same rationale as `VehicleModal`).
  useEffect(() => {
    if (foundAsset) {
      setViewMode(initialViewMode(requestedMode))
      setStatusDraft(foundAsset.status)
      setStatusError(null)
      setFeedback(null)
      setIsSaving(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId])

  // An `assetId` was set but no longer matches any asset in the store (e.g.
  // it was deleted): close instead of rendering an empty modal.
  useEffect(() => {
    if (assetId !== null && foundAsset === null) {
      close()
    }
  }, [assetId, foundAsset, close])

  if (assetId === null || foundAsset === null) {
    return null
  }

  // Re-bound to a plain, statically non-null `Asset`, same reasoning as
  // `VehicleModal` (TypeScript's narrowing above doesn't carry into the
  // nested handlers declared below).
  const asset: Asset = foundAsset

  const zonesById = new Map((zones ?? []).map((zone) => [zone.id, zone.name]))

  function handleOpenChange(open: boolean): void {
    if (!open) {
      close()
    }
  }

  function handleModify(): void {
    setViewMode('edit')
  }

  function handleCancel(): void {
    if (requestedMode === 'edit') {
      close()
      return
    }
    setStatusDraft(asset.status)
    setStatusError(null)
    setViewMode('details')
  }

  function handleSave(): void {
    const result = assetModalFormSchema.safeParse({ status: statusDraft })
    if (!result.success) {
      setStatusError(result.error.issues[0]?.message ?? 'Estado inválido')
      return
    }

    setIsSaving(true)
    try {
      updateAsset(asset.id, { status: result.data.status })
      setIsSaving(false)
      close()
    } catch {
      setFeedback({ tone: 'error', message: 'No fue posible actualizar el activo.' })
      setIsSaving(false)
    }
  }

  const readOnlyDetails = (
    <Grid columns="2" gap="4">
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          Zona
        </Text>
        <Flex align="center" gap="2">
          <MapPin size={16} aria-hidden />
          <Text weight="medium">{zoneNameFor(asset.zoneId, zonesById)}</Text>
        </Flex>
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          Dirección
        </Text>
        <Flex align="center" gap="2">
          <Home size={16} aria-hidden />
          <Text weight="medium">{asset.address}</Text>
        </Flex>
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          Latitud
        </Text>
        <Text weight="medium">{formatCoordinate(asset.lat)}</Text>
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          Longitud
        </Text>
        <Text weight="medium">{formatCoordinate(asset.lng)}</Text>
      </Flex>
    </Grid>
  )

  return (
    <Dialog.Root open onOpenChange={handleOpenChange}>
      <Dialog.Content maxWidth="480px">
        <Flex justify="between" align="center" mb="2">
          <Flex align="center" gap="3">
            <Dialog.Title mb="0">{assetTypeLabel(asset.type)}</Dialog.Title>
            <StatusBadge
              colorRole={assetStatusColorRole(asset.status)}
              label={assetStatusLabel(asset.status).toUpperCase()}
            />
          </Flex>
          <Dialog.Close>
            <IconButton variant="ghost" color="gray" aria-label="Cerrar modal">
              <X size={18} aria-hidden />
            </IconButton>
          </Dialog.Close>
        </Flex>

        <Dialog.Description size="2" color="gray" mb="4">
          Detalle del activo en {asset.address}.
        </Dialog.Description>

        {viewMode === 'edit' ? (
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="asset-modal-status" size="2" color="gray">
                Estado
              </Text>
              <Select.Root
                value={statusDraft}
                onValueChange={(value) => {
                  setStatusDraft(value as AssetStatus)
                  setStatusError(null)
                }}
              >
                <Select.Trigger id="asset-modal-status" aria-label="Estado" />
                <Select.Content>
                  {ASSET_STATUSES.map((status) => (
                    <Select.Item key={status} value={status}>
                      {assetStatusLabel(status)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              {statusError ? (
                <Text size="1" color="red">
                  {statusError}
                </Text>
              ) : null}
            </Flex>

            {readOnlyDetails}

            <Flex gap="3" style={assetModalContextBoxStyle}>
              <Info size={18} aria-hidden />
              <Text size="2" color="gray">
                El estado del activo determina su color en el mapa y en los listados. El tipo, la
                zona y las coordenadas no pueden modificarse desde aquí.
              </Text>
            </Flex>
          </Flex>
        ) : (
          readOnlyDetails
        )}

        {feedback ? (
          <Text size="2" color={feedback.tone === 'success' ? 'green' : 'red'} mt="4" as="p">
            {feedback.message}
          </Text>
        ) : null}

        <Flex justify="end" gap="3" mt="5">
          {viewMode === 'edit' ? (
            <>
              <Button variant="soft" color="gray" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                Guardar
              </Button>
            </>
          ) : (
            <>
              <Button variant="soft" color="gray" onClick={() => close()}>
                Cerrar
              </Button>
              <Button onClick={handleModify}>Modificar</Button>
            </>
          )}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
