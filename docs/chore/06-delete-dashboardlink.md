# SPEC — Eliminar Dashboard y promover Mapa a ruta raíz

**Estado:** Aprobado (alcance ampliado tras revisión — ver historial de este documento)
**Fecha:** 2026-07-06
**Relacionado:** `client/src/app/layout/Sidebar.tsx`, `client/src/app/layout/Sidebar.test.tsx`,
`client/src/app/router/routes.tsx`, `client/src/app/router/router.test.tsx`,
`client/src/features/dashboard/`, `client/src/features/map/pages/MapPage.tsx`,
`docs/chore/03-navigation-shell-router.md`, `docs/feature/01-modify-sidebar.md`

## Diagnóstico

Hoy `Dashboard` existe en tres lugares:

1. **Link de sidebar** — `NAV_ITEMS` en `client/src/app/layout/Sidebar.tsx` (línea 30):
   `{ label: 'Dashboard', to: '/', icon: LayoutDashboard }`.
2. **Ruta** — `dashboardRoute` en `client/src/app/router/routes.tsx`, montada en `path: '/'`
   con `component: DashboardPage`.
3. **Página** — `client/src/features/dashboard/pages/DashboardPage.tsx` (placeholder:
   `<h1>Dashboard</h1>`), único archivo de la feature `dashboard` (no tiene tests, hooks, ni
   tipado propio).

Se pide eliminar Dashboard por completo (link + ruta + página) y que **Mapa** pase a cubrir la
ruta raíz `/`, dejando de existir una ruta separada `/mapa`. `MapPage` (`client/src/features/
map/pages/MapPage.tsx`) no depende del path en el que se monta — no lee params ni hace matching
sobre `/mapa` — por lo que reasignarla a `/` no requiere cambios en el componente.

## Cambio propuesto

### 1. Ruteo — `client/src/app/router/routes.tsx`

- Se elimina el import de `DashboardPage` y la constante `dashboardRoute`.
- `mapRoute` pasa de `path: '/mapa'` a `path: '/'`.
- `routeTree.addChildren([...])` pasa de 5 a 4 rutas: `mapRoute, assetsRoute, vehiclesRoute,
  incidentsRoute`.

```diff
-import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
 import { MapPage } from '../../features/map/pages/MapPage'
 ...
-const dashboardRoute = createRoute({
-  getParentRoute: () => rootRoute,
-  path: '/',
-  component: DashboardPage
-})
-
 const mapRoute = createRoute({
   getParentRoute: () => rootRoute,
-  path: '/mapa',
+  path: '/',
   component: MapPage
 })
 ...
 export const routeTree = rootRoute.addChildren([
-  dashboardRoute,
   mapRoute,
   assetsRoute,
   vehiclesRoute,
   incidentsRoute
 ])
```

### 2. Sidebar — `client/src/app/layout/Sidebar.tsx`

- Se elimina la entrada `Dashboard` de `NAV_ITEMS` y se cambia el `to` de `Mapas` de `/mapa` a
  `/`. Se conserva el label `Mapas` (label actual en `NAV_ITEMS`; el heading de `MapPage` dice
  "Mapa", ninguno de los dos cambia con este spec).
- Se elimina el import `LayoutDashboard` de `lucide-react` (línea 6), sin otro uso en el archivo.

```diff
 const NAV_ITEMS: readonly NavItem[] = [
-  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
-  { label: 'Mapas', to: '/mapa', icon: Map },
+  { label: 'Mapas', to: '/', icon: Map },
   { label: 'Registro de Activos', to: '/activos', icon: Package },
   { label: 'Vehículos', to: '/vehiculos', icon: Truck },
   { label: 'Incidentes', to: '/incidentes', icon: AlertTriangle }
 ]
```

### 3. Feature `dashboard` — eliminación

- Se borra el directorio `client/src/features/dashboard/` completo (único archivo:
  `pages/DashboardPage.tsx`).

