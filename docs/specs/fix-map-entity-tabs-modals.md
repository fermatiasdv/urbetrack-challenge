# SPEC — Fix: los modales de las tablas no se abren en Mapa

- **Estado:** Aprobado e implementado
- **Fecha:** 2026-07-06
- **Relacionado:** `client/src/features/map/components/MapEntityTabs.tsx`,
  `client/src/features/assets/components/AssetModal.tsx`,
  `client/src/features/vehicles/components/VehicleModal.tsx`,
  `client/src/features/incidents/components/IncidentModal.tsx`

## Pedido del usuario

En Mapa (`/`), las 3 tablas (Activos/Vehículos/Incidentes, vía `MapEntityTabs`) reusan las mismas
`AssetsTable`/`VehiclesTable`/`IncidentsTable` de sus páginas propias. Al abrir el modal de
edición/detalle de una fila desde Mapa, el modal "se abre en la página de origen" (ej. `/activos`)
en vez de mostrarse ahí mismo, en Mapa — cuando se abre desde la página propia (ej. `/activos`),
sí se muestra correctamente ahí.

## Diagnóstico

Cada feature sigue el mismo patrón: un store zustand de modal (`useAssetModalStore`,
`useVehicleModalStore`, `useIncidentModalStore`, todos con forma `{ id, mode, open, openCreate,
close }`) que **no depende de la ruta/URL**, y un componente `<XModal />` que lee ese store y
renderiza el `Dialog` cuando `mode !== null`.

El componente `<XModal />` está montado **únicamente** en la página propia de cada entidad:

- `AssetModal` → solo en `AssetsPage.tsx` (junto a `AssetsTable`).
- `VehicleModal` → solo en `VehiclesPage.tsx`.
- `IncidentModal` → solo en `IncidentsPage.tsx`.

`MapEntityTabs.tsx` (montado en `MapPage.tsx`, ruta `/`) reusa las 3 `*Table`, pero **no** monta
ninguno de los 3 `*Modal`. El botón "Editar"/"Ver detalle" de cada fila (`*RowActionsMenu.tsx`)
solo hace `useXModalStore.getState().open(id, mode)` — un cambio de estado en un store global, sin
ningún `navigate()` ni `<Link>` de por medio.

Como el store es global (zustand, fuera del árbol de React Router), el cambio de estado ocurre
igual sin importar en qué ruta se disparó. Pero como en `/` no hay ningún `<XModal />` montado que
lo lea, **no se ve nada ahí** — recién se hace visible cuando el usuario navega a la página propia
de esa entidad (donde el modal sí está montado) y encuentra el store ya en estado "abierto". Eso es
lo que se percibe como "el modal se abrió en la otra página": en realidad nunca hubo overlay en
Mapa, y el que sí existe en la página propia lee un estado que ya estaba en `'edit'`/`'details'`.

## Cambio

| Archivo | Cambio |
|---|---|
| `client/src/features/map/components/MapEntityTabs.tsx` | Importa y monta `<AssetModal />`, `<VehicleModal />` e `<IncidentModal />` (sin props, mismo uso que en sus páginas propias), una vez cada uno, fuera de `Tabs.Content` — para que estén disponibles sin importar cuál de las 3 pestañas está activa. |
| `client/src/features/map/components/MapEntityTabs.test.tsx` | Los 3 modales llaman `useZonesQuery` (react-query) incondicionalmente aunque estén cerrados (`mode === null`, renderizan `null` recién después de ese hook). El test no tenía `QueryClientProvider` — se agrega (mismo wrapper que `MapPage.test.tsx`) más un stub de `fetch` en `beforeEach`/`afterEach`, sin lo cual las 3 pruebas fallaban con `"No QueryClient set"`. |

Con esto, abrir el modal desde la tabla dentro de Mapa lo muestra ahí mismo (Mapa monta su propia
instancia de `<XModal />`, leyendo el mismo store global). Abrir el modal desde `/activos`,
`/vehiculos` o `/incidentes` sigue funcionando igual que antes — cada página sigue montando su
propio `<XModal />`.

Nota: como el store es global y no está scopeado por ruta, si un modal quedara abierto y el
usuario navegara manualmente a la página propia de esa entidad, seguiría viéndose abierto ahí
también (mismo comportamiento que ya existía antes de este fix, no introducido por él — no pedido
resolver ese caso).

## Fuera de alcance

- Scopear el store de modal por ruta (para que se cierre solo al navegar) — no fue parte del
  pedido, y cambiaría el comportamiento actual del resto de la app.
- Cambios en `AssetModal.tsx`/`VehicleModal.tsx`/`IncidentModal.tsx` en sí (siguen siendo
  componentes sin props, sin lógica de ruta).

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `test` sobre `MapEntityTabs.tsx` y su test.
2. Verificación manual: desde Mapa (`/`), abrir "Editar"/"Ver detalle" en una fila de cada una de
   las 3 tablas — el modal debe abrirse ahí mismo, sin navegar. Desde `/activos`/`/vehiculos`/
   `/incidentes`, el mismo flujo sigue abriendo el modal en esa página.
