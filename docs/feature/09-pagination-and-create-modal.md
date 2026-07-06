# SPEC — Paginación (15 filas) y alta ("Agregar X") en Vehículos, Activos e Incidentes

**Tipo:** feature (cross-cutting, toca las 3 features de listado)
**Estado:** Aprobado por el usuario (2026-07-06) e implementado. Decisiones de los 3 gaps:
Estado inicial **elegible** en el alta de Vehículos/Activos (gap 2), retroceso automático de página
al vaciarse (gap 4); `zoneId` como `Select` simple obligatorio (gap 1, sin cambios sobre la
propuesta).
**Fecha:** 2026-07-06
**Relacionado:** [docs/feature/03-vehicles-table.md](./03-vehicles-table.md),
[docs/feature/06-vehicles-modal.md](./06-vehicles-modal.md),
[docs/feature/07-assets-page.md](./07-assets-page.md) ("Fuera de alcance": paginación queda
pendiente), [docs/feature/08-incidents-page.md](./08-incidents-page.md),
[docs/specs/architecture.md](../specs/architecture.md) "Estado global y data-fetching",
[docs/verified-scope.md](../verified-scope.md) §6.1 ("Paginación de 15 registros por página",
"La totalidad de los registros se obtiene una única vez... Filtros, búsqueda, orden y paginación se
aplican localmente, sin nuevas consultas al backend"), `@tanstack/react-table` (ya instalado,
soporta `getPaginationRowModel` de forma nativa)

## Alcance

Dos capacidades independientes entre sí pero agrupadas en un único spec/PR porque tocan las mismas 3
pantallas (Vehículos, Activos, Incidentes) y el usuario las pidió juntas en la misma ronda:

1. **Paginación de 15 registros por página** en las 3 tablas.
2. **Botón "Agregar Vehículo" / "Agregar Activo" / "Agregar Incidente"** deja de ser un placeholder
   (`console.info`) y abre un modal de alta real, que crea el registro contra el backend mock
   (`POST /vehicles`, `POST /assets`, `POST /incidents` — los 3 ya existen e implementados, a
   diferencia de `PUT`/`PATCH`/`DELETE`, que no existen) y lo agrega al store local.

## Diagnóstico

### Paginación

- Hoy ninguna de las 3 tablas pagina: `VehiclesTable`/`AssetsTable` renderizan
  `table.getRowModel().rows` completo (todas las filas filtradas), sin `getPaginationRowModel`.
  `docs/verified-scope.md` §6.1 pide explícitamente "Paginación de 15 registros por página" —
  esto no es una funcionalidad nueva inventada, es una brecha respecto al scope ya verificado.
- El volumen real por entidad hace la ausencia de paginación especialmente notoria en Activos (1500
  registros) e Incidentes (40, pero se pagina igual por consistencia).
- `@tanstack/react-table` v8 ya soporta paginación de forma nativa (`getPaginationRowModel`,
  `table.getState().pagination`, `table.setPageIndex`, `table.getPageCount()`) — no hace falta
  ninguna librería nueva ni reimplementar el cálculo de páginas a mano.
