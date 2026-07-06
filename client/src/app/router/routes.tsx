import { createRootRoute, createRoute } from '@tanstack/react-router'
import { AppLayout } from '../layout/AppLayout'
import { MapPage } from '../../features/map/pages/MapPage'
import { AssetsPage } from '../../features/assets/pages/AssetsPage'
import { VehiclesPage } from '../../features/vehicles/pages/VehiclesPage'
import { IncidentsPage } from '../../features/incidents/pages/IncidentsPage'

export const rootRoute = createRootRoute({
  component: AppLayout
})

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MapPage
})

const assetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activos',
  component: AssetsPage
})

const vehiclesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vehiculos',
  component: VehiclesPage
})

const incidentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/incidentes',
  component: IncidentsPage
})

export const routeTree = rootRoute.addChildren([
  mapRoute,
  assetsRoute,
  vehiclesRoute,
  incidentsRoute
])
