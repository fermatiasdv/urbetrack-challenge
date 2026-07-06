# SPEC — Fix: cobertura de `AssetMarkersLayer.tsx` e `IncidentMarkersLayer.tsx`

- **Estado:** Aprobado (pedido directo del usuario tras correr `pnpm coverage` real). Implementado
  en esta sesión.
- **Fecha:** 2026-07-06
- **Relacionado:** `pnpm coverage` corrido por el usuario, `docs/specs/fix-assignmentcontrol-incidentmarkerslayer-coverage.md`
  (mismo tipo de fix, mismo criterio: tests, no lógica de producción), `docs/specs/architecture.md`
  (Quality Gates, ≥80% en las 4 métricas)

## Objetivo

Llevar `AssetMarkersLayer.tsx` e `IncidentMarkersLayer.tsx` a ≥80% en las cuatro métricas
(statements, branches, functions, lines), agregando tests reales para las ramas/funciones hoy no
ejercitadas, sin tocar lógica de producción. Reportado por el usuario tras `pnpm coverage`:

```text
IncidentMarkersLayer.tsx  | 100 | 100   | 33.33 | 100
AssetMarkersLayer.tsx     | 100 | 93.75 | 50    | 100 | línea 43
```

## Diagnóstico

- **Funciones nunca invocadas en ninguno de los dos archivos:** los closures `onAssign`/`onClear`
  que cada `MarkersLayer` pasa a `AssignmentControl` (p. ej. en `AssetMarkersLayer.tsx`,
  `(vehicleId) => assignAssetVehicle(asset.id, vehicleId)` y `() => clearAssetVehicle(asset.id)`;
  análogamente en `IncidentMarkersLayer.tsx` con `assignIncidentVehicle`/`clearIncidentVehicle`) no
  se ejecutan en ningún test existente. `AssetMarkersLayer.test.tsx` e `IncidentMarkersLayer.test.tsx`
  solo verifican que el `Select` se muestre u oculte (`getByLabelText('Vehículo asignado')`), nunca
  interactúan con él para disparar una selección real — a diferencia de
  `AssignmentControl.test.tsx`, que sí ejercita `handleValueChange` pero con `onAssign`/`onClear`
  mockeados (`vi.fn()`), no con los closures reales de cada `MarkersLayer`.
- **`AssetMarkersLayer.tsx` línea 43 (`zones ?? []` dentro del `useMemo`):** todos los tests de
  `AssetMarkersLayer.test.tsx` mockeaban `useZonesQuery` devolviendo `{ data: ZONES }` (siempre
  truthy) — la rama `zones` `undefined` (estado de carga real de la query) nunca se ejercitaba.
  `IncidentMarkersLayer.test.tsx` ya tenía este caso cubierto (agregado en
  `docs/specs/fix-assignmentcontrol-incidentmarkerslayer-coverage.md`), pero nunca se replicó en
  `AssetMarkersLayer.test.tsx`.
- No hay ningún cambio de comportamiento de producción: son huecos de test sobre ramas/funciones ya
  existentes, mismo patrón que los dos fixes de cobertura previos citados arriba.
- El proyecto ya tiene el patrón establecido para interactuar con `Select` de Radix en tests
  (`AssignmentControl.test.tsx`, `VehiclesFilterBar.test.tsx`): `user.click(screen.getByLabelText(...))`
  seguido de `user.click(await screen.findByRole('option', { name }))`.

## Cambios

| Archivo | Cambio | Motivo |
|---|---|---|
| `client/src/features/map/components/AssetMarkersLayer.test.tsx` | 4 casos nuevos: (a) sigue renderizando con `zones` `undefined` (estado de carga); (b) seleccionar un vehículo del combobox invoca `assignAssetVehicle` (verificado leyendo `useAssignmentsStore.getState()`); (c) con un vehículo ya asignado, seleccionar "Sin asignar" invoca `clearAssetVehicle`. | Cubre la rama `zones ?? []` (línea 43) y los closures `onAssign`/`onClear` nunca invocados. |
| `client/src/features/map/components/IncidentMarkersLayer.test.tsx` | 2 casos nuevos: seleccionar un vehículo invoca `assignIncidentVehicle`; con un vehículo ya asignado, "Sin asignar" invoca `clearIncidentVehicle`. | Cubre los closures `onAssign`/`onClear` de este layer, nunca invocados. |

No se modifica `AssetMarkersLayer.tsx` ni `IncidentMarkersLayer.tsx` (producción sin cambios).

## Verificación post-implementación

1. `pnpm --filter client test` — los casos nuevos pasan.
2. `pnpm --filter client coverage` — `AssetMarkersLayer.tsx` e `IncidentMarkersLayer.tsx` en ≥80%
   en las 4 métricas, sin regresión en el resto de `map`.
3. `pnpm --filter client typecheck`, `pnpm --filter client lint` y `pnpm run format:check` en verde.

## Estado de implementación

- ✅ `client/src/features/map/components/AssetMarkersLayer.test.tsx`
- ✅ `client/src/features/map/components/IncidentMarkersLayer.test.tsx`
- ⏳ `pnpm --filter client coverage` — pendiente de confirmación del usuario (mismo problema de
  entorno ya documentado en specs previos: esta sesión no puede correr la suite real de forma
  confiable).
