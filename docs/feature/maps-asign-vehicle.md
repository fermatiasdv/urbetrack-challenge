# SPEC — Asignación manual de vehículo a activo/incidente (desde el mapa)

**Tipo:** feature
**Estado:** Aprobado por el usuario (2026-07-06). A implementar en esta sesión.
**Fecha:** 2026-07-06
**Relacionado:** [docs/feature/10-maps-create.md](./10-maps-create.md) (mapa, marcadores,
`MapStore`, `GeoTaggedAsset`/`AssociatedIncident`), [docs/feature/06-vehicles-modal.md](./06-vehicles-modal.md)
(`VehicleModal`), [docs/specs/architecture.md](../specs/architecture.md) ("Estado global",
"Regla para shared"), `shared/services/assets/`, `shared/services/incidents/`,
`features/vehicles/store/useVehiclesStore.ts`, `shared/geo/zones.ts`

> **No confundir con [docs/feature/11-vehicle-assignment-engine.md](./11-vehicle-assignment-engine.md).**
> Ese spec (propuesto, no implementado) describe un **motor automático** que decide, por prioridad,
> qué vehículo atiende cada incidente para alimentar `AvailabilityAlert`, con una matriz de
> compatibilidad **acumulativa** (`PICKUP⊂VAN⊂TRUCK`). Este documento describe una **asignación
> manual** disparada por el usuario desde el mapa, con una matriz **1 a 1** (`TRUCK→CONTAINER`,
> `VAN→BIN`, `PICKUP→BENCH`). Son features distintas y no dependen entre sí.

## Objetivo

Cuando el usuario hace click sobre el marcador de un activo o de un incidente en el mapa, poder
**asignarle un vehículo** desde un `Popup` de Leaflet, respetando reglas de compatibilidad, estado y
zona. La asignación es 1↔N (un activo/incidente tiene a lo sumo un vehículo; un vehículo puede tener
muchos activos/incidentes), vive solo en el cliente y se reconcilia automáticamente ante cambios de
estado. El vehículo ve sus activos/incidentes asignados en su modal de detalle.

## Reglas de negocio (decididas con el usuario, 2026-07-06)

### Disparador / UI

- Click en el marcador de un activo o incidente ⇒ `Popup` de Leaflet (interactivo, a diferencia del
  `Tooltip` de hover actual, que es no interactivo y se mantiene sin cambios).
- Dentro del `Popup`: un `Select` (Radix) que lista **solo** los vehículos elegibles para ese
  activo/incidente. Al elegir uno se asigna; una opción **"Sin asignar"** lo desasigna.
- Punto de entrada: **solo el mapa**. Las tablas de `/activos` e `/incidentes` quedan fuera de alcance.

### Cuándo se muestra el `Select` (gating por estado)

- Activo: solo si `status !== 'OUT_OF_SERVICE'` (es decir, `OK`, `FULL` o `DAMAGED`) — ampliado por
  [docs/specs/fix-asset-assignment-ok-full-damaged.md](../specs/fix-asset-assignment-ok-full-damaged.md).
- Incidente: solo si `status === 'REPORTED'`.
- En cualquier otro estado, el `Select` **no se renderiza** (el `Popup` puede seguir mostrando info).

### Vehículos elegibles (las 3 condiciones deben cumplirse)

1. `vehicle.status === 'ACTIVE'` (se excluyen `MAINTENANCE` y `OUT_OF_SERVICE`).
2. **Compatibilidad por tipo (matriz 1 a 1):**

   | Vehículo | Puede tomar activos de tipo |
   |---|---|
   | `TRUCK` | `CONTAINER` |
   | `VAN` | `BIN` |
   | `PICKUP` | `BENCH` |

   - Para un **incidente**, la compatibilidad se evalúa contra el **tipo de su activo asociado**
     (`associatedAssetId`, resuelto en `MapStore`) usando la misma matriz. Un incidente
     **independiente** (`associatedAssetId === null`) no tiene restricción de tipo: acepta cualquier
     vehículo `ACTIVE` de su zona.
