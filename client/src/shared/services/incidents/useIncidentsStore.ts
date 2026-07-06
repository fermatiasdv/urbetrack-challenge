import { create } from 'zustand'
import type { Incident } from '../../types/domain.types'

export interface IncidentsState {
  incidents: Incident[]
  hasHydrated: boolean
  setIncidents: (incidents: Incident[]) => void
  addIncident: (incident: Incident) => void
  removeIncident: (id: string) => void
  updateIncident: (id: string, changes: Partial<Incident>) => void
}

/**
 * Source of truth for incident data, shared between the `incidents` and
 * `map` features (docs/feature/10-maps-create.md, decisión #3 / "Origen de
 * los datos"). Moved from `features/incidents/store/useIncidentsStore.ts` to
 * `shared/services/incidents/` once `map` became a second consumer, per
 * `architecture.md` ("Regla para shared").
 *
 * Hydrated **once** by `useIncidentsQuery` (`hasHydrated` guards against a
 * later remount/refetch overwriting local mutations — "Hidratación única",
 * docs/specs/architecture.md).
 *
 * `removeIncident` backs "Eliminar" and `updateIncident` backs "Guardar" in
 * `IncidentModal` (docs/feature/08-incidents-page.md): the mock backend has
 * no `PUT`/`PATCH`/`DELETE`, so both actions only mutate this in-memory store.
 *
 * `addIncident` backs the "Agregar Incidente" alta
 * (docs/feature/09-pagination-and-create-modal.md): unlike edit/delete, the
 * mock backend DOES expose `POST /incidents`, so this action is only called
 * after a successful `201` response, with the server-issued `id`/`createdAt`.
 */
export const useIncidentsStore = create<IncidentsState>((set) => ({
  incidents: [],
  hasHydrated: false,
  setIncidents: (incidents) => set({ incidents, hasHydrated: true }),
  addIncident: (incident) => set((state) => ({ incidents: [...state.incidents, incident] })),
  removeIncident: (id) =>
    set((state) => ({ incidents: state.incidents.filter((incident) => incident.id !== id) })),
  updateIncident: (id, changes) =>
    set((state) => ({
      incidents: state.incidents.map((incident) =>
        incident.id === id ? { ...incident, ...changes } : incident
      )
    }))
}))
