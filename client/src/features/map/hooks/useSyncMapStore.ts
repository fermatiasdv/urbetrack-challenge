import { useEffect } from 'react'
import { useAssetsQuery } from '../../../shared/services/assets/useAssetsQuery'
import { useAssetsStore } from '../../../shared/services/assets/useAssetsStore'
import { useIncidentsQuery } from '../../../shared/services/incidents/useIncidentsQuery'
import { useIncidentsStore } from '../../../shared/services/incidents/useIncidentsStore'
import { useMapStore } from '../store/useMapStore'

/**
 * Mounts the shared `assets`/`incidents` queries (same `['assets']`/
 * `['incidents']` query keys as `features/assets`/`features/incidents`, so
 * visiting `/` (Mapa, docs/chore/06-delete-dashboardlink.md) triggers at most the same single
 * `GET /assets`/`GET /incidents` per app session — no duplicate fetch, docs/feature/10-maps-create.md
 * decisión #3/CA-14) and keeps `MapStore` synced against the shared stores.
 *
 * Recomputes `MapStore` every time the shared `assets`/`incidents` arrays
 * change identity — including local mutations made from `/activos`/
 * `/incidentes` (alta, edición, borrado), so the map never goes stale
 * relative to those screens.
 */
export function useSyncMapStore(): { isLoading: boolean } {
  const assetsQuery = useAssetsQuery()
  const incidentsQuery = useIncidentsQuery()
  const assets = useAssetsStore((state) => state.assets)
  const incidents = useIncidentsStore((state) => state.incidents)
  const syncFromShared = useMapStore((state) => state.syncFromShared)

  useEffect(() => {
    syncFromShared(assets, incidents)
  }, [assets, incidents, syncFromShared])

  return { isLoading: assetsQuery.isLoading || incidentsQuery.isLoading }
}
