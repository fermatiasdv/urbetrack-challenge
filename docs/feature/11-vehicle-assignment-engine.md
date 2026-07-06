# SPEC — Motor de asignación vehículo↔activo/incidente (§5)

**Tipo:** feature
**Estado:** Aprobado (2026-07-06) — gaps resueltos, ver "Decisiones confirmadas". Bloqueante
únicamente para `AvailabilityAlert` en [docs/feature/10-maps-create.md](./10-maps-create.md)
(decisión #1 de ese spec, 2026-07-06); el resto de la feature `map` no depende de este documento.
`AvailabilityAlert` en sí **no se implementa** en este cambio (sigue sin existir en `MapPage`,
ver "Fuera de alcance").
**Fecha:** 2026-07-06
**Relacionado:** [docs/verified-scope.md](../verified-scope.md) §5, §9 (criterios 15-17),
[docs/feature/10-maps-create.md](./10-maps-create.md), [docs/specs/architecture.md](../specs/architecture.md),
`shared/services/assets/`, `shared/services/incidents/`, `features/vehicles/`

## Objetivo

Implementar el motor de asignación que determina, para un conjunto de vehículos, activos e
incidentes, qué vehículo (si alguno) atiende a qué incidente/activo, y derivar de ahí si una zona
tiene o no vehículos disponibles — el dato que consume `AvailabilityAlert` en la pantalla de Mapa.

## Reglas de negocio (verified-scope.md §5)

### Compatibilidad vehículo → tipo de activo

| Vehículo | Puede operar activos de tipo |
|---|---|
| `PICKUP` | `BENCH` únicamente |
| `VAN` | `BENCH` o `BIN` |
| `TRUCK` | `BENCH`, `BIN` o `CONTAINER` |

### Exclusiones

- Vehículos en `MAINTENANCE` u `OUT_OF_SERVICE` no se consideran para asignación.
- Activos en `OUT_OF_SERVICE` no generan asignaciones; sus incidentes asociados se descartan del
  proceso de asignación (no generan una asignación, aunque sigan visibles en mapa/tablas).

### Prioridad de selección de vehículo (cuando hay más de uno apto para un mismo activo)

1. Que se encuentre `ACTIVE`.
2. Que pertenezca a la misma zona que el activo (zona derivada geográficamente para el activo,
   `zoneId` traducido a nombre para el vehículo — ver [docs/feature/10-maps-create.md](./10-maps-create.md)
   §10.4/§10.5 de `verified-scope.md` sobre por qué ambas zonas no se comparan por `zoneId` crudo del
   lado del activo).
3. Que tenga la menor capacidad posible que alcance para resolver el incidente (sin sobre-asignar
   capacidad).

### Prioridad entre tipos de incidente (contención)

Cuando varios incidentes compiten por los mismos vehículos disponibles, se procesan en el orden:

```text
OVERFLOW > DAMAGE > LITTERING > OTHER
```

Un vehículo ya asignado a un incidente de mayor prioridad deja de estar disponible para incidentes
de menor prioridad en la misma pasada de cálculo.

## Diagnóstico

- Ningún archivo del repo implementa esta lógica hoy (`grep` sobre "assignment"/"asignaci" no
  arroja código, solo texto de specs y `verified-scope.md`).
- El campo "capacidad que alcanza para resolver el incidente" no está definido cuantitativamente en
  ningún lado: `Incident` no tiene un campo de "volumen"/"peso" a resolver, solo
  `type`/`status`/`description`. Se necesita una regla explícita de qué significa "capacidad
  suficiente" para un incidente — ver "Gaps".
- `Vehicle.zoneId` es la zona asignada por el backend (no geográfica); `Asset` sí tiene
  coordenadas y por lo tanto zona derivada (`deriveZone`, MAP-00). Comparar "misma zona" entre
  ambos requiere decidir si se usa `zoneId` crudo de ambos lados (simple, pero infiel a la regla ya
  aprobada en MAP-00 de no confiar en `zoneId` de activos) o si el vehículo se compara por su
  `zoneId` contra la **zona derivada** del activo (más consistente con MAP-00, ya que el `zoneId` de
  vehículos es la única zona disponible para ellos — no tienen coordenadas).

## Decisiones confirmadas (resuelven los gaps abiertos, 2026-07-06)

1. **Capacidad suficiente — regla fija por `AssetType`.** `BENCH` no exige capacidad mínima (cualquier
   vehículo compatible alcanza), `BIN` exige `vehicle.capacity >= 1000`, `CONTAINER` exige
   `vehicle.capacity >= 2000`. Equivale 1:1 a la tabla de compatibilidad ya dada (`PICKUP` hasta
   1000kg solo `BENCH`, `VAN` hasta 2000kg `BENCH`/`BIN`, `TRUCK` hasta 5000kg los 3).
2. **Alcance de "vehículos disponibles para una zona" — opción (a).** `zoneHasAvailableVehicle`
   devuelve `false` cuando la zona no tiene **ningún** vehículo `ACTIVE`, independientemente de si
   hay incidentes pendientes o no. No depende de `assignVehicles` ni de incidentes: solo recorre
   `vehicles` filtrando por zona (vía `zoneId` traducido a nombre, igual criterio que
   `vehicleEligibility.ts` de `docs/feature/maps-asign-vehicle.md`) y `status === 'ACTIVE'`.
3. **Persistencia — store propio.** `useAssignmentStore` (zustand, en `features/map/assignment/`)
   guarda `assignments: Assignment[]` y `zoneAvailability: Record<SupportedZone, boolean>`, con una
   acción `recompute(vehicles, assets, incidents, zonesById)` que llama a `assignVehicles` y a
   `zoneHasAvailableVehicle` por cada una de las 5 zonas. `useSyncAssignmentStore` (hook, mismo
   patrón que `useSyncMapStore`) dispara `recompute` cada vez que cambian `vehicles` (desde
   `useVehiclesStore`), `assets`/`incidents` (desde `useMapStore`) o `zonesById` (desde
   `useZonesQuery`) — igual que el resto de los stores derivados de la app, sin persistencia más
   allá de la sesión (el mock no tiene endpoint).
4. **Ubicación — `features/map/assignment/`.** Hoy `map` es el único consumidor real; si en el
   futuro otra feature necesita el motor, se promueve a `shared/assignment/` en ese momento (mismo
   criterio que el resto del proyecto: `shared/` solo cuando 2+ features lo usan).

### Estructura de archivos

```text
client/src/features/map/assignment/
  vehicleCompatibility.ts               # VEHICLE_ASSET_COMPATIBILITY, ASSET_MIN_CAPACITY
  incidentTypePriority.ts               # INCIDENT_TYPE_PRIORITY: Record<IncidentType, number>
  assignVehicles.ts                     # assignVehicles(vehicles, assets, incidents, zonesById) -> Assignment[]
  zoneHasAvailableVehicle.ts            # zoneHasAvailableVehicle(zone, vehicles, zonesById) -> boolean
  useAssignmentStore.ts                 # store zustand: assignments, zoneAvailability, recompute()
  useSyncAssignmentStore.ts             # hook: dispara recompute() ante cambios de vehicles/assets/incidents/zonas
  vehicleCompatibility.test.ts
  incidentTypePriority.test.ts
  assignVehicles.test.ts
  zoneHasAvailableVehicle.test.ts
  useAssignmentStore.test.ts
  useSyncAssignmentStore.test.tsx
```

```ts
export interface Assignment {
  incidentId: string
  assetId: string
  vehicleId: string
}

export function assignVehicles(
  vehicles: Vehicle[],
  assets: GeoTaggedAsset[],
  incidents: AssociatedIncident[],
  zonesById: Map<string, string>
): Assignment[]
// 1. Excluye vehículos MAINTENANCE/OUT_OF_SERVICE y activos OUT_OF_SERVICE (con sus incidentes).
// 2. Ordena incidentes por INCIDENT_TYPE_PRIORITY (OVERFLOW > DAMAGE > LITTERING > OTHER).
// 3. Para cada incidente:
//    - si tiene activo asociado (associatedAssetId) y ese activo no es OUT_OF_SERVICE: los
//      candidatos se filtran por VEHICLE_ASSET_COMPATIBILITY + ASSET_MIN_CAPACITY contra el tipo
//      del activo, y la zona objetivo es la derivedZone del activo.
//    - si tiene activo asociado pero está OUT_OF_SERVICE: se descarta (CA-02), no genera asignación.
//    - si no tiene activo asociado (incidente independiente): cualquier vehículo del pool es
//      candidato (sin restricción de tipo/capacidad), y la zona objetivo es la derivedZone del
//      incidente — mismo criterio que `eligibleVehiclesForIncident` en la asignación manual.
//    Ordena candidatos por (ACTIVE primero, misma zona, menor capacidad) y asigna el primero;
//    lo remueve del pool de vehículos disponibles para el resto de la pasada.

export function zoneHasAvailableVehicle(
  zone: SupportedZone,
  vehicles: Vehicle[],
  zonesById: Map<string, string>
): boolean
// true si existe al menos un vehículo ACTIVE cuya zona (zoneId -> nombre -> SupportedZone) es `zone`.
```

`AvailabilityAlert` **no se construye en este cambio** (queda para cuando se aborde
[docs/feature/10-maps-create.md](./10-maps-create.md) de forma explícita); este spec solo entrega
`zoneHasAvailableVehicle`/`useAssignmentStore` listos para que ese componente los consuma.

## Fuera de alcance

- Cualquier UI de asignación explícita (tabla "qué vehículo atiende qué incidente") — no fue pedida,
  el único consumidor es el booleano de disponibilidad por zona.
- Persistencia de asignaciones en backend (el mock no tiene endpoint para esto).

## Criterios de aceptación

- **CA-01:** Vehículos `MAINTENANCE`/`OUT_OF_SERVICE` nunca aparecen como candidatos de asignación.
- **CA-02:** Activos `OUT_OF_SERVICE` no generan asignaciones para sus incidentes asociados.
- **CA-03:** La compatibilidad vehículo→tipo de activo respeta exactamente la tabla dada.
- **CA-04:** Ante múltiples vehículos aptos, se prioriza `ACTIVE` > misma zona > menor capacidad
  suficiente, en ese orden.
- **CA-05:** Los incidentes se procesan en el orden `OVERFLOW > DAMAGE > LITTERING > OTHER` cuando
  compiten por los mismos vehículos.
- **CA-06:** `zoneHasAvailableVehicle` devuelve `false` para una zona sin ningún vehículo `ACTIVE`,
  sin importar si tiene incidentes pendientes o no (Decisión confirmada #2, opción (a)).
- **CA-07:** `useAssignmentStore.recompute` deja `assignments`/`zoneAvailability` actualizados ante
  cualquier cambio de `vehicles`, `assets` o `incidents` (vía `useSyncAssignmentStore`).

## Plan de tests

- `vehicleCompatibility.test.ts`: las 3 combinaciones exactas de la tabla + los 3 umbrales de
  `ASSET_MIN_CAPACITY`.
- `incidentTypePriority.test.ts`: orden `OVERFLOW > DAMAGE > LITTERING > OTHER`.
- `assignVehicles.test.ts`: exclusión de vehículos/activos fuera de servicio, prioridad de selección
  (los 3 criterios en combinación y por separado), contención entre incidentes de distinta prioridad
  compitiendo por el mismo vehículo, incidente sin activo asociado (sin restricción de tipo).
- `zoneHasAvailableVehicle.test.ts`: zona con vehículo `ACTIVE` (`true`), zona sin ningún vehículo
  `ACTIVE` (`false`), zona con vehículos pero todos `MAINTENANCE`/`OUT_OF_SERVICE` (`false`).
- `useAssignmentStore.test.ts`: `recompute` puebla `assignments` y `zoneAvailability` para las 5
  zonas.
- `useSyncAssignmentStore.test.tsx`: dispara `recompute` cuando cambian los stores de origen.
- Cobertura ≥ 80%.

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `format:check` sin errores.
2. `pnpm --filter client test` — cobertura ≥ 80%.
3. No aplica en este cambio: `AvailabilityAlert` no existe todavía en `MapPage` (queda fuera de
   alcance, ver arriba). La verificación de integración real queda para cuando ese componente se
   construya y consuma `useAssignmentStore`/`zoneHasAvailableVehicle`.