- **"Carga de datos óptima"** (pedido explícito del usuario): ya está resuelto por el patrón
  existente documentado en `architecture.md` ("Hidratación única" + `staleTime: Infinity` +
  refetch deshabilitado) — los ~1500+40+N registros se traen **una única vez por sesión**, no una
  vez por página. Agregar paginación no dispara ninguna consulta nueva al backend: es puramente un
  recorte client-side sobre el array ya filtrado (`getPaginationRowModel` opera en memoria sobre las
  filas que ya están en el cliente). Esto es exactamente lo que pide §6.1 ("paginación se aplica
  localmente, sin nuevas consultas al backend") y lo que hace "óptima" la carga: 1 request por
  entidad por sesión de la app, cero requests adicionales al cambiar de página, filtrar u ordenar.
- Cambiar de filtro debe volver a la página 1 (si no, un filtro que reduce el total por debajo de la
  página actual dejaría la tabla en blanco). Se resuelve reseteando `pageIndex` a `0` cuando cambian
  los filtros de cada feature (`useEffect` sobre el resultado de `useFilteredVehicles`/
  `useFilteredAssets`/`useFilteredIncidents`, o pasando `pagination` como estado controlado y
  reseteándolo ahí).

### Alta ("Agregar X")

- Los 3 backends mock **sí** exponen `POST` (`createVehicle`, `createAsset`, `createIncident` en sus
  controllers respectivos) — a diferencia de `PUT`/`PATCH`/`DELETE`, que no existen
  (`docs/METHODS.md` "Limitaciones conocidas"). Esto es una asimetría real del mock: "Guardar"
  (editar) y "Eliminar" no tienen endpoint y por eso mutan solo el store; "Agregar" **sí** tiene
  endpoint, así que el alta puede (y debe) llamar al backend real antes de reflejarse en el store.
- Cada controller de alta arma `id` (via `Date.now().toString()`) y, en el caso de incidentes,
  `createdAt` — el frontend no genera esos campos, los recibe en la respuesta `201` y los usa para
  construir el objeto que entra al store (`addVehicle`/`addAsset`/`addIncident`).
- Si el `POST` falla (red, 400 de validación), el alta no debe tocar el store: se muestra un mensaje
  de error en el modal, igual criterio que el error de "Guardar" en los modales de edición.
- Hoy `VehiclesPage.tsx`/`AssetsPage.tsx` tienen `handleAddVehicle`/`handleAddAsset` como
  placeholders explícitamente documentados como "spec futuro" ([feature 05](./05-vehicles-header.md),
  [feature 07](./07-assets-page.md)) — este spec es exactamente ese spec futuro.
- `VehicleModal`/`AssetModal` hoy solo conocen los modos `'details'`/`'edit'`; se agrega un tercer
  modo `'create'` a ambos, y a `IncidentModal` desde su creación ([feature 08](./08-incidents-page.md)
  ya lo prevé en su store).

## Decisiones propuestas

### 1. Paginación — componente compartido

Se crea `shared/components/TablePagination.tsx` (candidato natural a `shared/` desde el día 1, ya
que las 3 features lo necesitan simultáneamente — no hace falta esperar a una "segunda feature" como
en los casos anteriores, acá ya son 3 de una vez):

```ts
export interface TablePaginationProps {
  pageIndex: number        // 0-based
  pageCount: number
  totalRows: number
  pageSize: number          // fijo en 15, pasado por quien lo use
  onPageChange: (pageIndex: number) => void
}
```

Renderiza: "Mostrando `<first>`–`<last>` de `<totalRows>`", botones "Anterior"/"Siguiente"
(`disabled` en los extremos) y el número de página actual / total. Estilos en
`tablePagination.styles.ts`, mismo criterio de `*.styles.ts` separados que el resto del proyecto.

### 2. Integración en cada tabla

`VehiclesTable.tsx`, `AssetsTable.tsx`, `IncidentsTable.tsx`:

```ts
const table = useReactTable({
  data: vehicles, // o assets / incidents
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: { pagination },
  onPaginationChange: setPagination,
  getRowId: (v) => v.id
})
```

`pagination` es estado local del componente (`useState<PaginationState>({ pageIndex: 0, pageSize:
15 })`), reseteado a `pageIndex: 0` con un `useEffect` cada vez que cambia la longitud/identidad del
array filtrado de entrada (mismo mecanismo en las 3 tablas). `<TablePagination>` se renderiza debajo
de `<Table.Root>`, alimentado por `table.getState().pagination`, `table.getPageCount()`,
`table.getRowModel().rows.length` (filas de la página actual) y
`table.getFilteredRowModel().rows.length` (total tras filtros, para el texto "de `<totalRows>`").

`pageSize` es una constante compartida `TABLE_PAGE_SIZE = 15` en `shared/constants/` (nuevo archivo
mínimo), para no repetir el literal `15` en 3 features distintas.

### 3. Modal de alta — modo `create`

Se extiende el store de modal de cada feature (`useVehicleModalStore`, `useAssetModalStore`,
`useIncidentModalStore`) agregando el modo `'create'` y una acción `openCreate()`:

```ts
export type VehicleModalMode = 'details' | 'edit' | 'create'
// ...
openCreate: () => set({ vehicleId: null, mode: 'create' })
```

`VehicleModal`/`AssetModal`/`IncidentModal` chequean `mode === 'create'` **antes** que la guarda
actual `vehicleId === null → return null` (hoy esa guarda asume que `vehicleId === null` significa
"modal cerrado"; con `create` deja de ser así — se ajusta a `if (mode === null) return null`, y el
caso `create` no depende de `vehicleId`/`foundVehicle` en absoluto).

Contenido del formulario de alta por entidad (todos los campos del modelo, ninguno de solo lectura
salvo `id`/`createdAt`, que los genera el backend):

| Feature | Campos del formulario | Control |
|---|---|---|
| Vehículos | Placa, Tipo, Capacidad, Zona, Estado | `TextField` (placa, con el mismo regex de `vehicleModalSchema`), `Select`×3 (tipo/zona/estado), `TextField type="number"` (capacidad) |
| Activos | Tipo, Estado, Dirección, Latitud, Longitud, Zona | `Select`×3 (tipo/estado/zona), `TextField` (dirección), `TextField type="number"` ×2 (lat/lng) |
| Incidentes | Tipo, Descripción, Latitud, Longitud, Zona (Estado por defecto `REPORTED`, no editable en el alta) | `Select`×2 (tipo/zona), `TextArea` (descripción), `TextField type="number"` ×2 (lat/lng) |

Validación: se agrega un schema nuevo por feature (`vehicleCreateSchema.ts`,
`assetCreateSchema.ts`, `incidentCreateSchema.ts`), separado del schema de edición existente (que
solo valida el campo único editable) — evita mezclar dos formularios con distintos campos
obligatorios en un mismo `z.object`.

### 4. Flujo de guardado (`handleCreate`)

1. Validar el formulario con el schema de alta (`safeParse`); si falla, mostrar el primer mensaje de
   error bajo el campo correspondiente (mismo patrón que `plateError` en `VehicleModal`).
2. `setIsSaving(true)`.
3. `POST` al endpoint correspondiente (`createVehicle`/`createAsset`/`createIncident` en
   `features/<feature>/api/use<Feature>Query.ts`, nueva función `create<Entity>(payload)` junto a
   `fetch<Entity>s` ya existente).
4. Si la respuesta es `201`: `add<Entity>(response.json())` sobre el store (acción nueva,
   `addVehicle`/`addAsset`/`addIncident`, mismo criterio que `removeX`/`updateX` ya existentes) y
   `close()`.
5. Si falla (status ≥ 400 o error de red): `setFeedback({ tone: 'error', message: 'No fue posible
   crear el <entidad>.' })`, sin tocar el store, `setIsSaving(false)`.

### 5. Header — reemplazo de los placeholders

`VehiclesPage.tsx`:

```ts
function handleAddVehicle(): void {
  useVehicleModalStore.getState().openCreate()
}
```

Mismo cambio en `AssetsPage.tsx` (`handleAddAsset` → `useAssetModalStore.getState().openCreate()`).
`IncidentsPage.tsx` ya nace con este comportamiento ([feature 08](./08-incidents-page.md) §8).

## Estructura de archivos propuesta

```text
client/src/shared/
  components/
    TablePagination.tsx        # nuevo
    tablePagination.styles.ts   # nuevo
  constants/
    tablePagination.ts          # nuevo: TABLE_PAGE_SIZE = 15

client/src/features/vehicles/
  api/useVehiclesQuery.ts       # se agrega: createVehicle(payload)
  schemas/vehicleCreateSchema.ts # nuevo
  store/useVehicleModalStore.ts  # se agrega: modo 'create', openCreate()
  store/useVehiclesStore.ts      # se agrega: addVehicle(vehicle)
  components/VehicleModal.tsx    # se agrega el modo 'create' (formulario nuevo)
  components/VehiclesTable.tsx   # se agrega paginación (getPaginationRowModel + TablePagination)
  pages/VehiclesPage.tsx         # handleAddVehicle -> abre el modal real

client/src/features/assets/     # mismos cambios en equivalentes de Activos
  api/useAssetsQuery.ts          # + createAsset(payload)
  schemas/assetCreateSchema.ts   # nuevo
  store/useAssetModalStore.ts    # + modo 'create', openCreate()
  store/useAssetsStore.ts        # + addAsset(asset)
  components/AssetModal.tsx      # + modo 'create'
  components/AssetsTable.tsx     # + paginación
  pages/AssetsPage.tsx           # handleAddAsset -> abre el modal real

client/src/features/incidents/  # mismos cambios, ya previstos en feature 08
  api/useIncidentsQuery.ts       # + createIncident(payload)
  schemas/incidentCreateSchema.ts # nuevo
  store/useIncidentModalStore.ts # ya nace con 'create' (feature 08)
  store/useIncidentsStore.ts     # ya nace con addIncident (feature 08)
  components/IncidentModal.tsx   # + modo 'create'
  components/IncidentsTable.tsx  # + paginación
```

## Gaps a resolver antes de implementar (pendiente de decisión del usuario)

1. **`zoneId` en el formulario de alta:** las 5 zonas son fijas y vienen de `GET /zones` — se propone
   un `Select` simple (no multi-select, a diferencia del filtro) con las 5 zonas + ninguna
   preseleccionada por defecto, obligando a elegir una (validado por el schema, sin opción "ALL").
   A confirmar.
2. **Estado inicial en el alta:** para Vehículos y Activos, ¿el campo Estado debe ser elegible por el
   usuario en el formulario de alta, o fijarse a un valor por defecto (`ACTIVE` / `OK`) igual que
   Incidentes fija `REPORTED`? Se propone dejarlo elegible (a diferencia de Incidentes) porque
   `verified-scope.md` no dice lo contrario y tiene sentido dar de alta, por ejemplo, un vehículo que
   ya está en mantenimiento. A confirmar.
3. **Texto de error de alta:** se propone "No fue posible crear el vehículo/activo/incidente.",
   calcado del criterio de los mensajes de edición existentes. A confirmar.
4. **Orden de páginas al eliminar la última fila de la página actual:** si el usuario borra el único
   registro visible en la última página, ¿la tabla debe retroceder automáticamente a la página
   anterior, o quedar en una página vacía con el control de "Anterior" habilitado? Se propone
   retroceder automáticamente (`useEffect` que clampea `pageIndex` a `pageCount - 1` cuando
   `pageIndex >= pageCount`). A confirmar.

## Fuera de alcance

- Ordenamiento por columna (`docs/verified-scope.md` §6.1 también lo pide) — no incluido en este
  spec, queda como fast-follow futuro independiente.
- Selector de tamaño de página (10/15/25/50 por página) — el pedido es fijo en 15, no configurable.
- Validación de duplicados (ej. placa ya existente) — el mock no valida esto server-side y no se
  agrega client-side en este spec.
- Alta de Zonas — las 5 zonas son fijas y se consumen de `GET /zones`, no se editan ni se crean.

## Verificación post-implementación (cuando se apruebe y desarrolle)

1. `pnpm --filter client typecheck` / `lint` / `format:check` sin errores.
2. `pnpm --filter client test`:
   - `TablePagination` (render de rango, disabled en extremos, `onPageChange`).
   - Cada tabla: 15 filas por página, navegación entre páginas, reset de página al filtrar.
   - Cada modal en modo `create`: validación de campos obligatorios, POST exitoso agrega al store y
     cierra el modal, POST fallido muestra error sin tocar el store.
   - Cobertura ≥ 80%.
3. Revisión manual de que `TABLE_PAGE_SIZE` se usa desde el único archivo de constante (sin literales
   `15` repetidos en las 3 tablas).

## Hallazgos de verificación (post-implementación)

- **El mount conectado a esta sesión no permitió ejecutar `pnpm` directamente**: ni `pnpm` ni
  `corepack`/`npm install -g pnpm` están disponibles, y aun invocando los binarios locales de
  `client/node_modules/.bin` (`tsc`, `vitest`) el puente de archivos devuelve `Input/output error` al
  leer `node_modules` (mismo problema ya documentado en
  [feature 07](./07-assets-page.md) "Hallazgos de verificación"). **No se pudo correr**
  `pnpm --filter client typecheck|lint|test|coverage` en esta sesión.
- Mitigación: revisión manual completa de cada archivo nuevo/modificado (lectura vía herramienta de
  archivos) en `vehicles`, `assets` e `incidents`, verificando tipado, imports, y que los 3 stores de
  modal (`useVehicleModalStore`, `useAssetModalStore`, `useIncidentModalStore`) manejan el modo
  `'create'` de forma consistente entre sí.
- **Acción pendiente del usuario:** correr `pnpm --filter client typecheck && pnpm --filter client
  lint && pnpm --filter client test && pnpm --filter client coverage` en un entorno con acceso normal
  al proyecto antes de mergear.
- **Regresión real encontrada y corregida tras `pnpm test` del usuario (2026-07-06):**
  `src/app/router/router.test.tsx` fallaba con `useThemeContext must be used within a Theme` al
  navegar a `/incidentes`. Causa raíz: `Select.Content` de `@radix-ui/themes` llama a
  `useThemeContext()` apenas se monta (incluso cerrado, para medir el tamaño de sus opciones), y
  `renderRouter()` en ese test nunca envolvía `RouterProvider` en `<Theme>` (a diferencia de
  `main.tsx`, que sí lo hace). El bug era latente para las 3 pantallas por igual, pero solo se
  manifestó con `/incidentes` porque su dataset mock (40 registros) resuelve mucho más rápido que
  el de `/activos` (1500), siendo la primera pantalla en salir del `Skeleton` dentro de la ventana
  de `findByRole` del test. Corregido agregando `<Theme>` a `renderRouter()`, calcando la
  composición real de providers de `main.tsx`. También se simplificó la paginación de las 3 tablas
  para no depender de la instancia `table` (inestable) en los `useEffect`, derivando `pageCount`
  directamente de la longitud del array filtrado — cambio defensivo, no era la causa real de este
  bug puntual.
- **Cobertura insuficiente tras `pnpm coverage` del usuario (2026-07-06):** 77.85% de statements
  (< 80% requerido), concentrada en el código nuevo sin tests: `createVehicle`/`createAsset`/
  `createIncident` (funciones de `api/use*Query.ts`) y el modo `'create'` de `VehicleModal`/
  `AssetModal`/`IncidentModal` (0% cubierto). Se agregaron:
  - `createVehicle`/`createAsset`/`createIncident`: tests de POST exitoso (payload + URL) y de
    rechazo cuando la respuesta no es `ok`, mismo patrón que los tests ya existentes de
    `fetchVehicles`/`fetchAssets`. `useIncidentsQuery.test.tsx` no existía — se creó completo
    (`fetchIncidents`, hidratación única, `createIncident`).
  - Modo `create` de los 3 modales: apertura del formulario, error de validación bloqueando
    "Crear", creación exitosa (POST mockeado + `addX` al store + cierre del modal), error de POST
    (mensaje de error, modal sigue abierto, store sin tocar) y "Cancelar" sin crear nada.
  - `IncidentModal.test.tsx` no existía (14% de cobertura) — se creó completo, calcando
    `AssetModal.test.tsx` para los modos `details`/`edit` más el bloque de `create`.
  - `IncidentsPage.test.tsx` no existía — se creó (skeleton, contenido cargado, click en "Agregar
    Incidente" abre el modal).
- **Segunda corrida de `pnpm coverage` (2026-07-06):** funciones sin ejecutar en
  `DeleteIncidentAlertDialog.tsx` (50%), `IncidentRowActionsMenu.tsx` (25%) y
  `useIncidentFiltersStore.ts` (0%) — reflejaban archivos de `incidents` a los que directamente les
  faltaba el test (nunca se habían creado, a diferencia de sus equivalentes en `assets`). Se agregaron,
  calcando 1:1 los tests ya existentes de Activos: `DeleteIncidentAlertDialog.test.tsx`,
  `IncidentRowActionsMenu.test.tsx`, `useIncidentFiltersStore.test.ts`, `IncidentsFilterBar.test.tsx`,
  `useFilteredIncidents.test.ts`, `incidentModalSchema.test.ts` e `incidentCreateSchema.test.ts` (estos
  últimos tres tampoco existían).
- **`pnpm typecheck` (2026-07-06):** TS2345 en `IncidentModal.tsx:75` —  `initialViewMode` estaba
  tipado para recibir `'details' | 'edit' | null`, pero `useIncidentModalStore` puede devolver
  también `'create'`. Corregido tipando el parámetro como `IncidentModalMode | null` (importando el
  tipo desde el store), igual que ya estaba hecho en `VehicleModal.tsx`/`AssetModal.tsx`.
- **`pnpm format:check` (2026-07-06):** 3 archivos marcados — `AssetModal.tsx`,
  `DeleteIncidentAlertDialog.tsx`, `VehicleModal.tsx`. Causa raíz real: 3 líneas de
  `<Select.Trigger id=... aria-label=... placeholder=... />` con los 3 atributos en una sola línea
  superaban los 100 caracteres de `printWidth` (109–118 caracteres) — el mismo tipo de problema ya
  corregido en la primera ronda, pero en líneas que se habían pasado por alto porque el escaneo
  automático de longitud de línea corrido en esta sesión leía una copia desincronizada del archivo
  (el puente de archivos de esta sesión y el editor de archivos no comparten el mismo caché; ver
  limitación ya documentada arriba). Corregidas manualmente envolviendo cada atributo en su propia
  línea: `AssetModal.tsx` línea `asset-create-zone` (109 caracteres) y `VehicleModal.tsx` líneas
  `vehicle-create-status` (118) y `vehicle-create-zone` (113). `DeleteIncidentAlertDialog.tsx` no
  tiene ninguna línea que supere los 100 caracteres; si `pnpm format:check` lo sigue marcando después
  de este fix, es por el salto de línea manual dentro del texto JSX del mensaje de confirmación (el
  algoritmo de *fill* de Prettier para texto dentro de JSX no necesariamente corta en el mismo punto
  que un salto de línea puesto a mano) — en ese caso correr `pnpm format` (no solo `format:check`)
  para que Prettier reescriba esa línea automáticamente en vez de intentar adivinarlo a mano de
  nuevo, dado que reformatear a mano ya falló dos veces en esta ronda.
