# SPEC — Motor de asignación vehículo↔activo/incidente (§5)

**Tipo:** feature
**Estado:** Propuesto — pendiente de aprobación del usuario. Bloqueante únicamente para
`AvailabilityAlert` en [docs/feature/10-maps-create.md](./10-maps-create.md) (decisión #1 de ese
spec, 2026-07-06); el resto de la feature `map` no depende de este documento.
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

## Gaps a resolver antes de implementar (pendiente de decisión del usuario)

1. **Definición cuantitativa de "capacidad suficiente".** Sin un campo de magnitud en `Incident`,
   se propone una regla fija por `AssetType` (ej. `BENCH` requiere cualquier capacidad, `BIN`
   requiere ≥ 1000kg, `CONTAINER` requiere ≥ 2000kg — alineado a que `PICKUP` (hasta 1000kg) solo
   opera `BENCH`, `VAN` (hasta 2000kg) opera `BENCH`/`BIN`, `TRUCK` (hasta 5000kg) opera los 3, según
   la tabla de compatibilidad ya dada). A confirmar si esta equivalencia implícita capacidad↔tipo es
   correcta o si se define un valor explícito distinto.
2. **Alcance de "vehículos disponibles para una zona" que consume `AvailabilityAlert`.** Dos
   interpretaciones posibles: (a) la zona no tiene *ningún* vehículo `ACTIVE` en absoluto
   (independiente de si hay incidentes pendientes), o (b) la zona tiene incidentes/activos que
   *necesitan* atención pero ningún vehículo apto quedó libre tras la asignación (criterio real de
   "contención" del texto). Se propone (b), más fiel al párrafo original, pero requiere correr el
   algoritmo de asignación completo para saber si "sobra" algún incidente sin vehículo — a confirmar.
3. **Persistencia del resultado.** ¿La asignación se recalcula en cada cambio de estado
   (activo/incidente/vehículo) y vive en un store propio (`useAssignmentStore`), o se calcula
   on-demand solo para alimentar `AvailabilityAlert` sin exponerse en ninguna tabla/UI adicional? Se
   propone lo segundo (cálculo derivado, sin store propio) por estar fuera de alcance cualquier
   pantalla de "asignaciones" explícita — a confirmar.
4. **Ubicación del código.** Al depender de `assets`, `incidents` **y** `vehicles`, y no pertenecer
   exclusivamente a ninguna, se propone `shared/assignment/` (excepción a "shared solo si 2+
   features lo usan", mismo criterio ya aplicado a `shared/geo/` en MAP-00, ya que el único
   consumidor por ahora es `map`, pero la lógica en sí mezcla 3 dominios y no pertenece a ninguno de
   ellos individualmente) — a confirmar si se prefiere ubicarlo directamente en `features/map/`
   dado que hoy es su único consumidor real.

## Decisiones propuestas (a confirmar junto con los gaps)

### Estructura de archivos propuesta

```text
client/src/shared/assignment/          # o features/map/assignment/, ver Gap #4
  vehicleCompatibility.ts               # VEHICLE_ASSET_COMPATIBILITY: Record<VehicleType, AssetType[]>
  incidentTypePriority.ts               # INCIDENT_TYPE_PRIORITY: Record<IncidentType, number>
  assignVehicles.ts                     # assignVehicles(vehicles, assets, incidents) -> Assignment[]
  zoneHasAvailableVehicle.ts            # zoneHasAvailableVehicle(zone, ...) -> boolean, consumido por AvailabilityAlert
  vehicleCompatibility.test.ts
  incidentTypePriority.test.ts
  assignVehicles.test.ts
  zoneHasAvailableVehicle.test.ts
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
  incidents: AssociatedIncident[]
): Assignment[]
// 1. Excluye vehículos MAINTENANCE/OUT_OF_SERVICE y activos OUT_OF_SERVICE (con sus incidentes).
// 2. Ordena incidentes por INCIDENT_TYPE_PRIORITY (OVERFLOW > DAMAGE > LITTERING > OTHER).
// 3. Para cada incidente, resuelve el activo asociado (o el propio incidente si no aplica) y busca
//    vehículos compatibles por VEHICLE_ASSET_COMPATIBILITY, filtra por capacidad suficiente,
//    ordena candidatos por (ACTIVE primero, misma zona, menor capacidad suficiente) y asigna el
//    primero libre; lo remueve del pool de vehículos disponibles para el resto de la pasada.

export function zoneHasAvailableVehicle(
  zone: SupportedZone,
  vehicles: Vehicle[],
  assignments: Assignment[],
  pendingIncidents: AssociatedIncident[]
): boolean
```

`AvailabilityAlert` (en `features/map/components/`, ver
[docs/feature/10-maps-create.md](./10-maps-create.md)) consume `zoneHasAvailableVehicle` por cada
una de las 5 zonas y renderiza una alerta por cada una que devuelva `false`.

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
- **CA-06:** `zoneHasAvailableVehicle` devuelve `false` para una zona sin ningún vehículo `ACTIVE`
  apto para sus incidentes pendientes (criterio exacto sujeto al Gap #2).

## Plan de tests

- `vehicleCompatibility.test.ts`: las 3 combinaciones exactas de la tabla.
- `incidentTypePriority.test.ts`: orden `OVERFLOW > DAMAGE > LITTERING > OTHER`.
- `assignVehicles.test.ts`: exclusión de vehículos/activos fuera de servicio, prioridad de selección
  (los 3 criterios en combinación y por separado), contención entre incidentes de distinta prioridad
  compitiendo por el mismo vehículo.
- `zoneHasAvailableVehicle.test.ts`: zona con vehículo apto disponible (`true`), zona sin ningún
  vehículo `ACTIVE` (`false`), zona con vehículos pero todos ya asignados a incidentes de mayor
  prioridad (`false`).
- Cobertura ≥ 80%.

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `format:check` sin errores.
2. `pnpm --filter client test` — cobertura ≥ 80%.
3. Integración con `AvailabilityAlert` de [docs/feature/10-maps-create.md](./10-maps-create.md)
   verificada manualmente contra al menos un caso real del dataset mock (una zona con capacidad
   insuficiente forzada, si el dataset generado aleatoriamente no produce el caso por sí solo).
