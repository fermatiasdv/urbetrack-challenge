import { useEffect, useState, type JSX } from 'react'
import { Button, Dialog, Flex, Grid, IconButton, Select, Text, TextField } from '@radix-ui/themes'
import { AlertCircle, Info, MapPin, Weight, X } from 'lucide-react'
import type { Vehicle, VehicleStatus, VehicleType } from '../../../shared/types/domain.types'
import { useVehicleModalStore, type VehicleModalMode } from '../store/useVehicleModalStore'
import { useVehiclesStore } from '../store/useVehiclesStore'
import { createVehicle } from '../api/useVehiclesQuery'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import { useAssignmentsStore } from '../../../shared/services/assignments/useAssignmentsStore'
import { useAssetsStore } from '../../../shared/services/assets/useAssetsStore'
import { useIncidentsStore } from '../../../shared/services/incidents/useIncidentsStore'
import { zoneNameFor } from '../../../shared/utils/zoneNameFor'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import {
  formatCapacity,
  vehicleStatusColorRole,
  vehicleStatusLabel,
  vehicleTypeLabel
} from '../utils/vehicleFormat'
import { vehicleModalContextBoxStyle } from './vehicleModal.styles'
import { vehicleModalFormSchema } from '../schemas/vehicleModalSchema'
import { vehicleCreateFormSchema } from '../schemas/vehicleCreateSchema'

type ViewMode = 'details' | 'edit'

const VEHICLE_TYPES: VehicleType[] = ['TRUCK', 'VAN', 'PICKUP']
const VEHICLE_STATUSES: VehicleStatus[] = ['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE']

interface CreateFormDraft {
  plate: string
  type: VehicleType | ''
  capacity: string
  status: VehicleStatus | ''
  zoneId: string
}

const EMPTY_CREATE_DRAFT: CreateFormDraft = {
  plate: '',
  type: '',
  capacity: '',
  status: '',
  zoneId: ''
}

function initialViewMode(mode: VehicleModalMode | null): ViewMode {
  return mode === 'edit' ? 'edit' : 'details'
}

/**
 * Detail/edit modal for a vehicle (docs/designs/05-vehicles-modal.md,
 * docs/feature/06-vehicles-modal.md). Mounted once in `VehiclesPage`, reads
 * `useVehicleModalStore` to know which vehicle (if any) to show and in which
 * mode `VehicleRowActionsMenu` requested ("Detalles" -> `details`, "Editar"
 * -> `edit`). Renders nothing while `vehicleId` is `null`.
 *
 * The backdrop is `Dialog.Overlay`'s default translucent gray (no blur, per
 * explicit user request — the mockup's `backdrop-blur-custom` is not
 * followed here, see docs/designs/05-vehicles-modal.md "Notas"). Clicking it,
 * or pressing Escape, calls `onOpenChange(false)`, which closes the modal via
 * the store without ever calling `updateVehicle` — any edit in progress is
 * only local component state until "Guardar" succeeds, so it's discarded for
 * free.
 */
