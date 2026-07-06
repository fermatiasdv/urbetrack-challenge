# SPEC — Tabla de vehículos (Vehicles Table)

**Tipo:** feature
**Estado:** Aprobado — decisiones de los gaps 1/2/4 confirmadas por el usuario (2026-07-06): modal
de Detalles/Editar **fuera de alcance de este spec** (solo se conectan los triggers), zona por
**`GET /zones`**, botón "No" del `AlertDialog` con **`color="gray"`** de Radix. En implementación.
**Fecha:** 2026-07-06
**Relacionado:** [docs/designs/03-vehicles-table.md](../designs/03-vehicles-table.md),
[docs/designs/02-vehicles-status-cards.md](../designs/02-vehicles-status-cards.md),
[docs/feature/02-vehicle-statuscard.md](./02-vehicle-statuscard.md),
[docs/specs/architecture.md](../specs/architecture.md),
[docs/specs/component-test-vehicles-table.md](../specs/component-test-vehicles-table.md),
[docs/verified-scope.md](../verified-scope.md) §6, §7.1, §7.4, §10.4, §10.9,
[docs/METHODS.md](../METHODS.md) "Limitaciones conocidas",
`@tanstack/react-table` (ya instalado, ver `component-test-vehicles-table.md` §3),
`@radix-ui/themes` `AlertDialog` (https://www.radix-ui.com/themes/docs/components/alert-dialog) y
`DropdownMenu` (https://www.radix-ui.com/themes/docs/components/dropdown-menu)

## Objetivo

Mostrar, en `client/src/features/vehicles/pages/VehiclesPage.tsx` (debajo de
`VehicleStatusCards`, ver [feature 02](./02-vehicle-statuscard.md) punto 6 "Ubicación"), una tabla
de vehículos construida con **TanStack Table** sobre los vehículos reales del store
(`useVehiclesStore`), con una columna final de acciones que despliega un menú (**Detalles**,
**Editar**, **Eliminar**).

El mockup de referencia (fuente de verdad visual del `<tbody>`) es
[docs/designs/03-vehicles-table.md](../designs/03-vehicles-table.md). Los valores `KXR-9021`/`Heavy
Truck`/`5,500 KG`/`Active`/`North-East Logistics Hub` (y la segunda fila) son de ejemplo — este spec
reemplaza esos literales por filas **generadas dinámicamente** a partir de `Vehicle[]`.

## Diagnóstico

- `client/src/features/vehicles/` ya tiene `Vehicle`, `VehicleType`, `VehicleStatus` disponibles vía
  `client/src/shared/types/domain.types.ts` (ver [chore 04](../chore/04-move-typed.md)),
  `store/useVehiclesStore.ts` (`{ vehicles, setVehicles }`) y
  `api/useVehiclesQuery.ts` (hidrata el store desde `GET /vehicles`), todos creados en
  [feature 02](./02-vehicle-statuscard.md). Este spec no necesita un nuevo endpoint ni ampliar el
  modelo de datos.
- El modelo `Vehicle` no tiene `lat`/`lng` (solo `zoneId`); `docs/verified-scope.md` §10.4 ya
  resolvió que tabla y modal muestran la **zona por nombre**, no el `zoneId` crudo. Hoy no existe un
  mapa `zoneId -> name` en `features/vehicles/` (sí existía uno de ejemplo en
  `component-test/types.ts`, pero ese código es un proof-of-concept aparte, no reutilizable
  directamente). Hace falta un mapa de zonas real, idealmente desde `GET /zones` (`docs/METHODS.md`)
  o, como mínimo, las 5 zonas fijas documentadas en `docs/verified-scope.md` §2.1.
- El mockup no detalla el contenido del menú de la columna de acciones (`more_vert`); el usuario lo
  especificó en esta conversación (ver [docs/designs/03-vehicles-table.md](../designs/03-vehicles-table.md)
  "Notas sobre la última columna"): **Detalles** abre el modal de solo lectura, **Editar** abre el
  mismo modal ya en modo edición, **Eliminar** abre un `AlertDialog` de confirmación.
- El **modal de detalle/edición de vehículos** (`docs/verified-scope.md` §7.1: tipo+placa, círculo
  de estado con hover, capacidad, zona, botones Modificar/Guardar/Cerrar/Cancelar, validación de
  placa `AAA111`/`AA111AA`) **no existe todavía** en `features/vehicles/` — es un desarrollo propio,
  mencionado por el usuario como "el modal (generado más adelante)". **Decisión de alcance para este
  spec:** este spec entrega la tabla y deja el disparador de apertura de modal (`Detalles`/`Editar`)
  conectado a un estado (`{ vehicleId, mode: 'details' | 'edit' } | null`) en el store o en un hook
  local de `VehiclesPage`, pero **no implementa el modal en sí** — su contenido, validación de placa
  y guardado son un spec de feature separado y posterior (ver "Fuera de alcance").
- **Eliminar un vehículo:** el backend mock no expone `DELETE` (`docs/METHODS.md` "Limitaciones
  conocidas", `docs/verified-scope.md` §8). Igual que el guardado de edición (§7.4), el borrado
  actúa **solo sobre el estado global del frontend** (Zustand), sin llamada al backend.
- `@tanstack/react-table` y `@radix-ui/themes` ya están instalados (`component-test-vehicles-table.md`
  §3); no hace falta instalar nada nuevo. `AlertDialog` y `DropdownMenu` son componentes adicionales
  del mismo paquete `@radix-ui/themes` ya presente.

## Decisiones propuestas (a confirmar antes de implementar)

1. **Definición de columnas (TanStack Table, `ColumnDef<Vehicle>[]`)**, mapeando el mockup:

   | Columna del mockup | Campo de `Vehicle` | Notas |
   |---|---|---|
   | Placa (`KXR-9021`, bold, `text-primary`) | `plate` | texto tal cual, sin formato adicional |
   | Tipo (`Heavy Truck` / `Light Van`) | `type` | mapeo `TRUCK`→"Camión", `VAN`→"Furgoneta", `PICKUP`→"Camioneta" (nombres ya definidos en `docs/verified-scope.md` §2.2, no los literales en inglés del mockup, que es un ejemplo genérico) |
   | Capacidad (`5,500 KG` / `1,200 KG`) | `capacity` | se formatea con separador de miles + sufijo `KG`, ej. `capacity.toLocaleString('es-AR')` |
   | Estado (badge con punto de color) | `status` | mapeo de color igual al usado en tarjetas de estado ([feature 02](./02-vehicle-statuscard.md) punto 5): `ACTIVE`→éxito, `MAINTENANCE`→advertencia, `OUT_OF_SERVICE`→error; texto en español ("Activo"/"En mantenimiento"/"Fuera de servicio") |
   | Zona (`North-East Logistics Hub`) | `zoneId` → nombre | requiere el mapa de zonas (ver Gap 1) |
   | Acciones (`more_vert`) | — | botón que abre `DropdownMenu` (ver punto 3) |

   Encabezados de columna en español (mismo criterio que `component-test-vehicles-table.md` §6):
   Placa, Tipo, Capacidad, Estado, Zona, Acciones.

2. **Fuente de los datos:** la tabla lee de `useVehiclesStore` (ya hidratado por
   `useVehiclesQuery` en `VehiclesPage`), sin query propia — mismo patrón que
   `VehicleStatusCards`. Mientras `isLoading`, se reutiliza el mecanismo de skeleton ya usado en
   `VehiclesPage.tsx` (no se duplica un segundo loading state).
3. **Menú de acciones: `DropdownMenu` de `@radix-ui/themes`**, anclado al botón `more_vert` de cada
   fila (`DropdownMenu.Root` + `DropdownMenu.Trigger` + `DropdownMenu.Content`, que Radix posiciona
   automáticamente debajo del trigger — cumple "se despliega justo debajo de los puntos" sin
   cálculo manual de posición). Ítems: **Detalles**, **Editar**, **Eliminar** (`DropdownMenu.Item`,
   el último con `color="red"` para diferenciarlo visualmente como acción destructiva, consistente
   con el rojo del `AlertDialog` de confirmación).
   - **Detalles** → despacha `openVehicleModal(vehicle.id, 'details')`.
   - **Editar** → despacha `openVehicleModal(vehicle.id, 'edit')`.
   - **Eliminar** → abre el `AlertDialog` de confirmación (punto 4), no el modal de
     detalle/edición.
4. **Confirmación de borrado: `AlertDialog` de `@radix-ui/themes`**
   (https://www.radix-ui.com/themes/docs/components/alert-dialog), con:
   - `AlertDialog.Title`: texto de confirmación (ej. "¿Eliminar vehículo `<PLATE>`?", a definir
     literal exacto en implementación).
   - `AlertDialog.Action` → botón **"Aceptar"**, `color="red"` (destructivo, pedido explícito del
     usuario).
   - `AlertDialog.Cancel` → botón **"No"**, `color` secundario (a mapear al rol semántico
     `secondary` de `designTokens.colors` si Radix no tiene un color literal "secondary" — ver Gap
     2).
   - Al aceptar: se cierra el `AlertDialog` y se elimina el vehículo del store
     (`removeVehicle(id)`, nueva acción en `useVehiclesStore`), sin llamada al backend (mismo patrón
     que §7.4 de `docs/verified-scope.md` para edición).
   - Al rechazar ("No"): el `AlertDialog` se cierra sin eliminar nada (comportamiento nativo de
     `AlertDialog.Cancel`, no hace falta lógica adicional).
5. **Ampliación del store:** `useVehiclesStore` gana `removeVehicle(id: string): void` (filtra el
   array). No se toca `setVehicles` existente. La acción de edición (`updatePlate`/`updateVehicle`)
   queda fuera de este spec (se define junto con el modal, ver "Fuera de alcance").
6. **Estado de qué vehículo/modo tiene el modal abierto:** se propone un store chico y separado
   `useVehicleModalStore` (`{ vehicleId: string | null; mode: 'details' | 'edit' | null;
   open(id, mode): void; close(): void }`) en `features/vehicles/store/`, en vez de estado local en
   `VehiclesPage`, para que un futuro spec de modal pueda suscribirse a él sin recibir props desde
   la tabla. Este spec **solo** define y conecta el store (los `DropdownMenu.Item` lo actualizan);
   no renderiza el modal en sí.

## Estructura de archivos propuesta

```text
client/src/features/vehicles/
  api/
    useZonesQuery.ts              # useQuery -> GET /zones (nuevo; falta confirmar, ver Gap 1)
  store/
    useVehiclesStore.ts           # se amplía: + removeVehicle(id)
    useVehicleModalStore.ts       # nuevo: { vehicleId, mode, open, close }
  utils/
    vehicleFormat.ts               # nuevo: vehicleTypeLabel, vehicleStatusLabel, formatCapacity
  components/
    VehiclesTable.tsx              # nuevo: TanStack Table + columnas + DropdownMenu por fila
    VehicleRowActionsMenu.tsx      # nuevo: DropdownMenu.Root con Detalles/Editar/Eliminar
    DeleteVehicleAlertDialog.tsx   # nuevo: AlertDialog de confirmación de borrado
  pages/
    VehiclesPage.tsx               # se modifica: monta <VehiclesTable /> debajo de <VehicleStatusCards />
```

Todos los archivos nuevos van dentro de `features/vehicles/` (regla de "Estructura interna de una
feature" en [architecture.md](../specs/architecture.md)); nada se agrega a `shared/` (componentes,
hooks, utils) porque nada de esto se reutiliza todavía desde una segunda feature. La única excepción
es el tipado: `Zone` (`{ id, name }`) vive en `client/src/shared/types/domain.types.ts`, fuente única
de verdad del tipado de dominio ([chore 04](../chore/04-move-typed.md)), no en un `types/` propio de
la feature.

## Gaps — resolución confirmada por el usuario (2026-07-06)

1. **Origen del nombre de zona: `GET /zones` real** (`useZonesQuery`, mismo patrón React Query +
   Zustand que `useVehiclesQuery`), no una constante fija.
2. **Color del botón "No": `color="gray"`** nativo de Radix, sin estilo custom desde
   `designTokens`.
4. **Alcance del modal: fuera de este spec.** Este spec solo conecta los triggers **Detalles** /
   **Editar** a `useVehicleModalStore`; el modal en sí (contenido, validación de placa,
   Guardar/Cancelar) es un spec de feature posterior.

Quedan abiertos, sin bloquear la implementación (se resuelven con un valor por defecto razonable,
documentado aquí):

3. **Texto de la alerta de confirmación:** `AlertDialog.Title` = "¿Eliminar vehículo?",
   `AlertDialog.Description` = "Se eliminará el vehículo con placa `<PLATE>`. Esta acción no se
   puede deshacer." (interpolando la placa real de la fila).
5. **Capacidad formateada:** se usa `Intl.NumberFormat('es-AR')` (separador de miles con punto,
   ej. `5.500 KG`), consistente con el resto de la UI en español, en vez de replicar literalmente
   la coma del mockup (que es un ejemplo en inglés).

## Fuera de alcance

- El modal de detalle/edición de vehículos en sí (contenido, círculo de estado con hover, validación
  de placa, botones Modificar/Guardar/Cerrar/Cancelar, mensajes de éxito/error) —
  `docs/verified-scope.md` §7.1 y §7.4 — se desarrolla en un spec de feature posterior. Este spec
  solo dispara su apertura vía `useVehicleModalStore`.
- Filtros, búsqueda, ordenamiento y paginación de la tabla (`docs/verified-scope.md` §6.1/§6.2) —
  fuera de lo pedido en esta conversación, quedan para un spec propio.
- Tabs (Vehículos/Activos/Incidentes) — `docs/verified-scope.md` §6.1 — no forman parte de este
  spec; hoy `VehiclesPage` es una pantalla dedicada, sin tabs.
- Instalar librerías nuevas: `@tanstack/react-table` y `@radix-ui/themes` ya están instalados.

## Hallazgos de verificación (post-implementación)

- **El borrado no se conservaba al navegar afuera y volver a "Vehículos".** `VehiclesPage`
  desmonta/remonta `useVehiclesQuery` en cada navegación; el `useEffect` de hidratación no tenía
  guarda, así que el remount volvía a llamar `setVehicles` con el dataset **cacheado** de la carga
  original (sin el vehículo eliminado), pisando el borrado local. No es un problema específico de
  "Eliminar": afecta a cualquier mutación local sin persistencia en backend.
  **Decisión:** se corrige a nivel de patrón general, no solo en `vehicles` — ver
  [docs/specs/architecture.md](../specs/architecture.md) → "Patrón: query hidrata store" →
  "Hidratación única" (nueva fuente de verdad) y
  [docs/verified-scope.md](../verified-scope.md) §10.13. Implementación: `useVehiclesStore` agrega
  `hasHydrated`; `useVehiclesQuery` solo hidrata si `!hasHydrated` y deshabilita el refetch
  automático (`staleTime: Infinity`, `refetchOnMount/WindowFocus/Reconnect: false`).
- **`pnpm typecheck` falló en `VehiclesTable.test.tsx`.** `tsconfig.json` tiene
  `noUncheckedIndexedAccess: true`, por lo que indexar un array literal (`VEHICLES[0]`) tipa el
  resultado como `Vehicle | undefined`, no `Vehicle`; `setVehicles([VEHICLES[0]])` no compila contra
  `setVehicles(vehicles: Vehicle[])`. **Decisión:** no usar índices de array en los tests — se
  destructura el elemento a una constante propia (`const [firstVehicle] = VEHICLES`) o se define un
  vehículo dedicado para el caso de "una sola fila", evitando la aserción no-null (`!`), consistente
  con el proyecto "fuertemente tipado".
- **`pnpm coverage` marcó `useZonesQuery.ts` con cobertura baja (20% statements, 0% branches).** No
  existía un test dedicado (a diferencia de `useVehiclesQuery.test.tsx`, que sí cubre `fetchVehicles`
  ok/error e hidratación). **Decisión:** agregar `useZonesQuery.test.tsx` con la misma estructura de
  casos que su equivalente de vehículos (respuesta ok, respuesta no-ok, resolución de la query), para
  llegar al umbral de cobertura ≥ 80% exigido en "Verificación post-implementación" #3.

## Verificación post-implementación (cuando se apruebe y desarrolle)

1. `pnpm --filter client typecheck` compila sin errores (tipado estricto, sin `any`).
2. `pnpm --filter client lint` / `format:check` pasan sobre los archivos nuevos.
3. `pnpm --filter client test` — tests de `VehiclesTable` (renderiza una fila por vehículo del
   store, columnas correctas, zona traducida por nombre), de `VehicleRowActionsMenu` (abre el menú,
   cada ítem dispara la acción esperada) y de `DeleteVehicleAlertDialog` (Aceptar elimina del store
   y cierra, No cierra sin eliminar), cobertura ≥ 80%.
4. Revisión manual de que no hay `style={{ ... }}` literal fuera de un archivo `*.styles.ts` (mismo
   criterio que specs anteriores).
5. Verificación visual contra el mockup de
   [docs/designs/03-vehicles-table.md](../designs/03-vehicles-table.md).
