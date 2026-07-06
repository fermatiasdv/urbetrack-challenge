# SPEC — Fix: cobertura de `VehiclesPage.tsx` y `useVehiclesQuery.ts` (SPEC-FIX-006)

- **Estado:** Aprobado
- **Fecha:** 2026-07-06
- **Relacionado:** `docs/fix/06-vehicles-page-query-coverage.md` (FIX-006, diagnóstico completo),
  `docs/specs/architecture.md` (Quality Gates, Estado global y data-fetching)

## Objetivo

Llevar `VehiclesPage.tsx` y `useVehiclesQuery.ts` a ≥80% en las cuatro métricas (statements,
branches, functions, lines) agregando tests reales para las ramas hoy no ejercitadas, sin tocar
lógica de producción.

## Cambios

| Archivo | Cambio | Motivo |
|---|---|---|
| `client/src/features/vehicles/api/useVehiclesQuery.test.ts` (nuevo) | Testea `fetchVehicles` con `fetch` mockeado: (a) respuesta OK devuelve el JSON parseado, (b) respuesta `ok: false` lanza `Error` con el status. Testea el hook `useVehiclesQuery` con `renderHook` + `QueryClientProvider`: al resolver la query con datos, `useVehiclesStore` queda hidratado. | Cubre las líneas 16-17 (`throw` en `!response.ok`) y 37-38 (`useEffect` → `setVehicles`) hoy sin cobertura. |
| `client/src/features/vehicles/pages/VehiclesPage.test.tsx` (nuevo) | `vi.mock('../api/useVehiclesQuery')` para controlar `isLoading` directamente: un test con `isLoading: true` verifica que se renderiza el `Skeleton`; otro con `isLoading: false` verifica que se renderiza `VehicleStatusCards`. | Cubre ambas ramas del ternario en la línea 12 (branch coverage 50% → 100%). |

No se modifica ningún archivo de producción (`VehiclesPage.tsx`, `useVehiclesQuery.ts`,
`useVehiclesStore.ts`).

## Verificación post-implementación

1. `pnpm --filter client test` — los dos archivos nuevos pasan.
2. `pnpm --filter client coverage` — `VehiclesPage.tsx` y `useVehiclesQuery.ts` en 100% branches
   (o ≥80% si algún branch defensivo queda fuera de alcance) y ≥80% en las otras tres métricas;
   sin regresión en el resto de la feature `vehicles`.
3. `pnpm --filter client typecheck` y `pnpm --filter client lint` en verde.

## Estado de implementación

- ✅ `client/src/features/vehicles/api/useVehiclesQuery.test.ts`
- ✅ `client/src/features/vehicles/pages/VehiclesPage.test.tsx`
- ✅ `pnpm --filter client coverage` verificado localmente.
