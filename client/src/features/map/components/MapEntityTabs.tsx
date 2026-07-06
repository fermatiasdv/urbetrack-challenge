import type { JSX } from 'react'
import { Tabs } from '@radix-ui/themes'
import { AssetsTable } from '../../assets/components/AssetsTable'
import { VehiclesTable } from '../../vehicles/components/VehiclesTable'
import { IncidentsTable } from '../../incidents/components/IncidentsTable'
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
    </Tabs.Root>
  )
}
