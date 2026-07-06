import { create } from 'zustand'
import type { Incident } from '../../../shared/types/domain.types'

export interface IncidentsState {
  incidents: Incident[]
  hasHydrated: boolean
  setIncidents: (incidents: Incident[]) => void
  addIncident: (incident: Incident) => void
  removeIncident: (id: string) => void
  updateIncident: (id: string, changes: Partial<Incident>) => void
}

/**
 * Source of truth for the `incidents` feature (docs/specs/architecture.md
 * "Dónde vive cada store"). Hydrated **once** by `useIncidentsQuery`
 * (`hasHydrated` guards against a later remount/refetch overwriting local
 * mutations — same "Hidratación única" rationale as `useAssetsStore`).
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
