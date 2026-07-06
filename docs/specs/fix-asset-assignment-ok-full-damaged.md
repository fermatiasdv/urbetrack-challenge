# SPEC — Fix: asignación manual de vehículo a activos `FULL`/`DAMAGED` (no solo `OK`)

- **Estado:** Aprobado por el usuario (2026-07-06). Implementado en esta sesión.
- **Fecha:** 2026-07-06
- **Relacionado:** [docs/feature/maps-asign-vehicle.md](../feature/maps-asign-vehicle.md) (spec
  fundacional del sistema de asignación manual), `docs/feature/11-vehicle-assignment-engine.md`
  (motor automático, no afectado por este fix), `docs/specs/architecture.md`

## Objetivo

Ampliar el gating de "activo asignable" del sistema de asignación manual: hoy solo un activo en
estado `OK` puede recibir un vehículo asignado; debe poder asignarse también en `FULL` y `DAMAGED`.
Solo `OUT_OF_SERVICE` queda fuera. Las reglas para vehículo (`ACTIVE` + misma zona) e incidente
(`REPORTED`) no cambian.

## Reglas de negocio vigentes vs. pedidas

Confirmado leyendo `client/src/features/map/utils/vehicleEligibility.ts`,
`client/src/shared/services/assignments/reconcileAssignments.ts` y
`client/src/features/map/components/AssetMarkersLayer.tsx` (implementación actual del spec
`maps-asign-vehicle.md`):

| Regla pedida | Estado actual | Gap |
|---|---|---|
| Solo vehículos `ACTIVE` se pueden asignar | ✅ `vehicleEligibility.ts` (`isActiveInZone`), excluye `MAINTENANCE`/`OUT_OF_SERVICE` | Ninguno |
| Solo a la zona en la que trabajan (vehículo) | ✅ `vehicleEligibility.ts` compara `zoneId` del vehículo (normalizado a `SupportedZone`) contra la `derivedZone` del activo/incidente | Ninguno |
| Si el vehículo asignado cambia de estado, se desvincula | ✅ `reconcileAssignments.ts` poda el par cuando el vehículo deja de ser `ACTIVE` | Ninguno |
| Activos asignables: `OK`, `FULL` o `DAMAGED` (no `OUT_OF_SERVICE`) | ❌ Hoy solo `OK` (`AssetMarkersLayer.tsx:57` y `reconcileAssignments.ts:38`) | **Gap real — objeto de este fix** |
| Incidentes asignables: solo `REPORTED` | ✅ `AssetMarkersLayer`/`IncidentMarkersLayer` gating + `reconcileAssignments.ts` | Ninguno |

El único cambio de comportamiento es ampliar el estado de activo que habilita asignación.

## Diagnóstico

- **`AssetMarkersLayer.tsx` línea 57:** `asset.status === 'OK'` decide si se monta
  `AssignmentControl` dentro del `Popup`; en cualquier otro estado se muestra el texto "La asignación
  de vehículo requiere que el activo esté en estado OK." Hay que ampliar la condición a
  `OK | FULL | DAMAGED` y ajustar el texto para reflejar que solo `OUT_OF_SERVICE` bloquea.
- **`reconcileAssignments.ts` línea 38:** `okAssetIds` se construye filtrando `status === 'OK'`;
  con esto cualquier asignación a un activo que pase a `FULL`/`DAMAGED` se poda incorrectamente hoy.
  Hay que ampliar el filtro a `OK | FULL | DAMAGED` (se sigue podando solo ante `OUT_OF_SERVICE` o
  borrado).
- **`vehicleEligibility.ts` no requiere cambios:** `eligibleVehiclesForAsset`/`eligibleVehiclesForIncident`
  no filtran por estado del activo/incidente (eso es responsabilidad de la capa de gating en los
  `MarkersLayer` y de `reconcileAssignments`), así que la matriz de compatibilidad y el filtro
  `ACTIVE` + zona no se tocan.
- **Incidentes no cambian:** ya solo se asignan en `REPORTED`; el pedido lo confirma explícitamente
  ("las incidencias solo las que están reportadas") sin pedir ampliación.
- **Test que se rompe y debe actualizarse:** `reconcileAssignments.test.ts` —
  *"drops an asset assignment when the asset is no longer OK"* usa `status: 'FULL'` como caso de
  poda; con el nuevo comportamiento ese caso pasa a ser válido (no se debe podar). Se reemplaza por
  un caso que pruebe `OUT_OF_SERVICE` como motivo de poda, y se agrega un caso positivo que confirme
  que `FULL`/`DAMAGED` mantienen la asignación.

## Cambios