3. **Misma zona:** la zona del vehículo (su `zoneId` traducido a nombre y normalizado a
   `SupportedZone`) debe coincidir con la `derivedZone` del activo/incidente (derivada por
   coordenadas, MAP-00 — nunca por el `zoneId` crudo del activo/incidente, §10.5 de verified-scope).

- **Sin límite de capacidad:** un vehículo admite N asignaciones; `capacity` no interviene.

### Cardinalidad

- 1 activo/incidente → a lo sumo 1 vehículo.
- 1 vehículo → N activos/incidentes.

### Desasignación automática (reconciliación)

Un par (activo/incidente ↔ vehículo) deja de ser válido — y se elimina automáticamente — cuando:

- el vehículo deja de estar `ACTIVE` (pasa a `MAINTENANCE`/`OUT_OF_SERVICE`), **o**
- el activo pasa a `OUT_OF_SERVICE` (se mantiene si es `OK`, `FULL` o `DAMAGED`), o el incidente
  deja de estar `REPORTED`, **o**
- el vehículo, el activo o el incidente dejan de existir (borrado).

Es una eliminación real y persistente del estado (no una ocultación en lectura): si el vehículo
vuelve a `ACTIVE` más tarde, la asignación **no** reaparece.

### Modal de detalle del vehículo

En `VehicleModal` (vista `details`), una sección lista los activos e incidentes actualmente
asignados a ese vehículo (o un vacío "Sin activos/incidentes asignados").

## Diagnóstico (estado actual del repo)

- **No existe ningún concepto de asignación manual hoy.** `grep` de "assign"/"asignaci" solo trae
  texto de specs. `features/map` no tiene interacción de click sobre marcadores.
- **Marcadores del mapa usan `Tooltip` (hover, no interactivo)**: `AssetMarkersLayer.tsx` /
  `IncidentMarkersLayer.tsx`. Para hospedar un `Select` clickeable hace falta un `Popup` de Leaflet
  (interactivo). Se **agrega** un `Popup`, sin quitar el `Tooltip` existente.
- **`MapStore`** ya expone `assets: GeoTaggedAsset[]` e `incidents: AssociatedIncident[]` con
  `derivedZone` y `associatedAssetId` — todo lo necesario para evaluar compatibilidad y zona sin
  recalcular nada.
- **Vehículos** viven en `features/vehicles/store/useVehiclesStore.ts` (no promovido a `shared/`).
  `MapEntityTabs` ya monta `useVehiclesQuery()`, así que en `/` (Mapa) el store de vehículos está
  hidratado. Los `Popup` leen `useVehiclesStore` directamente (excepción de dependencia ya
  precedente: `MapEntityTabs` importa de `features/vehicles`).
- **Zonas**: `useZonesQuery` (`shared/services/`) da `{ id, name }`; los nombres del backend
  (`Microcentro`, `Palermo`, …) normalizados (mayúsculas, sin acentos) coinciden 1:1 con
  `SupportedZone`.
- **`AppLayout`** es el único componente montado en todas las rutas — lugar natural para el hook de
  reconciliación, que debe correr aunque el usuario esté en `/vehiculos` (no solo en el mapa).

## Decisiones de diseño

### 1. Estado de asignaciones — nuevo store compartido

`shared/services/assignments/useAssignmentsStore.ts` (consumido por `map` y `vehicles` ⇒ `shared`,
regla de `architecture.md`). Ids de activo e incidente pueden colisionar (ambos son `'1'`, `'2'`…),
por eso se usan **dos mapas separados**:

```ts
interface AssignmentsState {
  assetToVehicle: Record<string, string>     // assetId    -> vehicleId
  incidentToVehicle: Record<string, string>  // incidentId -> vehicleId
  assignAssetVehicle: (assetId: string, vehicleId: string) => void
  clearAssetVehicle: (assetId: string) => void
  assignIncidentVehicle: (incidentId: string, vehicleId: string) => void
  clearIncidentVehicle: (incidentId: string) => void
  setAll: (next: Pick<AssignmentsState, 'assetToVehicle' | 'incidentToVehicle'>) => void
}
```

