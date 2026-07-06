import { useEffect, useState, type JSX } from 'react'
import { Button, Dialog, Flex, Grid, IconButton, Select, Text, TextField } from '@radix-ui/themes'
import { Home, Info, MapPin, X } from 'lucide-react'
import type { Asset, AssetStatus, AssetType } from '../../../shared/types/domain.types'
import { useAssetModalStore, type AssetModalMode } from '../store/useAssetModalStore'
import { useAssetsStore } from '../store/useAssetsStore'
import { createAsset } from '../api/useAssetsQuery'
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
import { assetCreateFormSchema } from '../schemas/assetCreateSchema'

type ViewMode = 'details' | 'edit'

const ASSET_STATUSES: AssetStatus[] = ['OK', 'DAMAGED', 'FULL', 'OUT_OF_SERVICE']
const ASSET_TYPES: AssetType[] = ['BIN', 'CONTAINER', 'BENCH']

interface CreateFormDraft {
  type: AssetType | ''
  status: AssetStatus | ''
  address: string
  zoneId: string
  lat: string
  lng: string
}

const EMPTY_CREATE_DRAFT: CreateFormDraft = {
  type: '',
  status: '',
  address: '',
  zoneId: '',
  lat: '',
  lng: ''
}

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
  const addAsset = useAssetsStore((state) => state.addAsset)
  const { data: zones } = useZonesQuery()

  const foundAsset = assets.find((candidate) => candidate.id === assetId) ?? null

  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode(requestedMode))
  const [statusDraft, setStatusDraft] = useState<AssetStatus>('OK')
  const [statusError, setStatusError] = useState<string | null>(null)
  const [createDraft, setCreateDraft] = useState<CreateFormDraft>(EMPTY_CREATE_DRAFT)
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CreateFormDraft, string>>>(
    {}
  )
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null
  )

  // Reset all local/draft state whenever a (possibly different) asset modal
  // is opened, so a leftover draft from a previous asset never leaks into
  // the next one (same rationale as `VehicleModal`). The `'create'` mode
  // resets the create form instead.
  useEffect(() => {
    if (requestedMode === 'create') {
      setCreateDraft(EMPTY_CREATE_DRAFT)
      setCreateErrors({})
      setFeedback(null)
      setIsSaving(false)
      return
    }
    if (foundAsset) {
      setViewMode(initialViewMode(requestedMode))
      setStatusDraft(foundAsset.status)
      setStatusError(null)
      setFeedback(null)
      setIsSaving(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId, requestedMode])

  // An `assetId` was set but no longer matches any asset in the store (e.g.
  // it was deleted): close instead of rendering an empty modal.
  useEffect(() => {
    if (requestedMode !== 'create' && assetId !== null && foundAsset === null) {
      close()
    }
  }, [requestedMode, assetId, foundAsset, close])

  if (requestedMode === null) {
    return null
  }

  function handleOpenChangeCreate(open: boolean): void {
    if (!open) {
      close()
    }
  }

  async function handleCreate(): Promise<void> {
    const result = assetCreateFormSchema.safeParse({
      type: createDraft.type,
      status: createDraft.status,
      address: createDraft.address,
      zoneId: createDraft.zoneId,
      lat: createDraft.lat,
      lng: createDraft.lng
    })

    if (!result.success) {
      const nextErrors: Partial<Record<keyof CreateFormDraft, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateFormDraft
        nextErrors[field] = issue.message
      }
      setCreateErrors(nextErrors)
      return
    }

    setCreateErrors({})
    setIsSaving(true)
    try {
      const created: Asset = await createAsset(result.data)
      addAsset(created)
      setIsSaving(false)
      close()
    } catch {
      setFeedback({ tone: 'error', message: 'No fue posible crear el activo.' })
      setIsSaving(false)
    }
  }

  if (requestedMode === 'create') {
    return (
      <Dialog.Root open onOpenChange={handleOpenChangeCreate}>
        <Dialog.Content maxWidth="480px">
          <Flex justify="between" align="center" mb="2">
            <Dialog.Title mb="0">Agregar Activo</Dialog.Title>
            <Dialog.Close>
              <IconButton variant="ghost" color="gray" aria-label="Cerrar modal">
                <X size={18} aria-hidden />
              </IconButton>
            </Dialog.Close>
          </Flex>

          <Dialog.Description size="2" color="gray" mb="4">
            Cargá los datos del nuevo activo urbano.
          </Dialog.Description>

          <Flex direction="column" gap="4">
            <Grid columns="2" gap="4">
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="asset-create-type" size="2" color="gray">
                  Tipo
                </Text>
                <Select.Root
                  value={createDraft.type}
                  onValueChange={(value) => {
                    setCreateDraft((draft) => ({ ...draft, type: value as AssetType }))
                    setCreateErrors((errors) => ({ ...errors, type: undefined }))
                  }}
                >
                  <Select.Trigger
                    id="asset-create-type"
                    aria-label="Tipo"
                    placeholder="Seleccioná un tipo"
                  />
                  <Select.Content>
                    {ASSET_TYPES.map((type) => (
                      <Select.Item key={type} value={type}>
                        {assetTypeLabel(type)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                {createErrors.type ? (
                  <Text size="1" color="red">
                    {createErrors.type}
                  </Text>
                ) : null}
              </Flex>

              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="asset-create-status" size="2" color="gray">
                  Estado
                </Text>
                <Select.Root
                  value={createDraft.status}
                  onValueChange={(value) => {
                    setCreateDraft((draft) => ({ ...draft, status: value as AssetStatus }))
                    setCreateErrors((errors) => ({ ...errors, status: undefined }))
                  }}
                >
                  <Select.Trigger
                    id="asset-create-status"
                    aria-label="Estado"
                    placeholder="Seleccioná un estado"
                  />
                  <Select.Content>
                    {ASSET_STATUSES.map((status) => (
                      <Select.Item key={status} value={status}>
                        {assetStatusLabel(status)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                {createErrors.status ? (
                  <Text size="1" color="red">
                    {createErrors.status}
                  </Text>
                ) : null}
              </Flex>
            </Grid>

            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="asset-create-address" size="2" color="gray">
                Dirección
              </Text>
              <TextField.Root
                id="asset-create-address"
                placeholder="Av. Corrientes 1234"
                value={createDraft.address}
                onChange={(event) => {
                  setCreateDraft((draft) => ({ ...draft, address: event.target.value }))
                  setCreateErrors((errors) => ({ ...errors, address: undefined }))
                }}
              />
              {createErrors.address ? (
                <Text size="1" color="red">
                  {createErrors.address}
                </Text>
              ) : null}
            </Flex>

            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="asset-create-zone" size="2" color="gray">
                Zona
              </Text>
              <Select.Root
                value={createDraft.zoneId}
                onValueChange={(value) => {
                  setCreateDraft((draft) => ({ ...draft, zoneId: value }))
                  setCreateErrors((errors) => ({ ...errors, zoneId: undefined }))
                }}
              >
                <Select.Trigger
                  id="asset-create-zone"
                  aria-label="Zona"
                  placeholder="Seleccioná una zona"
                />
                <Select.Content>
                  {(zones ?? []).map((zone) => (
                    <Select.Item key={zone.id} value={zone.id}>
                      {zone.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              {createErrors.zoneId ? (
                <Text size="1" color="red">
                  {createErrors.zoneId}
                </Text>
              ) : null}
            </Flex>

            <Grid columns="2" gap="4">
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="asset-create-lat" size="2" color="gray">
                  Latitud
                </Text>
                <TextField.Root
                  id="asset-create-lat"
                  type="number"
                  placeholder="-34.6037"
                  value={createDraft.lat}
                  onChange={(event) => {
                    setCreateDraft((draft) => ({ ...draft, lat: event.target.value }))
                    setCreateErrors((errors) => ({ ...errors, lat: undefined }))
                  }}
                />
                {createErrors.lat ? (
                  <Text size="1" color="red">
                    {createErrors.lat}
                  </Text>
                ) : null}
              </Flex>
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="asset-create-lng" size="2" color="gray">
                  Longitud
                </Text>
                <TextField.Root
                  id="asset-create-lng"
                  type="number"
                  placeholder="-58.3816"
                  value={createDraft.lng}
                  onChange={(event) => {
                    setCreateDraft((draft) => ({ ...draft, lng: event.target.value }))
                    setCreateErrors((errors) => ({ ...errors, lng: undefined }))
                  }}
                />
                {createErrors.lng ? (
                  <Text size="1" color="red">
                    {createErrors.lng}
                  </Text>
                ) : null}
              </Flex>
            </Grid>
          </Flex>

          {feedback ? (
            <Text size="2" color={feedback.tone === 'success' ? 'green' : 'red'} mt="4" as="p">
              {feedback.message}
            </Text>
          ) : null}

          <Flex justify="end" gap="3" mt="5">
            <Button variant="soft" color="gray" onClick={() => close()}>
              Cancelar
            </Button>
            <Button onClick={() => void handleCreate()} disabled={isSaving}>
              Crear
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    )
  }

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
