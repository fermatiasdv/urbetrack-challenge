# Fix — Cobertura insuficiente en `VehiclesPage.tsx` (`handleAddVehicle`)

- **ID:** FIX-008
- **Status:** Resuelto — ver `docs/specs/fix-vehicles-page-addvehicle-coverage.md`
- **Related:** `docs/specs/fix-vehicles-page-query-coverage.md` (FIX-006, mismo archivo, gap
  anterior ya resuelto), `docs/feature/05-vehicles-header.md` (origen de `handleAddVehicle`),
  `docs/specs/architecture.md` (Quality Gates)
- **Date:** 2026-07-06

## 1. Síntoma

Reporte de cobertura (`pnpm --filter client coverage`) para `VehiclesPage.tsx`:

```
VehiclesPage.tsx             |   88.88 |      100 |      50 |   88.88 | 14-16
```

Statements y lines caen a 88.88% (por debajo del umbral 80% no, pero por debajo del 100% que el
resto de la feature sostiene) y functions cae a 50%: de las dos funciones del archivo
(`handleAddVehicle` y `VehiclesPage`), solo una se ejercita en tests.

## 2. Causa raíz

`handleAddVehicle` (líneas 14-16) es el `onClick` del botón "Agregar Vehículo" del `HeaderPage`
(ver [feature 05](../feature/05-vehicles-header.md)). `VehiclesPage.test.tsx` (agregado en
[FIX-006](./06-vehicles-page-query-coverage.md)) verifica que el header y sus estados de carga se
rendericen, pero ningún test **clickea** el botón de acción, por lo que el handler nunca corre.

## 3. Alcance del fix

Agregar un test de comportamiento (no trivial) a `VehiclesPage.test.tsx`: renderizar la página con
`isLoading: false`, buscar el botón por su label (`"Agregar Vehículo"`), simular el click
(`@testing-library/user-event` o `fireEvent`) y verificar que `handleAddVehicle` corrió — espiando
`console.info` (única side-effect observable del handler hoy, ver su JSDoc: *"placeholder... modal
de alta pendiente de un spec futuro"*) y asertando el mensaje logueado.

No se modifica lógica de producción: el gap es puramente de tests. El comportamiento real de
"Agregar Vehículo" (abrir un modal de alta) sigue fuera de alcance hasta que exista un spec de
feature que lo desarrolle (ver [feature 05](../feature/05-vehicles-header.md), "Fuera de alcance").
