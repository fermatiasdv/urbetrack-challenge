# SPEC — Fix: cobertura de `AssignmentControl.tsx` e `IncidentMarkersLayer.tsx`

- **Estado:** Aprobado
- **Fecha:** 2026-07-06
- **Relacionado:** `pnpm coverage` real corrido por el usuario tras
  [docs/feature/12-availability-alert.md](../feature/12-availability-alert.md), `docs/specs/architecture.md`
  (Quality Gates), `docs/specs/fix-vehicles-page-query-coverage.md` (mismo tipo de fix, mismo criterio)

## Objetivo

Llevar `AssignmentControl.tsx` e `IncidentMarkersLayer.tsx` a ≥80% en las cuatro métricas (statements,
branches, functions, lines) agregando tests reales para las ramas/funciones hoy no ejercitadas, sin
tocar lógica de producción. Reportado por `pnpm coverage`:

```text
IncidentMarkersLayer.tsx  | 100 | 92.3  | 33.33 | 100 | línea 35
AssignmentControl.tsx     | 85  | 100   | 66.66 | 85  | líneas 45-50
```

## Diagnóstico

- **`AssignmentControl.tsx` líneas 44-50 (`handleValueChange`):** ningún test de
  `AssignmentControl.test.tsx` ni de sus consumidores (`AssetMarkersLayer.test.tsx`,
  `IncidentMarkersLayer.test.tsx`) interactúa con el `Select` para disparar `onValueChange` — todos
  solo verifican el rótulo/valor ya renderizado. La función que traduce el sentinel `UNASSIGNED` a
  `onClear()` y cualquier otro valor a `onAssign(value)` nunca se ejecuta.
- **`IncidentMarkersLayer.tsx` línea 35 (`zones ?? []` dentro del `useMemo`):** todos los tests de
  `IncidentMarkersLayer.test.tsx` mockean `useZonesQuery` devolviendo `{ data: ZONES }` (siempre
  truthy) — la rama `zones` `undefined` (estado de carga real de la query, antes de que resuelva)
  nunca se ejercita.
- No hay ningún cambio de comportamiento de producción en ninguno de los dos casos: son huecos de
  test sobre ramas ya existentes, mismo patrón que `docs/specs/fix-vehicles-page-query-coverage.md`.
- El proyecto ya tiene el patrón establecido para interactuar con `Select` de Radix en tests
  (`VehiclesFilterBar.test.tsx`): `user.click(screen.getByRole('combobox', { name }))` seguido de
  `user.click(await screen.findByRole('option', { name }))`, apoyado en los polyfills de
  `hasPointerCapture`/`scrollIntoView` ya presentes en `client/src/test/setup.ts`.

## Cambios

| Archivo | Cambio | Motivo |
|---|---|---|
| `client/src/features/map/components/AssignmentControl.test.tsx` | 2 casos nuevos: (a) seleccionar un vehículo del combobox invoca `onAssign` con su `id`; (b) con un vehículo ya asignado, seleccionar "Sin asignar" invoca `onClear`. | Cubre las 2 ramas de `handleValueChange` (líneas 45-49). |
| `client/src/features/map/components/IncidentMarkersLayer.test.tsx` | 1 caso nuevo: `useZonesQuery` devuelve `{ data: undefined }` (estado de carga) — verifica que el layer igual renderiza el marcador del incidente independiente (con `zonesById` vacío, sin romper). | Cubre la rama `zones ?? []` cuando `zones` es `undefined` (línea 35). |

No se modifica `AssignmentControl.tsx` ni `IncidentMarkersLayer.tsx` (producción sin cambios).

## Verificación post-implementación

1. `pnpm --filter client test` — los casos nuevos pasan.
2. `pnpm --filter client coverage` — `AssignmentControl.tsx` e `IncidentMarkersLayer.tsx` en ≥80% en
   las 4 métricas, sin regresión en el resto de `map`.
3. `pnpm --filter client typecheck` y `pnpm --filter client lint` en verde.

## Estado de implementación

- ✅ `client/src/features/map/components/AssignmentControl.test.tsx`
- ✅ `client/src/features/map/components/IncidentMarkersLayer.test.tsx`
- ⏳ `pnpm --filter client coverage` — pendiente de confirmación del usuario (mismo problema de
  entorno ya documentado en specs previos: esta sesión no puede correr la suite real).
