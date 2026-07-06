import type { JSX } from 'react'
import { Tabs } from '@radix-ui/themes'
import { AssetsTable } from '../../assets/components/AssetsTable'
import { AssetModal } from '../../assets/components/AssetModal'
import { VehiclesTable } from '../../vehicles/components/VehiclesTable'
import { VehicleModal } from '../../vehicles/components/VehicleModal'
import { IncidentsTable } from '../../incidents/components/IncidentsTable'
import { IncidentModal } from '../../incidents/components/IncidentModal'
import { useVehiclesQuery } from '../../vehicles/api/useVehiclesQuery'

/**
 * 3 tabs below the map — Activos, Vehículos, Incidentes — reusing the
 * existing tables of each feature as-is (docs/feature/10-maps-create.md,
 * decisión #2), without their filter bar or `StatusSummaryCards`. Each table
 * keeps its own paginación (`TablePagination`/`TABLE_PAGE_SIZE`) and reads
 * from its feature's `useFiltered*` hook — since no filter bar is rendered
 * here, that hook returns the unfiltered dataset unless a filter was left
 * set from `/activos`/`/vehiculos`/`/incidentes` (shared global filter
 * stores, not reset by navigation).
 *
 * `useVehiclesQuery()` is mounted here (not only in `VehiclesPage`) so the
 * "Vehículos" tab has data even when `/` (Mapa) is opened directly without
 * first visiting `/vehiculos` — same "query hydrates store, hydrated once"
 * pattern, `hasHydrated` prevents a duplicate/competing hydration if both
 * pages mount in the same session.
 *
 * Also mounts `AssetModal`/`VehicleModal`/`IncidentModal` (docs/specs/
 * fix-map-entity-tabs-modals.md): each row's "Editar"/"Ver detalle" action
 * only flips a state flag on a global zustand store (`useXModalStore`), not
 * tied to the route. Without its own `<XModal />` mounted here, opening one
 * from Mapa changed that global state but rendered nothing visible on this
 * page — the overlay only appeared once the user navigated to that entity's
 * own page (the only place it used to be mounted).
 */
export function MapEntityTabs(): JSX.Element {
  useVehiclesQuery()

  return (
    <Tabs.Root defaultValue="assets">
      <Tabs.List>
        <Tabs.Trigger value="assets">Activos</Tabs.Trigger>
        <Tabs.Trigger value="vehicles">Vehículos</Tabs.Trigger>
        <Tabs.Trigger value="incidents">Incidentes</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="assets">
        <AssetsTable />
      </Tabs.Content>
      <Tabs.Content value="vehicles">
        <VehiclesTable />
      </Tabs.Content>
      <Tabs.Content value="incidents">
        <IncidentsTable />
      </Tabs.Content>

      <AssetModal />
      <VehicleModal />
      <IncidentModal />
    </Tabs.Root>
  )
}
