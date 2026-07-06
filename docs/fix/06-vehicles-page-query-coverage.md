# Fix — Cobertura insuficiente en `VehiclesPage.tsx` y `useVehiclesQuery.ts`

- **ID:** FIX-006
- **Status:** Resuelto — ver `docs/specs/fix-vehicles-page-query-coverage.md`
- **Related:** `docs/specs/architecture.md` (Quality Gates, Estado global y data-fetching),
  `docs/specs/fix-router-coverage.md` (FIX-004, mismo tipo de gap)
- **Date:** 2026-07-06

## 1. Síntoma

Reporte de cobertura (`pnpm --filter client coverage`) para la feature `vehicles`:

```
VehiclesPage.tsx            |     100 |       50 |     100 |     100 | 12
useVehiclesQuery.ts         |   81.81 |    66.66 |     100 |   81.81 | 16-17,37-38
```

Ningún archivo cae por debajo del umbral global (80%) individualmente en statements/lines, pero
`useVehiclesQuery.ts` sí cae en statements/lines (81.81% > 80%, al límite) y ambos archivos están
por debajo de 80% en branches (50% y 66.66%), lo que erosiona el promedio global y deja sin cubrir
ramas de negocio reales.

## 2. Causa raíz

Ninguno de los dos archivos tiene un test dedicado:

- **`VehiclesPage.tsx` línea 12** — el ternario `isLoading ? <Skeleton /> : <VehicleStatusCards />`
  solo se ejerce en una rama porque el único lugar que renderiza `VehiclesPage` (si acaso) no
  controla el estado de `isLoading` de `useVehiclesQuery`. Falta un test que mockee
  `useVehiclesQuery` para forzar ambas ramas.
- **`useVehiclesQuery.ts` líneas 16-17** — el branch `if (!response.ok) throw ...` dentro de
  `fetchVehicles` nunca se ejercita: no hay ningún test que mockee `fetch` devolviendo `ok: false`.
- **`useVehiclesQuery.ts` líneas 37-38** — el `useEffect` que llama a `setVehicles(query.data)`
  nunca corre porque no hay ningún test que monte el hook con `QueryClientProvider` y espere a que
  la query resuelva con datos reales (mock de `fetch` exitoso).

## 3. Alcance del fix

Agregar tests de comportamiento (no tests triviales) que ejerciten las ramas faltantes:

1. `useVehiclesQuery.test.ts` — testea `fetchVehicles` (éxito y error `!response.ok`) y el hook
   completo (`renderHook` + `QueryClientProvider`), verificando que al resolver la query el store
   de Zustand queda hidratado (`useVehiclesStore.getState().vehicles`).
2. `VehiclesPage.test.tsx` — mockea `useVehiclesQuery` (vía `vi.mock`) para forzar
   `isLoading: true` (verifica que se ve el `Skeleton`) e `isLoading: false` (verifica que se
   renderiza `VehicleStatusCards`).

No se modifica lógica de producción: el gap es puramente de tests.
