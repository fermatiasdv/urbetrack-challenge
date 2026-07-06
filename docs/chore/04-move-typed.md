# SPEC — Migrar tipado de features a `shared/types` (fuente única de verdad)

**Tipo:** chore
**Estado:** Aprobado — implementado (ver §"Estado de implementación")
**Fecha:** 2026-07-06
**Relacionado:** [architecture.md](../specs/architecture.md), [component-test-vehicles-table.md](../specs/component-test-vehicles-table.md), [feature/02-vehicle-statuscard.md](../feature/02-vehicle-statuscard.md), [feature/03-vehicles-table.md](../feature/03-vehicles-table.md), [feature/04-vehicles-filtertable.md](../feature/04-vehicles-filtertable.md)

## Objetivo

Mover el tipado de dominio que hoy vive disperso en `types/` de cada feature hacia
`client/src/shared/types`, consolidado en **un único archivo**. Ese archivo exporta todos los tipos
y pasa a ser la **fuente única de verdad** del tipado de dominio del cliente: cualquier feature que
necesite `Vehicle`, `VehicleStatus`, `VehicleType`, `Zone`, etc. los importa desde ahí en lugar de
declararlos (o re-declararlos) localmente.

## Diagnóstico

- `client/src/shared/types/` existe pero está vacío (solo `.gitkeep`).
- El único tipado de dominio existente hoy vive en la feature `vehicles`:
  - `client/src/features/vehicles/types/vehicle.types.ts` → `VehicleType`, `VehicleStatus`, `Vehicle`.
  - `client/src/features/vehicles/types/zone.types.ts` → `Zone`.
- Ninguna otra feature (`assets`, `incidents`, `map`, `dashboard`) tiene tipado propio todavía: son
  pantallas placeholder (ver [chore 03](./03-navigation-shell-router.md)), por lo que este chore solo
  mueve lo que hoy existe; no crea tipado especulativo para features que aún no lo tienen.
- Consumidores actuales de `features/vehicles/types/*` (a actualizar): `api/useVehiclesQuery.ts`,
  `api/useZonesQuery.ts` y sus tests, `components/DeleteVehicleAlertDialog.tsx`,
  `components/VehicleRowActionsMenu.tsx`, `components/VehiclesTable.tsx`,
  `components/vehicleStatusBadge.styles.ts`, `constants/vehicleFilterOptions.ts`,
  `hooks/useFilteredVehicles.ts`, `hooks/useVehicleStatusCards.ts`, `store/useVehiclesStore.ts`,
  `utils/vehicleFilters.ts`, `utils/vehicleFormat.ts`, y los `.test.ts(x)` correspondientes.
- El proyecto no tiene path aliases configurados (`tsconfig.json` sin `paths`, `moduleResolution:
  Bundler`): todas las importaciones son relativas. Los imports que hoy usan `../types/vehicle.types`
  pasan a apuntar a `shared/types` con la ruta relativa que corresponda a cada archivo (p. ej.
  `../../../shared/types/domain.types` desde `features/vehicles/api/`).

## Alcance de este chore

1. Crear `client/src/shared/types/domain.types.ts` con todo el tipado de dominio hoy existente:
   `VehicleType`, `VehicleStatus`, `Vehicle`, `Zone`. Cada tipo conserva su JSDoc de origen (mirror
   del backend mock, referencia a `api/src/types/index.ts` y a los specs que lo introdujeron).
2. Eliminar `client/src/features/vehicles/types/vehicle.types.ts` y
   `client/src/features/vehicles/types/zone.types.ts` (y la carpeta `types/` de la feature, que queda
   vacía).
3. Actualizar todos los imports listados en "Diagnóstico" para que apunten a
   `shared/types/domain.types` en lugar de `../types/vehicle.types` / `../types/zone.types`.
4. Eliminar `client/src/shared/types/.gitkeep` (la carpeta deja de estar vacía).
5. Futuras features (`assets`, `incidents`, `map`) que necesiten tipado de dominio lo agregan a este
   mismo archivo en lugar de crear un `types/` propio, salvo que un spec futuro justifique
   explícitamente lo contrario.

### Estructura resultante

```text
client/src/shared/types/
  domain.types.ts   # VehicleType, VehicleStatus, Vehicle, Zone — fuente única de verdad
```

```text
client/src/features/vehicles/
  api/
  components/
  constants/
  hooks/
  pages/
  store/
  utils/
  # types/ eliminado — el tipado vive en shared/types/domain.types.ts
```

### Contenido de `domain.types.ts` (referencial)

```ts
/**
 * Vehicle domain types (client-side), mirrored from the mock backend
 * (`api/src/types/index.ts`, `api/src/schemas/vehicle.schema.ts`).
 * See docs/feature/02-vehicle-statuscard.md.
 */
export type VehicleType = 'TRUCK' | 'VAN' | 'PICKUP'

export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'

export interface Vehicle {
  id: string
  plate: string
  type: VehicleType
  status: VehicleStatus
  capacity: number
  zoneId: string
}

/**
 * Zone domain type (client-side), mirrored from the mock backend
 * (`api/src/data/zones.ts`). See docs/verified-scope.md §2.1.
 */
export interface Zone {
  id: string
  name: string
}
```

## Specs que se modifican a partir de este chore

1. **`docs/specs/architecture.md`** — en "Estructura interna de una feature" se aclara que `types/`
   ya **no** es un directorio típico de feature: el tipado de dominio vive en
   `shared/types/domain.types.ts` como fuente única de verdad. Se agrega una nota en la sección
   `shared/` indicando esto explícitamente.
