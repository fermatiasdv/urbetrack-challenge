# SPEC — Fix: cobertura global bajo el 80% tras el shell de navegación (SPEC-003)

**Estado:** Aprobado
**Fecha:** 2026-07-05
**Relacionado:** `docs/fix/04-router-coverage.md` (FIX-004, diagnóstico completo),
`docs/chore/03-navigation-shell-router.md` (SPEC-003), `docs/specs/architecture.md` (Quality Gates,
Estrategia de testing)

## Objetivo

Devolver `pnpm coverage` a verde (statements/functions/branches/lines ≥ 80%) sin exclusiones
injustificadas, cubriendo con tests reales el código nuevo de SPEC-003 (router, layout, sidebar,
pantallas) y resolviendo la deuda preexistente que agravó el problema (`tokens.ts` en 0%, `App.tsx`
huérfano).

## Diagnóstico (resumen — detalle completo en `docs/fix/04-router-coverage.md`)

Ningún archivo de test importa el código nuevo de SPEC-003 (`router.ts`, `routes.tsx`,
`AppLayout.tsx`, `Sidebar.tsx`, las 5 páginas placeholder), por lo que V8 los marca en 0%.
Adicionalmente, `src/app/styles/tokens.ts` ya estaba en 0% de líneas antes de este chore (nadie lo
importa) y `src/App.tsx` quedó huérfano (`main.tsx` ya monta `RouterProvider`, no `<App />`) — ambos
agravan el promedio global.

## Decisión (usuario, 2026-07-05)

Se aprueban las cuatro líneas de acción propuestas en `docs/fix/04-router-coverage.md`, incluida la
eliminación de `App.tsx`. Cita: *"Si a todo, incluso eliminar App.tsx."*

## Cambios

| Archivo | Cambio | Motivo |
|---|---|---|
| `client/src/app/router/router.test.tsx` (nuevo) | Test de integración: `RouterProvider` con `createMemoryHistory`, navega las 5 rutas | Cubre `router.ts`, `routes.tsx`, `AppLayout.tsx` y las 5 páginas; verifica en código el criterio de aceptación 26 (`verified-scope.md` §11.6): la sidebar no se remonta al navegar |
| `client/src/app/layout/Sidebar.test.tsx` (nuevo) | Renderiza `Sidebar` sola con un router mínimo de test; verifica logo y los 5 enlaces con su `href` | Cubre ramas de `Sidebar.tsx` (incluida `activeProps`) no necesariamente ejercitadas por el test de integración |
| `client/src/app/styles/tokens.test.ts` (nuevo) | Test mínimo: importa `designTokens` y verifica algunos valores de color/tipografía/espaciado | Opción A de FIX-004: el módulo es un único objeto literal — con importarlo y tocar unas pocas propiedades, V8 marca el archivo completo (~140 líneas) como ejecutado |
| `client/vite.config.ts` | `coverage.exclude: [...coverageConfigDefaults.exclude, 'src/main.tsx']` | `main.tsx` es bootstrap puro (crea el root de React y monta providers), sin lógica de negocio ni ramas — patrón estándar de excluir el entry point de la métrica |
| `client/src/App.tsx` | Eliminar | Huérfano desde que `main.tsx` monta `RouterProvider` en vez de `<App />` (ver SPEC-003) — no tiene sentido mantener cobertura sobre un componente sin consumidores |

No se modifican los umbrales de `docs/specs/architecture.md` (siguen en 80% para las cuatro
métricas) ni la lógica de negocio de ningún componente existente.

## Verificación post-implementación

1. `pnpm --filter client coverage` pasa sin errores de umbral.
2. `pnpm --filter client typecheck` y `pnpm --filter client lint` en verde.
3. `pnpm --filter client format:check` en verde para los archivos nuevos.
4. Romper deliberadamente el layout persistente (ej. sacar el `<Outlet />` de `AppLayout`) hace
   fallar `router.test.tsx` — confirma que el test de integración es una regresión real del
   criterio de aceptación 26, no un test vacío.
5. `git status` no muestra `client/src/App.tsx`.

## Estado de implementación

- ✅ `client/src/app/router/router.test.tsx` — test de integración (render con `createMemoryHistory`,
  navega las 5 rutas, verifica que el nodo de la sidebar persiste) + verifica `routeTree` y `router`.
- ✅ `client/src/app/layout/Sidebar.test.tsx` — verifica logo y los 5 enlaces con su `href`.
- ✅ `client/src/app/styles/tokens.test.ts` — test de forma sobre `designTokens`.
- ✅ `client/vite.config.ts` — `coverage.exclude` extendido con `src/main.tsx`.
- ✅ `client/src/test/setup.ts` — se agregó un stub de `window.scrollTo` (jsdom no lo implementa;
  la restauración de scroll de TanStack Router lo invoca en cada navegación y generaba ruido en
  stderr durante los tests).
- ✅ `client/src/App.tsx` — eliminado.
- ✅ Verificado localmente: `pnpm typecheck`, `pnpm lint` y `pnpm format:check` en verde;
  `pnpm coverage` pasa con 97.26% statements, 92.3% branches, 100% functions, 97.26% lines (umbral
  80% en las cuatro métricas).