Solo cliente (Zustand en memoria), se pierde al recargar. Sin cambios en el mock API.

### 2. Reconciliación — función pura + hook

```ts
// shared/services/assignments/reconcileAssignments.ts
export function reconcileAssignments(input: {
  assetToVehicle: Record<string, string>
  incidentToVehicle: Record<string, string>
  assets: Asset[]
  incidents: Incident[]
  vehicles: Vehicle[]
}): { assetToVehicle: Record<string, string>; incidentToVehicle: Record<string, string>; changed: boolean }
```

Conserva un par sólo si el activo existe y está `OK` (o el incidente existe y está `REPORTED`) **y**
el vehículo existe y está `ACTIVE`. `changed` evita `set` (y re-render) cuando no hubo poda.

`shared/services/assignments/useReconcileAssignments.ts`: hook suscripto a `useAssetsStore` /
`useIncidentsStore` / `useVehiclesStore` / `useAssignmentsStore`; corre `reconcileAssignments` en un
`useEffect` y llama `setAll` solo si `changed`. Se monta **una vez en `AppLayout`** (siempre montado),
de modo que la poda ocurra ante cambios de estado hechos desde cualquier pantalla.

### 3. Normalización de zona — `shared/geo/`

```ts
// shared/geo/supportedZoneFromName.ts
export function supportedZoneFromName(name: string): SupportedZone | null
```

Mayúsculas + sin acentos; devuelve la `SupportedZone` correspondiente o `null` si no matchea ninguna.

### 4. Elegibilidad — `features/map/utils/vehicleEligibility.ts`

```ts
export const VEHICLE_ASSET_COMPAT: Record<VehicleType, AssetType> // TRUCK->CONTAINER, VAN->BIN, PICKUP->BENCH
export function vehicleCanCarry(vehicleType: VehicleType, assetType: AssetType): boolean

export function eligibleVehiclesForAsset(
  asset: GeoTaggedAsset, vehicles: Vehicle[], zonesById: Map<string, string>
): Vehicle[]

export function eligibleVehiclesForIncident(
  incident: AssociatedIncident, associatedAsset: GeoTaggedAsset | null,
  vehicles: Vehicle[], zonesById: Map<string, string>
): Vehicle[]
```

Filtra por `ACTIVE` + zona (`supportedZoneFromName(zoneNameFor(v.zoneId, zonesById)) === entity.derivedZone`)
+ compatibilidad (activo: por `asset.type`; incidente: por `associatedAsset.type`, o sin filtro de
tipo si es `null`).

### 5. UI — `AssignmentControl` + `Popup`

- `features/map/components/AssignmentControl.tsx`: recibe la lista de vehículos elegibles, el
  vehículo asignado actual y callbacks `onAssign`/`onClear`. Renderiza el `Select` (con opción
  "Sin asignar"). Si no hay elegibles, muestra "No hay vehículos disponibles".
- `AssetMarkersLayer` / `IncidentMarkersLayer`: agregan un `<Popup>` dentro de cada `<Marker>`. El
  `Popup` monta `AssignmentControl` **solo** cuando el gating por estado se cumple
  (`asset.status === 'OK'` / `incident.status === 'REPORTED'`); si no, no muestra el control.
  Los vehículos se leen de `useVehiclesStore`, las zonas de `useZonesQuery`, la asignación de
  `useAssignmentsStore`.

### 6. `VehicleModal` — sección de asignados

En la vista `details`, debajo de `readOnlyDetails`, se lista lo asignado a ese vehículo leyendo
`useAssignmentsStore` + resolviendo etiquetas desde `useAssetsStore`/`useIncidentsStore`.

## Estructura de archivos

