import { useEffect, useState, type JSX } from 'react'
import {
  Button,
  Dialog,
  Flex,
  Grid,
  IconButton,
  Select,
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes'
import { AlertCircle, Calendar, Info, MapPin, X } from 'lucide-react'
import type { Incident, IncidentStatus, IncidentType } from '../../../shared/types/domain.types'
import { useIncidentModalStore, type IncidentModalMode } from '../store/useIncidentModalStore'
import { useIncidentsStore } from '../../../shared/services/incidents/useIncidentsStore'
import { createIncident } from '../../../shared/services/incidents/useIncidentsQuery'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import { zoneNameFor } from '../../../shared/utils/zoneNameFor'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import {
  formatIncidentDate,
  incidentStatusColorRole,
  incidentStatusLabel,
  incidentTypeLabel
} from '../utils/incidentFormat'
import { incidentModalContextBoxStyle } from './incidentModal.styles'
import { incidentModalFormSchema } from '../schemas/incidentModalSchema'
import { incidentCreateFormSchema } from '../schemas/incidentCreateSchema'

type ViewMode = 'details' | 'edit'

const INCIDENT_STATUSES: IncidentStatus[] = ['REPORTED', 'IN_PROGRESS', 'RESOLVED']
const INCIDENT_TYPES: IncidentType[] = ['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']

interface CreateFormDraft {
  type: IncidentType | ''
  description: string
  zoneId: string
  lat: string
  lng: string
}

const EMPTY_CREATE_DRAFT: CreateFormDraft = {
  type: '',
  description: '',
  zoneId: '',
  lat: '',
  lng: ''
}

function initialViewMode(mode: IncidentModalMode | null): ViewMode {
  return mode === 'edit' ? 'edit' : 'details'
}

/**
 * Detail/edit/create modal for an incident, mirroring `AssetModal`
 * (docs/feature/08-incidents-page.md, "Decisiones propuestas" #7) plus the
 * `'create'` mode for "Agregar Incidente"
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #3).
 * Mounted once in `IncidentsPage`, reads `useIncidentModalStore`. Renders
 * nothing while `mode` is `null`.
 */
export function IncidentModal(): JSX.Element | null {
  const incidentId = useIncidentModalStore((state) => state.incidentId)
  const requestedMode = useIncidentModalStore((state) => state.mode)
  const close = useIncidentModalStore((state) => state.close)
  const incidents = useIncidentsStore((state) => state.incidents)
  const updateIncident = useIncidentsStore((state) => state.updateIncident)
  const addIncident = useIncidentsStore((state) => state.addIncident)
  const { data: zones } = useZonesQuery()

  const foundIncident = incidents.find((candidate) => candidate.id === incidentId) ?? null

  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode(requestedMode))
  const [statusDraft, setStatusDraft] = useState<IncidentStatus>('REPORTED')
  const [statusError, setStatusError] = useState<string | null>(null)
  const [createDraft, setCreateDraft] = useState<CreateFormDraft>(EMPTY_CREATE_DRAFT)
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CreateFormDraft, string>>>(
    {}
  )
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null
  )

  // Reset all local/draft state whenever a (possibly different) incident
  // modal is opened, so a leftover draft never leaks into the next one
  // (same rationale as `AssetModal`/`VehicleModal`).
  useEffect(() => {
    if (requestedMode === 'create') {
      setCreateDraft(EMPTY_CREATE_DRAFT)
      setCreateErrors({})
      setFeedback(null)
      setIsSaving(false)
      return
    }
    if (foundIncident) {
      setViewMode(initialViewMode(requestedMode))
      setStatusDraft(foundIncident.status)
      setStatusError(null)
      setFeedback(null)
      setIsSaving(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId, requestedMode])

  // An `incidentId` was set but no longer matches any incident in the store
  // (e.g. it was deleted): close instead of rendering an empty modal.
  useEffect(() => {
    if (requestedMode !== 'create' && incidentId !== null && foundIncident === null) {
      close()
    }
  }, [requestedMode, incidentId, foundIncident, close])

  if (requestedMode === null) {
    return null
  }

  const zonesById = new Map((zones ?? []).map((zone) => [zone.id, zone.name]))

  function handleOpenChange(open: boolean): void {
    if (!open) {
      close()
    }
  }

  async function handleCreate(): Promise<void> {
    const result = incidentCreateFormSchema.safeParse({
      type: createDraft.type,
      description: createDraft.description,
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
      const created: Incident = await createIncident(result.data)
      addIncident(created)
      setIsSaving(false)
      close()
    } catch {
      setFeedback({ tone: 'error', message: 'No fue posible crear el incidente.' })
      setIsSaving(false)
    }
  }

  if (requestedMode === 'create') {
    return (
      <Dialog.Root open onOpenChange={handleOpenChange}>
        <Dialog.Content maxWidth="480px">
          <Flex justify="between" align="center" mb="2">
            <Dialog.Title mb="0">Agregar Incidente</Dialog.Title>
            <Dialog.Close>
              <IconButton variant="ghost" color="gray" aria-label="Cerrar modal">
                <X size={18} aria-hidden />
              </IconButton>
            </Dialog.Close>
          </Flex>

          <Dialog.Description size="2" color="gray" mb="4">
            Cargá los datos del nuevo incidente reportado en la vía pública.
          </Dialog.Description>

          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="incident-modal-type" size="2" color="gray">
                Tipo
              </Text>
              <Select.Root
                value={createDraft.type}
                onValueChange={(value) => {
                  setCreateDraft((draft) => ({ ...draft, type: value as IncidentType }))
                  setCreateErrors((errors) => ({ ...errors, type: undefined }))
                }}
              >
                <Select.Trigger
                  id="incident-modal-type"
                  aria-label="Tipo"
                  placeholder="Seleccioná un tipo"
                />
                <Select.Content>
                  {INCIDENT_TYPES.map((type) => (
                    <Select.Item key={type} value={type}>
                      {incidentTypeLabel(type)}
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
              <Text as="label" htmlFor="incident-modal-description" size="2" color="gray">
                Descripción
              </Text>
              <TextArea
                id="incident-modal-description"
                placeholder="Describí el incidente"
                value={createDraft.description}
                onChange={(event) => {
                  setCreateDraft((draft) => ({ ...draft, description: event.target.value }))
                  setCreateErrors((errors) => ({ ...errors, description: undefined }))
                }}
              />
              {createErrors.description ? (
                <Text size="1" color="red">
                  {createErrors.description}
                </Text>
              ) : null}
            </Flex>

            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="incident-modal-zone" size="2" color="gray">
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
                  id="incident-modal-zone"
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
                <Text as="label" htmlFor="incident-modal-lat" size="2" color="gray">
                  Latitud
                </Text>
                <TextField.Root
                  id="incident-modal-lat"
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
                <Text as="label" htmlFor="incident-modal-lng" size="2" color="gray">
                  Longitud
                </Text>
                <TextField.Root
                  id="incident-modal-lng"
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

            <Flex gap="3" style={incidentModalContextBoxStyle}>
              <Info size={18} aria-hidden />
              <Text size="2" color="gray">
                El incidente se crea con estado "Reportado" por defecto.
              </Text>
            </Flex>
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

  if (incidentId === null || foundIncident === null) {
    return null
  }

  // Re-bound to a plain, statically non-null `Incident`, same reasoning as
  // `AssetModal`/`VehicleModal`.
  const incident: Incident = foundIncident

  function handleModify(): void {
    setViewMode('edit')
  }

  function handleCancel(): void {
    if (requestedMode === 'edit') {
      close()
      return
    }
    setStatusDraft(incident.status)
    setStatusError(null)
    setViewMode('details')
  }

  function handleSave(): void {
    const result = incidentModalFormSchema.safeParse({ status: statusDraft })
    if (!result.success) {
      setStatusError(result.error.issues[0]?.message ?? 'Estado inválido')
      return
    }

    setIsSaving(true)
    try {
      updateIncident(incident.id, { status: result.data.status })
      setIsSaving(false)
      close()
    } catch {
      setFeedback({ tone: 'error', message: 'No fue posible actualizar el incidente.' })
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
          <Text weight="medium">{zoneNameFor(incident.zoneId, zonesById)}</Text>
        </Flex>
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          Fecha de creación
        </Text>
        <Flex align="center" gap="2">
          <Calendar size={16} aria-hidden />
          <Text weight="medium">{formatIncidentDate(incident.createdAt)}</Text>
        </Flex>
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          Latitud
        </Text>
        <Text weight="medium">{incident.lat.toFixed(4)}</Text>
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          Longitud
        </Text>
        <Text weight="medium">{incident.lng.toFixed(4)}</Text>
      </Flex>
      <Flex direction="column" gap="1" style={{ gridColumn: '1 / -1' }}>
        <Text size="2" color="gray">
          Descripción
        </Text>
        <Text weight="medium">{incident.description}</Text>
      </Flex>
    </Grid>
  )

  return (
    <Dialog.Root open onOpenChange={handleOpenChange}>
      <Dialog.Content maxWidth="480px">
        <Flex justify="between" align="center" mb="2">
          <Flex align="center" gap="3">
            <Dialog.Title mb="0">{incidentTypeLabel(incident.type)}</Dialog.Title>
            <StatusBadge
              colorRole={incidentStatusColorRole(incident.status)}
              label={incidentStatusLabel(incident.status).toUpperCase()}
            />
          </Flex>
          <Dialog.Close>
            <IconButton variant="ghost" color="gray" aria-label="Cerrar modal">
              <X size={18} aria-hidden />
            </IconButton>
          </Dialog.Close>
        </Flex>

        <Dialog.Description size="2" color="gray" mb="4">
          Detalle del incidente reportado el {formatIncidentDate(incident.createdAt)}.
        </Dialog.Description>

        {viewMode === 'edit' ? (
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="incident-modal-status" size="2" color="gray">
                Estado
              </Text>
              <Select.Root
                value={statusDraft}
                onValueChange={(value) => {
                  setStatusDraft(value as IncidentStatus)
                  setStatusError(null)
                }}
              >
                <Select.Trigger id="incident-modal-status" aria-label="Estado" />
                <Select.Content>
                  {INCIDENT_STATUSES.map((status) => (
                    <Select.Item key={status} value={status}>
                      {incidentStatusLabel(status)}
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

            <Flex gap="3" style={incidentModalContextBoxStyle}>
              <AlertCircle size={18} aria-hidden />
              <Text size="2" color="gray">
                El estado del incidente determina su color en el mapa y en los listados. El tipo, la
                descripción, la zona y las coordenadas no pueden modificarse desde aquí.
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
