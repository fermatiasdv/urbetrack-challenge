# SPEC — Barra de filtros de vehículos (Vehicles Filter Table)

**Tipo:** feature
**Estado:** Aprobado — decisiones de los gaps 1/2/3 confirmadas por el usuario (2026-07-06): rangos
de capacidad "hasta o igual a" (inclusivos en el límite superior, alineados a la capacidad máxima
de cada tipo de vehículo: Pickup 1000, Van 2000, Truck 5000), se agrega filtro de **Zona** (ausente
en el mockup original), búsqueda por placa por **substring** (abarca también prefijo). En
implementación.
**Fecha:** 2026-07-06
**Relacionado:** [docs/designs/04-vehicles-filtertable.md](../designs/04-vehicles-filtertable.md),
[docs/feature/03-vehicles-table.md](./03-vehicles-table.md),
[docs/feature/02-vehicle-statuscard.md](./02-vehicle-statuscard.md),
[docs/specs/architecture.md](../specs/architecture.md),
[docs/verified-scope.md](../verified-scope.md) §2.2, §6.1, §6.2, [docs/METHODS.md](../METHODS.md),
`@radix-ui/themes` `Select` (https://www.radix-ui.com/themes/docs/components/select), `TextField`
y `Popover`+`CheckboxGroup` para el multi-select de Zona (todos ya instalados, ver
`03-vehicles-table.md` §"Diagnóstico")

## Objetivo

Agregar, en `client/src/features/vehicles/pages/VehiclesPage.tsx` (encima de `VehiclesTable`, ver
[feature 03](./03-vehicles-table.md)), la barra de filtros de
[docs/designs/04-vehicles-filtertable.md](../designs/04-vehicles-filtertable.md): búsqueda por
placa, y filtros por tipo, capacidad y estado, más un botón "Restablecer". Los filtros se aplican
**localmente** sobre los vehículos ya cargados en `useVehiclesStore` (`docs/verified-scope.md`
§6.1: "la totalidad de los registros se obtiene una única vez [...]. Filtros [...] se aplican
localmente, sin nuevas consultas al backend"), combinados con AND entre sí.

## Diagnóstico

- `GET /vehicles` (`docs/METHODS.md`) solo admite `status`, `type` y `zoneId` como query params de
  filtrado server-side; no tiene un query param de capacidad por rango ni de búsqueda de texto por
  placa, y por diseño (§6.1) este spec no debe agregar llamadas nuevas al backend para filtrar. Los
  4 filtros del mockup (placa, tipo, capacidad, estado) se resuelven **completamente en el cliente**,
  sobre el array ya hidratado en `useVehiclesStore.vehicles`.
- No existe un endpoint que devuelva "los tipos/estados/capacidades disponibles para filtrar": las
  opciones de los `<select>` del mockup (`Truck`/`Van`/`Pickup`, `Active`/`Maintenance`/`Out of
  Service`, los 3 rangos de capacidad) deben salir de **constantes en el cliente**, pero mapeando
  1:1 contra los valores reales del modelo `Vehicle` (`client/src/shared/types/domain.types.ts`, fuente
  única de verdad del tipado de dominio, ver [chore 04](../chore/04-move-typed.md)):
  `VehicleType = 'TRUCK' | 'VAN' | 'PICKUP'`, `VehicleStatus = 'ACTIVE' | 'MAINTENANCE' |
  'OUT_OF_SERVICE'` — no literales sueltos ni copiados del inglés del mockup. `capacity` es
  `number` sin unidades ni enum, por lo que los 3 rangos de capacidad (`<1000kg`, `1000-2000kg`,
  `>2000kg`) se modelan como una unión de literales propia (ver punto 2).
- Ya existen `vehicleTypeLabel`/`vehicleStatusLabel` en
  `client/src/features/vehicles/utils/vehicleFormat.ts` ([feature 03](./03-vehicles-table.md)) que
  traducen cada valor de enum a español ("Camión"/"Furgoneta"/"Camioneta",
  "Activo"/"En mantenimiento"/"Fuera de servicio"). Las constantes de opciones de filtro deben
  **reutilizar estas funciones** para el label, no duplicar los strings en un archivo nuevo.
- El mockup usa `<select>` HTML nativos; el proyecto usa `@radix-ui/themes` como única librería de
  UI (`docs/chore/02-visual-alignment.md`) y ya tiene experiencia traduciendo mockups Tailwind a
  componentes Radix ([feature 02](./02-vehicle-statuscard.md) punto 3, [feature 03](./03-vehicles-table.md)).
  Se usa `Select` de Radix (https://www.radix-ui.com/themes/docs/components/select,
  `Select.Root`/`Select.Trigger`/`Select.Content`/`Select.Item`) para Tipo/Capacidad/Estado, y
  `TextField.Root` + `TextField.Slot` (mismo paquete) para el input de búsqueda por placa con el
  ícono a la izquierda (mockup: `<span class="material-symbols-outlined">badge</span>` dentro de un
  `div.relative`).
- **Ícono de búsqueda:** el mockup usa Material Symbols (`badge`); el proyecto no instala esa
  librería y ya mapea íconos de mockup a `lucide-react` ([feature 02](./02-vehicle-statuscard.md)
  punto 4, sin agregar Material Symbols). Se propone `IdCard` de `lucide-react` (ya instalado) como
  equivalente visual de una credencial/placa.
- `useVehiclesStore` (creado en [feature 03](./03-vehicles-table.md)) no tiene estado de filtros;
  hace falta un store nuevo o un hook derivado, ver punto 3.
- `docs/verified-scope.md` §2.2 fija la capacidad máxima por tipo de vehículo (`TRUCK` hasta 5000
  kg, `VAN` hasta 2000 kg, `PICKUP` hasta 1000 kg) — confirmado por el usuario como la base de los 3
  rangos de capacidad del filtro (ver Decisión 3 y Gap 1 resuelto).
- El filtro de Zona, ausente en el mockup de diseño, se agrega por pedido explícito del usuario. La
  fuente de las zonas es `GET /zones` vía `useZonesQuery` (ya existe, creado en
  [feature 03](./03-vehicles-table.md) para resolver nombres de zona en la tabla) — se reutiliza el
  mismo hook, no se crea un segundo query. Como "una, varias o todas" (`docs/verified-scope.md`
  §6.2) es selección múltiple, y `@radix-ui/themes` `Select` es de valor único, el control de Zona
  no puede ser un `Select` como los otros 3 — ver Decisión 4.

## Decisiones propuestas

1. **Mapeo mockup → filtros**, traduciendo el copy a español (el mockup está en inglés genérico,
   igual que el resto de mockups del proyecto, ver `docs/designs/04-vehicles-filtertable.md`
   "Notas"). Se agrega un 5º control (Zona) no presente en el mockup, por pedido explícito del
   usuario:

   | Campo | Label en español | Tipo de control | Filtra sobre |
   |---|---|---|---|
   | "Search by plate" (mockup) | "Buscar por placa" | `TextField.Root` con ícono `IdCard` | `Vehicle.plate` (substring, case-insensitive) |
   | "Type" (mockup) | "Tipo" | `Select` (Todos + `VehicleType`) | `Vehicle.type` |
   | "Capacity" (mockup) | "Capacidad" | `Select` (Todos + 3 rangos) | `Vehicle.capacity` |
   | "Status" (mockup) | "Estado" | `Select` (Todos + `VehicleStatus`) | `Vehicle.status` |
   | — (no está en el mockup, agregado) | "Zona" | `Popover` + `CheckboxGroup` multi-select (ver Decisión 4) | `Vehicle.zoneId` |
   | "Reset" (mockup) | "Restablecer" | `Button` (`variant="soft"`, mismo rol visual que `bg-surface-container-high` del mockup) | limpia los 5 filtros a su valor por defecto |

2. **Rangos de capacidad — límites confirmados por el usuario (2026-07-06):** "hasta o igual a"
   (inclusivo en el límite superior), alineados a la capacidad máxima por tipo de vehículo de
   `docs/verified-scope.md` §2.2 (Pickup 1000 kg, Van 2000 kg, Truck 5000 kg):

   | `CapacityFilter` | Label | Predicado |
   |---|---|---|
   | `LTE_1000` | "Hasta 1.000 KG" | `capacity <= 1000` |
   | `BETWEEN_1000_2000` | "Entre 1.001 y 2.000 KG" | `capacity > 1000 && capacity <= 2000` |
   | `GT_2000` | "Más de 2.000 KG" | `capacity > 2000` |

   Sin huecos ni solapamientos: un vehículo con `capacity === 1000` (tope de un Pickup) cae en
   `LTE_1000`, uno con `capacity === 2000` (tope de una Van) cae en `BETWEEN_1000_2000`, y cualquier
   Truck (hasta 5000) con `capacity > 2000` cae en `GT_2000` (no hace falta un tope superior
   explícito en el predicado: no existen vehículos con `capacity > 5000` en el modelo).
3. **Constantes de opciones de filtro**, nuevas, en
   `client/src/features/vehicles/constants/vehicleFilterOptions.ts`, tipadas contra el modelo real
   (no contra los literales en inglés del mockup):

   ```ts
   export type VehicleTypeFilter = 'ALL' | VehicleType
   export type VehicleStatusFilter = 'ALL' | VehicleStatus
   export type CapacityFilter = 'ALL' | 'LTE_1000' | 'BETWEEN_1000_2000' | 'GT_2000'

   export const VEHICLE_TYPE_FILTER_OPTIONS: Array<{ value: VehicleTypeFilter; label: string }>
   export const VEHICLE_STATUS_FILTER_OPTIONS: Array<{ value: VehicleStatusFilter; label: string }>
   export const CAPACITY_FILTER_OPTIONS: Array<{ value: CapacityFilter; label: string }>
   ```

   `VEHICLE_TYPE_FILTER_OPTIONS`/`VEHICLE_STATUS_FILTER_OPTIONS` se arman iterando las claves de
   `VehicleType`/`VehicleStatus` y llamando a `vehicleTypeLabel`/`vehicleStatusLabel`
   (`utils/vehicleFormat.ts`) para el label — así, si el enum del backend cambia (nuevo tipo/estado),
   las opciones de filtro no quedan desincronizadas del resto de la UI. `CAPACITY_FILTER_OPTIONS` es
   una lista fija de 3 rangos (no hay enum de backend para esto, ver Decisión 2), con labels en
   español consistentes con `Intl.NumberFormat('es-AR')` (ya usado en `formatCapacity`). Las opciones
   de **Zona** no van en este archivo de constantes: salen de `useZonesQuery` (dinámicas, dependen
   del backend), no son un literal fijo — ver Decisión 4.
4. **Filtro de Zona — multi-select agregado fuera del mockup original**, por pedido explícito del
   usuario ("una, varias o todas", `docs/verified-scope.md` §6.2). Como `@radix-ui/themes` `Select`
   es de valor único, se implementa con `Popover.Root` (trigger tipo botón, mismo alto que los
   `Select` vecinos) + `Popover.Content` con `CheckboxGroup.Root` listando las zonas de
   `useZonesQuery` (mismo hook ya usado por `VehiclesTable`, sin duplicar el query). El trigger
   muestra "Todas las zonas" cuando no hay selección, el nombre de la zona cuando hay una sola, o
   "N zonas" cuando hay más de una. Sin selección (`zoneIds: []`) equivale a "todas".
5. **Predicados de filtrado puros**, nuevos, en
   `client/src/features/vehicles/utils/vehicleFilters.ts` (mismo patrón que `vehicleFormat.ts`:
   funciones puras, sin React/store, unit-testeables):

   ```ts
   export interface VehicleFilters {
     plate: string
     type: VehicleTypeFilter
     capacity: CapacityFilter
     status: VehicleStatusFilter
     zoneIds: string[]
   }

   export const DEFAULT_VEHICLE_FILTERS: VehicleFilters

   export function matchesCapacityFilter(capacity: number, filter: CapacityFilter): boolean
   export function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[]
   ```

   `filterVehicles` aplica los 5 criterios con AND: `plate` compara
   `vehicle.plate.toLowerCase().includes(filters.plate.trim().toLowerCase())` — **substring**,
   confirmado por el usuario, lo que abarca también el caso de prefijo (vacío = no filtra);
   `type`/`status` comparan igualdad exacta salvo `'ALL'`; `capacity` usa `matchesCapacityFilter`
   (Decisión 2); `zoneIds` matchea si el array está vacío (= todas) o si
   `filters.zoneIds.includes(vehicle.zoneId)`.
6. **Estado de los filtros: store nuevo `useVehicleFiltersStore`** (Zustand, mismo patrón que
   `useVehicleModalStore` de [feature 03](./03-vehicles-table.md)), en
   `features/vehicles/store/useVehicleFiltersStore.ts`:

   ```ts
   interface VehicleFiltersState extends VehicleFilters {
     setPlate(plate: string): void
     setType(type: VehicleTypeFilter): void
     setCapacity(capacity: CapacityFilter): void
     setStatus(status: VehicleStatusFilter): void
     setZoneIds(zoneIds: string[]): void
     reset(): void
   }
   ```

   Vive en `features/vehicles/` (no en `app/store/`) porque solo lo consume esta feature, siguiendo
   la regla de `architecture.md` ("Debe ser la excepción, no la regla: si un estado sólo lo usa una
   feature, vive en esa feature").
7. **Componente `VehiclesFilterBar.tsx`**, nuevo, en `features/vehicles/components/`, que lee y
   escribe `useVehicleFiltersStore` y renderiza el `TextField` + los 3 `Select` + el `Popover` de
   Zona + el botón "Restablecer" del punto 1. `Reset` llama a `reset()` del store (vuelve los 5
   campos a `DEFAULT_VEHICLE_FILTERS`), sin recargar datos del backend.
8. **Conexión con la tabla:** `VehiclesTable` ([feature 03](./03-vehicles-table.md)) deja de leer
   `vehicles` directo de `useVehiclesStore` y pasa a usar un hook derivado
   `useFilteredVehicles()` (nuevo, en `features/vehicles/hooks/`) que combina
   `useVehiclesStore((s) => s.vehicles)` + `useVehicleFiltersStore()` + `filterVehicles` con
   `useMemo`. Así la tabla no conoce el detalle de cómo se filtra, y el filtrado se puede testear
   por separado del render de la tabla.
9. **`VehiclesPage.tsx`** se modifica para montar `<VehiclesFilterBar />` entre `VehicleStatusCards`
   y `VehiclesTable` (mismo orden visual que el mockup de diseño: barra de filtros justo encima de
   la tabla).

## Estructura de archivos propuesta

```text
client/src/features/vehicles/
  constants/
    vehicleFilterOptions.ts        # nuevo: opciones de Tipo/Capacidad/Estado para los Select (Zona sale de useZonesQuery)
  utils/
    vehicleFilters.ts              # nuevo: VehicleFilters, DEFAULT_VEHICLE_FILTERS, matchesCapacityFilter, filterVehicles
  store/
    useVehicleFiltersStore.ts      # nuevo: { plate, type, capacity, status, zoneIds, setX, reset }
  hooks/
    useFilteredVehicles.ts         # nuevo: useVehiclesStore + useVehicleFiltersStore -> Vehicle[] filtrado (useMemo)
  components/
    VehiclesFilterBar.tsx          # nuevo: TextField (placa) + 3 Select + Popover/CheckboxGroup (Zona) + Button "Restablecer"
    VehiclesTable.tsx              # se modifica: usa useFilteredVehicles() en vez de useVehiclesStore directo
  pages/
    VehiclesPage.tsx               # se modifica: monta <VehiclesFilterBar /> entre status cards y tabla
```

Todos los archivos nuevos van dentro de `features/vehicles/` (regla de "Estructura interna de una
feature" en [architecture.md](../specs/architecture.md)); nada se agrega a `shared/`.

## Fuera de alcance

- Orden de columnas (`docs/verified-scope.md` §6.1: "por identificador, zona o estado") y paginación
  de 15 registros — no forman parte del mockup de este spec, quedan para un spec propio.
- Tabs (Vehículos/Activos/Incidentes) — igual que en [feature 03](./03-vehicles-table.md), fuera de
  alcance.
- Cualquier llamada nueva al backend para filtrar: los 5 filtros son 100% locales sobre
  `useVehiclesStore` (`docs/verified-scope.md` §6.1); Zona reutiliza el `useZonesQuery` que ya
  existía para nombres, sin agregar un endpoint de filtrado.
- Instalar librerías nuevas: `@radix-ui/themes` y `lucide-react` ya están instalados.

## Verificación post-implementación (cuando se apruebe y desarrolle)

1. `pnpm --filter client typecheck` compila sin errores (tipado estricto, sin `any`).
2. `pnpm --filter client lint` / `format:check` pasan sobre los archivos nuevos.
3. `pnpm --filter client test` — tests de `vehicleFilters.ts` (cada predicado y `filterVehicles`
   combinando los 5 criterios, incluyendo casos borde de `matchesCapacityFilter` en los límites
   1000/2000 según la Decisión 2), de `useFilteredVehicles` y de `VehiclesFilterBar` (cada control
   actualiza el store, el `Popover` de Zona soporta selección múltiple, "Restablecer" vuelve a
   `DEFAULT_VEHICLE_FILTERS`), cobertura ≥ 80%.
4. Revisión manual de que no hay `style={{ ... }}` literal fuera de un archivo `*.styles.ts` (mismo
   criterio que specs anteriores).
5. Verificación visual contra el mockup de
   [docs/designs/04-vehicles-filtertable.md](../designs/04-vehicles-filtertable.md).