export function VehicleModal(): JSX.Element | null {
  const vehicleId = useVehicleModalStore((state) => state.vehicleId)
  const requestedMode = useVehicleModalStore((state) => state.mode)
  const close = useVehicleModalStore((state) => state.close)
  const vehicles = useVehiclesStore((state) => state.vehicles)
  const updateVehicle = useVehiclesStore((state) => state.updateVehicle)
  const addVehicle = useVehiclesStore((state) => state.addVehicle)
  const assetToVehicle = useAssignmentsStore((state) => state.assetToVehicle)
  const incidentToVehicle = useAssignmentsStore((state) => state.incidentToVehicle)
  const allAssets = useAssetsStore((state) => state.assets)
  const allIncidents = useIncidentsStore((state) => state.incidents)
  const { data: zones } = useZonesQuery()

  const foundVehicle = vehicles.find((candidate) => candidate.id === vehicleId) ?? null

  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode(requestedMode))
  const [plateDraft, setPlateDraft] = useState('')
  const [plateError, setPlateError] = useState<string | null>(null)
  const [createDraft, setCreateDraft] = useState<CreateFormDraft>(EMPTY_CREATE_DRAFT)
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CreateFormDraft, string>>>(
    {}
  )
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null
  )

  // Reset all local/draft state whenever a (possibly different) vehicle
  // modal is opened, so a leftover draft from a previous vehicle never
  // leaks into the next one. The `'create'` mode resets the create form
  // instead (docs/feature/09-pagination-and-create-modal.md, "Decisiones
  // propuestas" #3).
  useEffect(() => {
    if (requestedMode === 'create') {
      setCreateDraft(EMPTY_CREATE_DRAFT)
      setCreateErrors({})
      setFeedback(null)
      setIsSaving(false)
      return
    }
    if (foundVehicle) {
      setViewMode(initialViewMode(requestedMode))
      setPlateDraft(foundVehicle.plate)
      setPlateError(null)
      setFeedback(null)
      setIsSaving(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, requestedMode])

  // A `vehicleId` was set but no longer matches any vehicle in the store
  // (e.g. it was deleted): close instead of rendering an empty modal.
  useEffect(() => {
    if (requestedMode !== 'create' && vehicleId !== null && foundVehicle === null) {
      close()
    }
  }, [requestedMode, vehicleId, foundVehicle, close])

  if (requestedMode === null) {
    return null
  }

  function handleOpenChangeCreate(open: boolean): void {
    if (!open) {
      close()
    }
  }

  async function handleCreate(): Promise<void> {
    const result = vehicleCreateFormSchema.safeParse({
      plate: createDraft.plate,
      type: createDraft.type,
      capacity: createDraft.capacity,
      status: createDraft.status,
      zoneId: createDraft.zoneId
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
      const created: Vehicle = await createVehicle(result.data)
      addVehicle(created)
      setIsSaving(false)
      close()
    } catch {
      setFeedback({ tone: 'error', message: 'No fue posible crear el vehículo.' })
      setIsSaving(false)
    }
  }

  if (requestedMode === 'create') {
    return (
      <Dialog.Root open onOpenChange={handleOpenChangeCreate}>
        <Dialog.Content maxWidth="480px">
          <Flex justify="between" align="center" mb="2">
            <Dialog.Title mb="0">Agregar Vehículo</Dialog.Title>
            <Dialog.Close>
              <IconButton variant="ghost" color="gray" aria-label="Cerrar modal">
                <X size={18} aria-hidden />
              </IconButton>
            </Dialog.Close>
          </Flex>

          <Dialog.Description size="2" color="gray" mb="4">
            Cargá los datos del nuevo vehículo de la flota.
          </Dialog.Description>

          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="vehicle-create-plate" size="2" color="gray">
                Patente / Plate
              </Text>
              <TextField.Root
                id="vehicle-create-plate"
                placeholder="Ingrese patente"
                value={createDraft.plate}
                onChange={(event) => {
                  setCreateDraft((draft) => ({ ...draft, plate: event.target.value }))
                  setCreateErrors((errors) => ({ ...errors, plate: undefined }))
                }}
              />
              {createErrors.plate ? (
                <Text size="1" color="red">
                  {createErrors.plate}
                </Text>
              ) : null}
            </Flex>

            <Grid columns="2" gap="4">
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="vehicle-create-type" size="2" color="gray">
                  Tipo
                </Text>
                <Select.Root
                  value={createDraft.type}
                  onValueChange={(value) => {
                    setCreateDraft((draft) => ({ ...draft, type: value as VehicleType }))
                    setCreateErrors((errors) => ({ ...errors, type: undefined }))
                  }}
                >
                  <Select.Trigger
                    id="vehicle-create-type"
                    aria-label="Tipo"
                    placeholder="Seleccioná un tipo"
                  />
                  <Select.Content>
                    {VEHICLE_TYPES.map((type) => (
                      <Select.Item key={type} value={type}>
                        {vehicleTypeLabel(type)}
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
                <Text as="label" htmlFor="vehicle-create-capacity" size="2" color="gray">
                  Capacidad (KG)
                </Text>
                <TextField.Root
                  id="vehicle-create-capacity"
                  type="number"
                  placeholder="5000"
                  value={createDraft.capacity}
                  onChange={(event) => {
                    setCreateDraft((draft) => ({ ...draft, capacity: event.target.value }))
                    setCreateErrors((errors) => ({ ...errors, capacity: undefined }))
                  }}
                />
                {createErrors.capacity ? (
                  <Text size="1" color="red">
                    {createErrors.capacity}
                  </Text>
                ) : null}
              </Flex>
            </Grid>

            <Grid columns="2" gap="4">
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="vehicle-create-status" size="2" color="gray">
                  Estado
                </Text>
                <Select.Root
                  value={createDraft.status}
                  onValueChange={(value) => {
                    setCreateDraft((draft) => ({ ...draft, status: value as VehicleStatus }))
                    setCreateErrors((errors) => ({ ...errors, status: undefined }))
                  }}
                >
                  <Select.Trigger
                    id="vehicle-create-status"
                    aria-label="Estado"
                    placeholder="Seleccioná un estado"
                  />
                  <Select.Content>
                    {VEHICLE_STATUSES.map((status) => (
                      <Select.Item key={status} value={status}>
                        {vehicleStatusLabel(status)}
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

              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="vehicle-create-zone" size="2" color="gray">
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
                    id="vehicle-create-zone"
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

  if (vehicleId === null || foundVehicle === null) {
    return null
  }

  // Re-bound to a plain, statically non-null `Vehicle`: TypeScript's control
  // flow narrowing above doesn't carry into the nested `function` handlers
  // declared below (they could run at any later render), so those need a
  // binding whose *declared* type is already non-null.
  const vehicle: Vehicle = foundVehicle

  const zonesById = new Map((zones ?? []).map((zone) => [zone.id, zone.name]))

  // Activos/incidentes currently assigned to this vehicle
  // (docs/feature/maps-asign-vehicle.md §6). A vehicle holds N of them; the
  // assignment maps are `entityId -> vehicleId`, so we keep the entities that
  // point back at this vehicle.
  const assignedAssets = allAssets.filter((asset) => assetToVehicle[asset.id] === vehicle.id)
  const assignedIncidents = allIncidents.filter(
    (incident) => incidentToVehicle[incident.id] === vehicle.id
  )
  const assignedCount = assignedAssets.length + assignedIncidents.length

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
    setPlateDraft(vehicle.plate)
    setPlateError(null)
    setViewMode('details')
  }

  function handleSave(): void {
    const result = vehicleModalFormSchema.safeParse({ plate: plateDraft })
    if (!result.success) {
      setPlateError(result.error.issues[0]?.message ?? 'Formato de placa inválido')
      return
    }

    setIsSaving(true)
    try {
      updateVehicle(vehicle.id, { plate: result.data.plate })
      setIsSaving(false)
      close()
    } catch {
      setFeedback({ tone: 'error', message: 'No fue posible actualizar el vehículo.' })
      setIsSaving(false)
    }
  }

  const readOnlyDetails = (
    <Grid columns="2" gap="4">
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          Capacidad
        </Text>
        <Flex align="center" gap="2">
          <Weight size={16} aria-hidden />
          <Text weight="medium">{formatCapacity(vehicle.capacity)}</Text>
        </Flex>
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          Zona Operativa
        </Text>
        <Flex align="center" gap="2">
          <MapPin size={16} aria-hidden />
          <Text weight="medium">{zoneNameFor(vehicle.zoneId, zonesById)}</Text>
        </Flex>
      </Flex>
    </Grid>
  )

  return (
    <Dialog.Root open onOpenChange={handleOpenChange}>
      <Dialog.Content maxWidth="480px">
        <Flex justify="between" align="center" mb="2">
          <Flex align="center" gap="3">
            <Dialog.Title mb="0">
              {vehicleTypeLabel(vehicle.type)} ({vehicle.plate})
            </Dialog.Title>
            <StatusBadge
              colorRole={vehicleStatusColorRole(vehicle.status)}
              label={vehicleStatusLabel(vehicle.status).toUpperCase()}
            />
          </Flex>
          <Dialog.Close>
            <IconButton variant="ghost" color="gray" aria-label="Cerrar modal">
              <X size={18} aria-hidden />
            </IconButton>
          </Dialog.Close>
        </Flex>

        <Dialog.Description size="2" color="gray" mb="4">
          Detalle del vehículo con placa {vehicle.plate}.
        </Dialog.Description>

        {viewMode === 'edit' ? (
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="vehicle-modal-plate" size="2" color="gray">
                Patente / Plate
              </Text>
              <TextField.Root
                id="vehicle-modal-plate"
                placeholder="Ingrese patente"
                value={plateDraft}
                color={plateError ? 'red' : undefined}
                onChange={(event) => {
                  setPlateDraft(event.target.value)
                  setPlateError(null)
                }}
              >
                {plateError ? (
                  <TextField.Slot side="right">
                    <AlertCircle size={16} color="var(--red-9)" aria-hidden />
                  </TextField.Slot>
                ) : null}
              </TextField.Root>
              {plateError ? (
                <Text size="1" color="red">
                  {plateError}
                </Text>
              ) : null}
            </Flex>

            {readOnlyDetails}

            <Flex gap="3" style={vehicleModalContextBoxStyle}>
              <Info size={18} aria-hidden />
              <Text size="2" color="gray">
                La patente debe seguir el formato nacional vigente. Cualquier modificación requiere
                revisión por parte del administrador de flota.
              </Text>
            </Flex>
          </Flex>
        ) : (
          readOnlyDetails
        )}

        <Flex direction="column" gap="2" mt="4">
          <Text size="2" color="gray" weight="medium">
            Activos e incidentes asignados
          </Text>
          {assignedCount === 0 ? (
            <Text size="2" color="gray">
              Este vehículo no tiene activos ni incidentes asignados.
            </Text>
          ) : (
            <Flex direction="column" gap="1">
              {assignedAssets.map((asset) => (
                <Text as="p" size="2" key={`asset-${asset.id}`}>
                  Activo · {asset.address}
                </Text>
              ))}
              {assignedIncidents.map((incident) => (
                <Text as="p" size="2" key={`incident-${incident.id}`}>
                  Incidente · {incident.description}
                </Text>
              ))}
            </Flex>
          )}
        </Flex>

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