### 4. Tests existentes a actualizar

- `client/src/app/layout/Sidebar.test.tsx`:
  - `renders the header and the five navigation links...` → pasa a cuatro links; se quita la
    aserción de `Dashboard`/`href="/"` y se agrega `Mapas` con `href="/"`.
  - `highlights the active route link...` y `keeps the same Radix Button variant...` usan hoy el
    link `Dashboard` como referencia de link *inactivo* — se reemplazan por otro link inactivo
    existente (p. ej. `Registro de Activos`).
- `client/src/app/router/router.test.tsx`:
  - `SCREENS` tiene una entrada `{ path: '/mapa', legend: 'Mapa' }` que pasa a
    `{ path: '/', legend: 'Mapa' }`.
  - Los dos tests que hacen `createTestRouter('/')` y esperan el heading `Dashboard` (`renders the
    Dashboard legend on the initial route` y el `beforeEach` implícito de `keeps the sidebar
    mounted...`) pasan a esperar el heading `Mapa`.
  - `routeTree.children` y `router.routeTree.children` pasan de longitud 5 a 4 en ambos tests
    (`registers the root layout plus the five expected screens` → cuatro pantallas).

## Fuera de alcance

- Cambiar el label de sidebar `Mapas` o el heading `Mapa` de `MapPage`.
- Tocar cualquier otro link de la sidebar (`Registro de Activos`, `Vehículos`, `Incidentes`).
- Cualquier lógica interna de `MapPage` más allá de su ruta de montaje.

## Verificación post-implementación

1. `Sidebar` renderiza cuatro links: `Mapas` (→ `/`), `Registro de Activos`, `Vehículos`,
   `Incidentes`. No existe ningún link ni heading `Dashboard` en la app.
2. `routeTree` tiene 4 rutas hijas; no existe `/mapa` ni ninguna ruta cuyo componente sea
   `DashboardPage`.
3. `client/src/features/dashboard/` no existe.
4. `pnpm --filter client test` pasa sin fallos.
5. `pnpm --filter client lint` no reporta imports sin uso (`LayoutDashboard`, `DashboardPage`).
6. `pnpm --filter client build` (o el equivalente `tsc`) no reporta referencias rotas a
   `features/dashboard`.

## Estado de implementación

- ✅ `client/src/app/router/routes.tsx` — `mapRoute` pasa a `path: '/'`, se elimina
  `dashboardRoute`/import de `DashboardPage`.
- ✅ `client/src/app/layout/Sidebar.tsx` — `NAV_ITEMS` sin entrada `Dashboard`, `Mapas` apunta a
  `/`, import `LayoutDashboard` eliminado.
- ✅ `client/src/features/dashboard/` — directorio eliminado.
- ✅ `client/src/app/layout/Sidebar.test.tsx` — actualizado a cuatro links; los tests de
  estilo activo/inactivo usan `Registro de Activos` como referencia inactiva y renderizan con
  `initialPath: '/'`.
- ✅ `client/src/app/router/router.test.tsx` — `SCREENS` con `{ path: '/', legend: 'Mapa' }`,
  longitudes de `routeTree`/`router` en 4, headings esperados `Mapa` en vez de `Dashboard`.
- ✅ Comentarios en `useSyncMapStore.ts` y `MapEntityTabs.tsx` que mencionaban `/mapa` se
  actualizaron a `/`.
- ⚠️ **Verificación automática bloqueada**: el sandbox de esta sesión tuvo errores de I/O
  intermitentes sobre el mount del proyecto (`ERR_PNPM_JSON_PARSE` / `Input/output error` al leer
  `client/package.json` y `node_modules` vía `pnpm`/`vitest`), no relacionados con estos cambios.
  No se pudo correr `pnpm --filter client test|lint|build` en esta sesión. Revisión manual de los
  diffs realizada; se recomienda correr esos tres comandos localmente antes de mergear.