2. **`docs/feature/02-vehicle-statuscard.md`** — la referencia a
   `types/vehicle.types.ts` (línea de estructura de carpetas) se actualiza para apuntar a
   `shared/types/domain.types.ts`.
3. **`docs/feature/03-vehicles-table.md`** — las referencias a
   `client/src/features/vehicles/types/vehicle.types.ts` y `types/zone.types.ts` se actualizan a
   `client/src/shared/types/domain.types.ts`.
4. **`docs/feature/04-vehicles-filtertable.md`** — la referencia a
   `client/src/features/vehicles/types/vehicle.types.ts` se actualiza a
   `client/src/shared/types/domain.types.ts`.

Estos specs de feature no se reabren funcionalmente: solo se corrige la ruta del tipado para que no
queden desactualizados respecto del código una vez implementado este chore.

## Fuera de alcance

- Tipar `component-test/types.ts` (proof-of-concept aparte, ya marcado como no reutilizable en
  `feature/03-vehicles-table.md`).
- Crear tipado nuevo para `assets`, `incidents`, `map` o `dashboard`: no existe hoy, se agrega recién
  cuando exista un spec de feature que lo requiera.
- Cambiar el runtime/comportamiento de cualquier componente, hook o store: este chore es puramente de
  reorganización de tipos (renombrar rutas de import), sin tocar lógica.
- Introducir path aliases (`@/shared/types`, etc.): se mantiene el estilo de imports relativos ya
  usado en todo el proyecto.

## Verificación post-implementación

1. `pnpm --filter client typecheck` compila sin errores con todos los imports apuntando a
   `shared/types/domain.types`.
2. `pnpm --filter client lint` / `format:check` pasan.
3. `pnpm --filter client test` (suite completa de `vehicles`) sigue en verde: la migración de tipos no
   cambia comportamiento.
4. `grep -r "types/vehicle.types\|types/zone.types" client/src` no devuelve resultados (todas las
   referencias migraron a `shared/types/domain.types`).
5. `client/src/features/vehicles/types/` ya no existe; `client/src/shared/types/.gitkeep` fue
   removido.
6. Coherencia documental: `architecture.md` y los specs de feature `02`, `03`, `04` referencian
   `shared/types/domain.types.ts` y no contradicen la ubicación real del código.

## Estado de implementación

Implementado (2026-07-06):

- `client/src/shared/types/domain.types.ts` creado con `VehicleType`, `VehicleStatus`, `Vehicle`,
  `Zone`; `.gitkeep` removido.
- `client/src/features/vehicles/types/` (`vehicle.types.ts`, `zone.types.ts`) eliminado.
- Los 24 archivos que importaban de `../types/vehicle.types` o `../types/zone.types` (ver
  "Diagnóstico") actualizados a `../../../shared/types/domain.types`.
- `architecture.md` y los specs de feature `02`, `03`, `04` actualizados según lo listado arriba.
- **Pendiente de verificar por el usuario:** `pnpm --filter client typecheck`, `lint`,
  `format:check` y `test`. El entorno de este chore no pudo ejecutar `pnpm` de forma confiable
  (node_modules con symlinks rotos al montar el repo desde Windows, y el registro npm no respondió
  dentro del tiempo disponible para una instalación limpia). La migración es mecánica (solo cambia
  la ruta de import, no la firma de los tipos ni ningún valor), pero se recomienda correr la
  verificación en un entorno local antes de dar el chore por cerrado del todo.

## Incidente detectado en la verificación del usuario (2026-07-06) — corregido

Al correr `pnpm typecheck` / `pnpm lint` en un entorno local, aparecieron 2 errores de parseo:

- `src/features/vehicles/components/VehicleStatusCards.test.tsx:53:1` — `TS1127: Invalid character`.
- `src/features/vehicles/hooks/useVehicleStatusCards.test.ts:74:32` — `TS1005: ')' expected` (el
  archivo terminaba cortado en `expect(sum).toBe(byKey.tota`).

**Causa raíz:** el editor de este chore corrió `sed -i` sobre esos dos archivos (para reescribir el
import a `shared/types/domain.types`) a través del sandbox de shell del agente. Ese sandbox montaba el
repo desde el filesystem de Windows, y para estos dos archivos específicamente sirvió una lectura
**incompleta/truncada** del contenido real (el mismo síntoma se detectó por separado en
`pnpm-lock.yaml` al intentar correr `pnpm install` dentro del sandbox). `sed -i` reescribió el archivo
completo con esa versión truncada, perdiendo contenido real en disco:
  - `VehicleStatusCards.test.tsx` quedó con un byte nulo colgante después del `})` final.
  - `useVehicleStatusCards.test.ts` perdió el cierre del último test (`expect(sum).toBe(byKey.total?.value)`,
    y los `})` de cierre del `it` y del `describe`).

**Corrección aplicada:** se recuperó el contenido original de ambos archivos desde
`origin/main` (`git show origin/main:<path>`, que no depende del índice de git ni del sandbox de
shell) y se reaplicó **solo** el cambio de import (`../types/vehicle.types` /
`../types/zone.types` → `../../../shared/types/domain.types`) escribiendo el archivo completo de una
sola vez con la herramienta de edición de archivos (no `sed` vía shell), evitando pasar por la lectura
truncada del sandbox.

**Lección para futuros chores:** no usar `sed -i` (ni ningún comando de shell que lea-y-reescriba un
archivo completo) sobre archivos de este repo cuando se opera a través del sandbox de shell del
agente; usar la herramienta de edición de archivos directa (que no pasa por el mismo mount) para
cualquier escritura, y reservar el shell solo para lectura/búsqueda (`grep`, `find`) o para comandos
que no reescriban archivos existentes.
