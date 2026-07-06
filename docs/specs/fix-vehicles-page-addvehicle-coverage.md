# SPEC — Fix: cobertura de `handleAddVehicle` en `VehiclesPage.tsx` (SPEC-FIX-008)

- **Estado:** Aprobado
- **Fecha:** 2026-07-06
- **Relacionado:** `docs/fix/08-vehicles-page-addvehicle-coverage.md` (FIX-008, diagnóstico
  completo), `docs/specs/fix-vehicles-page-query-coverage.md` (FIX-006, mismo archivo)

## Objetivo

Llevar `VehiclesPage.tsx` a 100% en las cuatro métricas de cobertura agregando un test real que
ejercite `handleAddVehicle`, sin tocar lógica de producción.

## Cambios

| Archivo | Cambio | Motivo |
|---|---|---|
| `client/src/features/vehicles/pages/VehiclesPage.test.tsx` (se amplía) | Nuevo test: render con `isLoading: false`, `userEvent.click` sobre el botón `"Agregar Vehículo"` (`screen.getByRole('button', { name: 'Agregar Vehículo' })`), espiando `console.info` (`vi.spyOn(console, 'info')`) y asertando que fue llamado una vez con el mensaje del handler. | Cubre las líneas 14-16 (`handleAddVehicle`) hoy sin cobertura (functions 50% → 100%). |

No se modifica `VehiclesPage.tsx`: el gap es puramente de tests. `handleAddVehicle` sigue siendo el
placeholder documentado en su propio JSDoc (modal de alta pendiente de un spec futuro).

## Verificación post-implementación

1. `pnpm --filter client test` — el test nuevo pasa.
2. `pnpm --filter client coverage` — `VehiclesPage.tsx` en 100% statements/branches/functions/lines;
   sin regresión en el resto de la feature `vehicles`.
3. `pnpm --filter client typecheck` y `pnpm --filter client lint` en verde.

## Estado de implementación

- ✅ `client/src/features/vehicles/pages/VehiclesPage.test.tsx` ampliado con el test de click.
- ⏳ `pnpm --filter client coverage` — pendiente de confirmación local del usuario (ver limitación
  de entorno documentada en [chore 04](../chore/04-move-typed.md), sección "Incidente...").