| Archivo | Cambio | Motivo |
|---|---|---|
| `client/src/features/map/components/AssetMarkersLayer.tsx` | Condición de gating pasa de `asset.status === 'OK'` a `asset.status !== 'OUT_OF_SERVICE'` (equivalente a `OK \| FULL \| DAMAGED`); actualizar el texto del mensaje de fallback y el comentario JSDoc del componente. | Permitir asignar a activos `FULL`/`DAMAGED`, no solo `OK`. |
| `client/src/shared/services/assignments/reconcileAssignments.ts` | `okAssetIds` (renombrar a `assignableAssetIds` o similar) se construye filtrando `status !== 'OUT_OF_SERVICE'` en vez de `status === 'OK'`; actualizar JSDoc de la función. | Evitar que la reconciliación pode asignaciones válidas a activos `FULL`/`DAMAGED`. |
| `client/src/shared/services/assignments/reconcileAssignments.test.ts` | Reemplazar el caso *"drops an asset assignment when the asset is no longer OK"* por *"drops an asset assignment when the asset is OUT_OF_SERVICE"*; agregar casos nuevos: *"keeps an asset assignment when the asset is FULL"* y *"keeps an asset assignment when the asset is DAMAGED"*. | Test que congelaba el comportamiento anterior debe reflejar la regla ampliada. |
| `client/src/features/map/components/AssetMarkersLayer.test.tsx` | Ajustar/agregar casos: un activo `FULL` y uno `DAMAGED` muestran `AssignmentControl`; un activo `OUT_OF_SERVICE` muestra el mensaje de fallback (en vez de "cualquier estado ≠ OK"). | Cubrir el nuevo gating por marcador. |
| `docs/feature/maps-asign-vehicle.md` | Actualizar "Cuándo se muestra el `Select`" (activo) de `status === 'OK'` a `status !== 'OUT_OF_SERVICE'` (`OK \| FULL \| DAMAGED`), y CA-01/CA-03/CA-08 en criterios de aceptación. | Mantener el spec fundacional consistente con el comportamiento real tras este fix. |

No se modifica `vehicleEligibility.ts`, `IncidentMarkersLayer.tsx`, `useAssignmentsStore.ts` ni el
motor automático (`assignVehicles.ts` y afines) — fuera de alcance de este fix.

## Fuera de alcance

- Cambiar la regla de zona o de estado del vehículo (ya cumplen lo pedido).
- Cambiar el gating de incidentes (ya solo `REPORTED`).
- El motor automático de disponibilidad (`docs/feature/11-vehicle-assignment-engine.md`), que usa
  su propia noción de zona como prioridad, no como filtro excluyente — no forma parte de este pedido.

## Criterios de aceptación

- **CA-01:** Click en un marcador de activo `OK`, `FULL` o `DAMAGED` abre un `Popup` con el `Select`
  de vehículos elegibles.
- **CA-02:** Click en un marcador de activo `OUT_OF_SERVICE` muestra el mensaje de fallback, sin
  `Select`.
- **CA-03:** Un activo asignado que pasa a `OUT_OF_SERVICE` pierde su asignación automáticamente
  (reconciliación); si pasa a `FULL` o `DAMAGED` la conserva.
- **CA-04:** El comportamiento de incidentes (gating `REPORTED`, reconciliación) no cambia.

## Verificación post-implementación

1. `pnpm --filter client test` — casos nuevos/actualizados en verde, sin regresión en el resto de
   `assignments`/`map`.
2. `pnpm --filter client coverage` — sin caída por debajo de 80% en los archivos tocados.
3. `pnpm --filter client typecheck` y `pnpm --filter client lint` en verde.
4. Revisión manual en `/` (Mapa): click en activo `FULL` y `DAMAGED` muestra el `Select`; click en
   `OUT_OF_SERVICE` no lo muestra; cambiar un activo asignado a `OUT_OF_SERVICE` desde `/activos`
   hace desaparecer la asignación.

## Estado de implementación

- ✅ `client/src/features/map/components/AssetMarkersLayer.tsx` — gating `status !== 'OUT_OF_SERVICE'`,
  mensaje de fallback y JSDoc actualizados.
- ✅ `client/src/shared/services/assignments/reconcileAssignments.ts` — `assignableAssetIds` filtra
  `status !== 'OUT_OF_SERVICE'` en vez de `status === 'OK'`; JSDoc actualizado.
- ✅ `client/src/shared/services/assignments/reconcileAssignments.test.ts` — reemplazado el caso de
  `FULL` como poda por `OUT_OF_SERVICE`; agregados casos que confirman que `FULL`/`DAMAGED` conservan
  la asignación.
- ✅ `client/src/features/map/components/AssetMarkersLayer.test.tsx` — agregados casos para `FULL`,
  `DAMAGED` (control visible) y `OUT_OF_SERVICE` (control oculto, mensaje de fallback actualizado).
- ✅ `docs/feature/maps-asign-vehicle.md` — gating de activo, desasignación automática y CA-01/03/08
  actualizados a `OK | FULL | DAMAGED` / `OUT_OF_SERVICE`.
- ⏳ `pnpm --filter client typecheck` / `lint` / `test` — no se pudieron correr en esta sesión: el
  bridge de archivos entre el sandbox y la carpeta montada rompe la resolución de symlinks de
  `node_modules/.bin` y de paquetes hospedados en el store de pnpm (`Input/output error` al leer
  `node_modules/typescript`, `EPERM`/"readonly database" al intentar reconstruir), mismo problema de
  entorno ya documentado en `docs/specs/fix-assignmentcontrol-incidentmarkerslayer-coverage.md` y
  otros specs previos. Revisé el diff manualmente (tipos, imports y ramas quedan coherentes) pero
  falta la confirmación real del usuario corriendo `pnpm --filter client typecheck && pnpm --filter
  client lint && pnpm --filter client test` en su entorno.
