import { create } from 'zustand'
import type { RawVehicle, VehicleRow } from './types'
import { zoneNameFor } from './types'

export interface VehiclesState {
  vehicles: VehicleRow[]
  setVehicles: (raw: RawVehicle[]) => void
  updatePlate: (id: string, plate: string) => void
}

function toRow(raw: RawVehicle): VehicleRow {
  return { ...raw, zoneName: zoneNameFor(raw.zoneId) }
}

export const useVehiclesStore = create<VehiclesState>((set) => ({
  vehicles: [],
  setVehicles: (raw) => set({ vehicles: raw.map(toRow) }),
  updatePlate: (id, plate) =>
    set((state) => ({
      vehicles: state.vehicles.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, plate } : vehicle
      )
    }))
}))