```text
docs/feature/maps-asign-vehicle.md                         # este spec

client/src/shared/geo/
  supportedZoneFromName.ts (+ .test.ts)

client/src/shared/services/assignments/
  useAssignmentsStore.ts (+ .test.ts)
  reconcileAssignments.ts (+ .test.ts)
  useReconcileAssignments.ts (+ .test.tsx)

client/src/features/map/utils/
  vehicleEligibility.ts (+ .test.ts)

client/src/features/map/components/
  AssignmentControl.tsx (+ .test.tsx)
  AssetMarkersLayer.tsx        # + Popup con AssignmentControl (gating status OK)
  IncidentMarkersLayer.tsx     # + Popup con AssignmentControl (gating status REPORTED)

client/src/app/layout/
  AppLayout.tsx                # monta useReconcileAssignments()

client/src/features/vehicles/components/
  VehicleModal.tsx             # + sección "asignados"
```

## Fuera de alcance

- Asignar desde las tablas de `/activos`/`/incidentes` (solo desde el mapa).
- Límite por `capacity` (asignaciones ilimitadas por vehículo).
- Persistencia entre sesiones (`localStorage`) o en el mock API (solo estado en memoria).
- El motor automático de disponibilidad (`AvailabilityAlert`, spec 11) — independiente.

## Criterios de aceptación

- **CA-01:** Click en un marcador de activo `OK`, `FULL` o `DAMAGED` abre un `Popup` con un `Select`
  de vehículos.
- **CA-02:** Click en un marcador de incidente `REPORTED` abre un `Popup` con un `Select`.
- **CA-03:** Activo `OUT_OF_SERVICE` (o incidente ≠ `REPORTED`) no muestra el `Select`.
- **CA-04:** El `Select` lista únicamente vehículos `ACTIVE`, de la misma zona y compatibles por
  tipo (`TRUCK→CONTAINER`, `VAN→BIN`, `PICKUP→BENCH`; incidente por su activo asociado, o sin
  restricción de tipo si es independiente).
- **CA-05:** Asignar un vehículo lo guarda; "Sin asignar" lo quita. Un activo/incidente tiene a lo
  sumo un vehículo.
- **CA-06:** Un vehículo admite varios activos/incidentes; se listan en `VehicleModal` (details).
- **CA-07:** Si el vehículo asignado deja de estar `ACTIVE`, la asignación se elimina sola.
- **CA-08:** Si el activo pasa a `OUT_OF_SERVICE` (o el incidente deja de estar `REPORTED`), su
  asignación se elimina sola; si pasa a `FULL` o `DAMAGED`, se conserva.
- **CA-09:** Borrar un vehículo/activo/incidente elimina sus asignaciones asociadas.

## Plan de tests

- `supportedZoneFromName.test.ts`: nombres válidos (con/sin acentos, mayúsc/minúsc) y `null`.
- `vehicleEligibility.test.ts`: matriz 1 a 1, exclusión por estado ≠ `ACTIVE`, exclusión por zona,
  incidente por activo asociado, incidente independiente sin filtro de tipo.
- `reconcileAssignments.test.ts`: poda por vehículo no `ACTIVE`, por activo ≠ `OK`, por incidente ≠
  `REPORTED`, por entidad inexistente; `changed=false` cuando todo sigue válido.
- `useAssignmentsStore.test.ts`: assign/clear de activos e incidentes, `setAll`.
- `useReconcileAssignments.test.tsx`: montado el hook, ante un vehículo que pasa a no-`ACTIVE`
  (o un activo/incidente fuera de su estado asignable) la asignación inválida se poda vía `setAll`;
  y cuando todo sigue válido no se toca el estado (`changed=false`, sin `setAll`).
- `AssignmentControl.test.tsx`: sin elegibles muestra el mensaje; con elegibles muestra el
  vehículo asignado; dispara `onAssign`/`onClear`.
- Cobertura ≥ 80% en las 4 métricas.

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `test` sin errores (o `npm`/binarios locales
   equivalentes según el entorno).
2. Revisión manual en `/` (Mapa): click en activo `OK` y en incidente `REPORTED`, asignación y
   desasignación, y que al mandar el vehículo a mantenimiento desde `/vehiculos` la asignación
   desaparece.
