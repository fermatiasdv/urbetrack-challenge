import { create } from 'zustand'

function omitKey(map: Record<string, string>, key: string): Record<string, string> {
  const next: Record<string, string> = {}
  for (const [entityId, vehicleId] of Object.entries(map)) {
    if (entityId !== key) {
      next[entityId] = vehicleId
    }
  }
  return next
}

export interface AssignmentsState {
  /** assetId -> vehicleId */
  assetToVehicle: Record<string, string>
  /** incidentId -> vehicleId */
  incidentToVehicle: Record<string, string>

  assignAssetVehicle: (assetId: string, vehicleId: string) => void
  clearAssetVehicle: (assetId: string) => void
  assignIncidentVehicle: (incidentId: string, vehicleId: string) => void
  clearIncidentVehicle: (incidentId: string) => void
  setAll: (next: Pick<AssignmentsState, 'assetToVehicle' | 'incidentToVehicle'>) => void
}

/**
 * Manual vehicle↔activo/incidente assignment state
 * (docs/feature/maps-asign-vehicle.md §1). Client-only (in-memory), lost on
 * reload — the mock backend has no assignment endpoint.
 *
 * Asset ids and incident ids share the same numeric namespace in the mock data
 * (both start at `'1'`), so they are kept in **two separate maps** to avoid an
 * `assetId === incidentId` collision. Each map is `entityId -> vehicleId`,
 * enforcing "un activo/incidente tiene a lo sumo un vehículo"; the reverse
 * (one vehicle → many entities) needs no extra structure — it is every entry
 * pointing at the same `vehicleId`.
 *
 * Invalid pairs (vehicle no longer `ACTIVE`, asset no longer `OK`, incident no
 * longer `REPORTED`, or any of them deleted) are pruned by
 * `useReconcileAssignments` via `setAll` — see `reconcileAssignments.ts`.
 */
export const useAssignmentsStore = create<AssignmentsState>((set) => ({
  assetToVehicle: {},
  incidentToVehicle: {},

  assignAssetVehicle: (assetId, vehicleId) =>
    set((state) => ({ assetToVehicle: { ...state.assetToVehicle, [assetId]: vehicleId } })),

  clearAssetVehicle: (assetId) =>
    set((state) => ({ assetToVehicle: omitKey(state.assetToVehicle, assetId) })),

  assignIncidentVehicle: (incidentId, vehicleId) =>
    set((state) => ({
      incidentToVehicle: { ...state.incidentToVehicle, [incidentId]: vehicleId }
    })),

  clearIncidentVehicle: (incidentId) =>
    set((state) => ({ incidentToVehicle: omitKey(state.incidentToVehicle, incidentId) })),

  setAll: ({ assetToVehicle, incidentToVehicle }) => set({ assetToVehicle, incidentToVehicle })
}))
