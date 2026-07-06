import { useEffect, useState, type JSX } from 'react'
import { Button, Dialog, Flex, Grid, IconButton, Text, TextField } from '@radix-ui/themes'
import { AlertCircle, Info, MapPin, Weight, X } from 'lucide-react'
import type { Vehicle } from '../../../shared/types/domain.types'
import { useVehicleModalStore, type VehicleModalMode } from '../store/useVehicleModalStore'
import { useVehiclesStore } from '../store/useVehiclesStore'
import { useZonesQuery } from '../api/useZonesQuery'
import {
  formatCapacity,
  vehicleStatusLabel,
  vehicleTypeLabel,
  zoneNameFor
} from '../utils/vehicleFormat'
import { statusBadgeStyleFor, statusDotStyleFor } from './vehicleStatusBadge.styles'
import { vehicleModalContextBoxStyle } from './vehicleModal.styles'
import { vehicleModalFormSchema } from '../schemas/vehicleModalSchema'

type ViewMode = 'details' | 'edit'

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
  const { data: zones } = useZonesQuery()

  const foundVehicle = vehicles.find((candidate) => candidate.id === vehicleId) ?? null

  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode(requestedMode))
  const [plateDraft, setPlateDraft] = useState('')
  const [plateError, setPlateError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null
  )

  // Reset all local/draft state whenever a (possibly different) vehicle
  // modal is opened, so a leftover draft from a previous vehicle never
  // leaks into the next one.
  useEffect(() => {
    if (foundVehicle) {
      setViewMode(initialViewMode(requestedMode))
      setPlateDraft(foundVehicle.plate)
      setPlateError(null)
      setFeedback(null)
      setIsSaving(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId])

  // A `vehicleId` was set but no longer matches any vehicle in the store
  // (e.g. it was deleted): close instead of rendering an empty modal.
  useEffect(() => {
    if (vehicleId !== null && foundVehicle === null) {
      close()
    }
  }, [vehicleId, foundVehicle, close])

  if (vehicleId === null || foundVehicle === null) {
    return null
  }

  // Re-bound to a plain, statically non-null `Vehicle`: TypeScript's control
  // flow narrowing above doesn't carry into the nested `function` handlers
  // declared below (they could run at any later render), so those need a
  // binding whose *declared* type is already non-null.
  const vehicle: Vehicle = foundVehicle

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
            <span style={statusBadgeStyleFor(vehicle.status)}>
              <span style={statusDotStyleFor(vehicle.status)} aria-hidden />
              {vehicleStatusLabel(vehicle.status).toUpperCase()}
            </span>
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
