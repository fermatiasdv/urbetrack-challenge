# SPEC — Pantalla de Incidentes (Incidents Page)

**Tipo:** feature
**Estado:** Aprobado por el usuario (2026-07-06) e implementado.
**Fecha:** 2026-07-06
**Relacionado:** [docs/feature/03-vehicles-table.md](./03-vehicles-table.md),
[docs/feature/04-vehicles-filtertable.md](./04-vehicles-filtertable.md),
[docs/feature/06-vehicles-modal.md](./06-vehicles-modal.md),
[docs/feature/07-assets-page.md](./07-assets-page.md),
[docs/feature/09-pagination-and-create-modal.md](./09-pagination-and-create-modal.md) (paginación y
alta se especifican ahí, no acá — ver "Fuera de alcance"),
[docs/specs/architecture.md](../specs/architecture.md), [docs/verified-scope.md](../verified-scope.md)
§2 (falta agregar el modelo de Incidentes, ver "Diagnóstico"), §6, §7.4, `api/src/schemas/incident.schema.ts`,
`api/src/data/incidents.ts`, `@tanstack/react-table`, `@radix-ui/themes`

## Objetivo

Construir la pantalla de Incidentes (`client/src/features/incidents/pages/IncidentsPage.tsx`, hoy un
placeholder `<h1>Incidentes</h1>`), replicando 1:1 la estructura y las decisiones ya aprobadas de
Activos ([feature 07](./07-assets-page.md)), que a su vez replica Vehículos:

1. `HeaderPage` (`shared/`) con título, subtítulo y acción "Agregar Incidente".
2. Tarjetas de estado (Total + 3 estados: `REPORTED`, `IN_PROGRESS`, `RESOLVED`).
3. Barra de filtros: Tipo, Estado, Zona (multi-select) + "Restablecer".
4. Tabla (TanStack Table) con columnas Tipo, Descripción, Estado, Zona, Latitud, Longitud, Fecha y
   una columna de Acciones (Detalles, Editar, Eliminar).
5. Modal de detalle/edición: solo lectura por defecto; en modo edición permite cambiar únicamente
   `status` (`Select`), con Guardar/Cancelar y mensajes de éxito/error — mismo criterio que el modal
   de Activos.

## Diagnóstico

- El backend mock ya expone `GET /incidents` (filtrable por `status`/`type`/`zoneId` vía query
  params, `api/src/controllers/incidents.controller.ts`) y `POST /incidents` (usado recién en
  [feature 09](./09-pagination-and-create-modal.md) para el alta, no en este spec). No hay
  `PUT`/`PATCH`/`DELETE` — igual que vehículos y activos, "Eliminar" y "Guardar" actúan solo sobre el
  store del frontend (`docs/verified-scope.md` §7.4, generalizado en `architecture.md`).
- Modelo (`api/src/schemas/incident.schema.ts`, `api/src/data/incidents.ts`):

  ```ts
  type IncidentType = 'OVERFLOW' | 'DAMAGE' | 'LITTERING' | 'OTHER'
  type IncidentStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED'

  interface Incident {
    id: string
    type: IncidentType
    status: IncidentStatus
    description: string
    lat: number
    lng: number
    zoneId: string
    createdAt: string // ISO 8601, generado por el backend al crear
  }
  ```

  No existe todavía en `shared/types/domain.types.ts` — se agrega ahí (fuente única de verdad de
  tipado), junto a `Vehicle`/`Asset`/`Zone`.
- **40 incidentes de datos semilla** (`api/src/data/incidents.ts`), volumen bajo comparado con los
  1500 activos, pero la paginación aplica igual por consistencia de UX entre las 3 pantallas (ver
  [feature 09](./09-pagination-and-create-modal.md)).
- **Sin mockup visual propio**: se reutilizan 1:1 los patrones visuales ya validados de
  Vehículos/Activos (misma librería Radix, mismos tokens).
- **Campo nuevo: `description`** (no existe en `Vehicle` ni `Asset`): se agrega como columna propia
  de la tabla de Incidentes, de solo lectura (no editable, ver más abajo).
- **Campo nuevo: `createdAt`**: se muestra en la tabla como columna "Fecha", formateado
  `dd/mm/aaaa hh:mm` (helper nuevo `incidentFormat.ts` → `formatIncidentDate`), y en el modal como
  dato de solo lectura adicional.
- **Coordenadas redondeadas a 4 decimales**, mismo criterio que Activos (`lat.toFixed(4)` /
  `lng.toFixed(4)`), solo en la capa de presentación.

## Decisiones propuestas — Incidentes

### 1. Tipos de dominio

Se agrega a `client/src/shared/types/domain.types.ts`:

```ts
export type IncidentType = 'OVERFLOW' | 'DAMAGE' | 'LITTERING' | 'OTHER'
export type IncidentStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED'

export interface Incident {
  id: string
  type: IncidentType
  status: IncidentStatus
  description: string
  lat: number
  lng: number
  zoneId: string
  createdAt: string
}
```

### 2. Data-fetching + store (mismo patrón que Activos/Vehículos)

- `features/incidents/api/useIncidentsQuery.ts` — `useQuery` → `GET /incidents`, mismas opciones
  anti-refetch (`staleTime: Infinity`, `refetchOnMount/WindowFocus/Reconnect: false`) e hidratación
  única (`hasHydrated`), mismo razonamiento que `architecture.md` "Hidratación única": los incidentes
  se van a poder eliminar/editar localmente y un remount de `IncidentsPage` no debe pisar esas
  mutaciones con el snapshot cacheado.
- Reutiliza `shared/services/useZonesQuery.ts` (ya compartido entre `vehicles`/`assets`, ahora
  también `incidents` — 3 features consumiendo el mismo query key `['zones']`, cero fetches
  redundantes).
- `features/incidents/store/useIncidentsStore.ts` — Zustand: `{ incidents: Incident[]; hasHydrated:
  boolean; setIncidents(incidents): void; removeIncident(id): void; updateIncident(id, changes:
  Partial<Incident>): void; addIncident(incident): void }`. `addIncident` es nuevo respecto a
  `useAssetsStore`/`useVehiclesStore` porque lo necesita el alta ([feature 09](./09-pagination-and-create-modal.md));
  se documenta acá porque el store nace ya con el método, en vez de agregarlo después.
- `features/incidents/store/useIncidentModalStore.ts` — `{ incidentId: string | null; mode:
  'details' | 'edit' | 'create' | null; open(incidentId, mode): void; openCreate(): void; close():
  void }`, mismo shape que `useAssetModalStore`, con el modo `'create'` ya incluido desde el inicio
  (ver [feature 09](./09-pagination-and-create-modal.md) para el detalle del formulario de alta).
- `features/incidents/store/useIncidentFiltersStore.ts` — `{ type: IncidentTypeFilter; status:
  IncidentStatusFilter; zoneIds: string[]; setType; setStatus; setZoneIds; reset }`. Sin búsqueda por
  texto, mismo criterio que Activos.

### 3. Tarjetas de estado (4: Total + 3 estados)

Usando `StatusSummaryCards` compartido:

| Card | `iconBoxColorRole` | Ícono (`lucide-react`) | Copy secundario |
|---|---|---|---|
| Total de Incidentes | `primary` | `AlertTriangle` | `"<pct> del total registrado"` |
| Reportados (`REPORTED`) | `error` | `AlertCircle` | `"<pct> pendientes de atención"` |
| En Progreso (`IN_PROGRESS`) | `tertiary` | `Clock` | `"<pct> en resolución"` |
| Resueltos (`RESOLVED`) | `success` | `CheckCircle2` | `"<pct> del total de incidentes"` |

`useIncidentStatusCards.ts` (en `features/incidents/hooks/`) replica `buildAssetStatusCards` para 3
estados en vez de 4, reutilizando `formatPercentage` de `shared/utils/`.

Grid responsivo: `columns={{ initial: '1', sm: '2', lg: '4' }}` (4 tarjetas, como Vehículos).

### 4. Tabla (TanStack Table)

Columnas (`ColumnDef<Incident>[]`, encabezados en español):

| Columna | Campo | Notas |
|---|---|---|
| Tipo | `type` | `incidentTypeLabel`: `OVERFLOW`→"Desbordamiento", `DAMAGE`→"Daño", `LITTERING`→"Basural", `OTHER`→"Otro" |
| Descripción | `description` | Texto tal cual, truncado con `text-overflow: ellipsis` si excede el ancho de columna (estilo nuevo en `incidentsTable.styles.ts`) |
| Estado | `status` | Badge con punto de color (`StatusBadge` compartido), `incidentStatusLabel`: `REPORTED`→"Reportado", `IN_PROGRESS`→"En Progreso", `RESOLVED`→"Resuelto" |
| Zona | `zoneId` → nombre | vía `useZonesQuery` compartido, `zoneNameFor` de `shared/utils/` |
| Latitud | `lat` | `lat.toFixed(4)` |
| Longitud | `lng` | `lng.toFixed(4)` |
| Fecha | `createdAt` | `formatIncidentDate(createdAt)` → `dd/mm/aaaa hh:mm` |
| Acciones | — | `RowActionsMenu` compartido: Detalles / Editar / Eliminar |

Fuente de datos: `useFilteredIncidents()` (análogo a `useFilteredAssets`), no `useIncidentsStore`
directo. La tabla incluye paginación de 15 filas — comportamiento y componente compartido
especificados en [feature 09](./09-pagination-and-create-modal.md), no se repite acá.

### 5. Menú de acciones y borrado

`IncidentRowActionsMenu.tsx` (wrapper fino sobre `RowActionsMenu` compartido), mismo patrón que
`AssetRowActionsMenu`: `items = [Detalles, Editar, Eliminar]`.

`DeleteIncidentAlertDialog.tsx` (wrapper fino sobre `ConfirmAlertDialog` compartido):
`title="¿Eliminar incidente?"`, `description="Se eliminará el incidente <TYPE_LABEL> reportado el
<fecha>. Esta acción no se puede deshacer."`, `onAccept={() => removeIncident(incident.id)}`.

### 6. Filtros

`IncidentsFilterBar.tsx`, mismo patrón visual que `AssetsFilterBar`:

| Campo | Control | Filtra sobre |
|---|---|---|
| Tipo | `Select` (Todos + `IncidentType`) | `Incident.type` |
| Estado | `Select` (Todos + `IncidentStatus`) | `Incident.status` |
| Zona | `Popover` + `CheckboxGroup` multi-select | `Incident.zoneId` |
| Restablecer | `Button` | limpia los 3 filtros |

`utils/incidentFilters.ts`: `IncidentFilters`, `DEFAULT_INCIDENT_FILTERS`,
`filterIncidents(incidents, filters)` — mismo criterio AND que `filterAssets`.
`constants/incidentFilterOptions.ts`: `INCIDENT_TYPE_FILTER_OPTIONS`/`INCIDENT_STATUS_FILTER_OPTIONS`.

### 7. Modal de detalle/edición

`IncidentModal.tsx`, montado una vez en `IncidentsPage.tsx`, mismo shape que `AssetModal`:

- **Modo `details` (default):** `<TYPE_LABEL>` — círculo de estado, Descripción, Zona, Latitud,
  Longitud, Fecha de creación — todo de solo lectura. Footer: "Cerrar" / "Modificar".
- **Modo `edit`:** aparece un `Select` de Estado (`REPORTED`/`IN_PROGRESS`/`RESOLVED`) precargado con
  el valor actual. Footer: "Cancelar" / "Guardar". El resto de los campos permanece de solo lectura
  — único campo editable, análogo a `status` en Activos.
- **Modo `create`:** ver [feature 09](./09-pagination-and-create-modal.md) — no se especifica acá
  para no duplicar la definición del formulario de alta entre los 3 specs.
- **Validación:** `features/incidents/schemas/incidentModalSchema.ts`, con
  `z.enum(['REPORTED', 'IN_PROGRESS', 'RESOLVED'])`.
- **Guardado:** `updateIncident(incidentId, { status: values.status })`, mismo flujo de `isSaving` y
  mensajes ("Incidente actualizado correctamente." / "No fue posible actualizar el incidente.").
- **Cierre por click afuera / Escape:** mismo criterio que `AssetModal`.

### 8. Header

```ts
const incidentsHeaderProps: HeaderPageProps = {
  title: 'Incidentes',
  subtitle: 'Incidentes reportados en la vía pública',
  action: { label: 'Agregar Incidente', icon: Plus, onClick: () => useIncidentModalStore.getState().openCreate() }
}
```

A diferencia de `handleAddVehicle`/`handleAddAsset` (placeholders), el botón acá **sí** abre el modal
de alta desde el día 1 de esta feature, porque [feature 09](./09-pagination-and-create-modal.md) se
implementa en el mismo cambio (ver ese spec para el detalle del formulario y el flujo de guardado).
Si el usuario prefiere aprobar esta pantalla antes que el spec de alta/paginación, el botón puede
quedar como placeholder (`console.info`) igual que en Vehículos/Activos y actualizarse cuando se
apruebe [feature 09](./09-pagination-and-create-modal.md) — a confirmar (ver "Gaps").

## Estructura de archivos propuesta

```text
client/src/shared/types/domain.types.ts   # se amplía: + IncidentType, IncidentStatus, Incident

client/src/features/incidents/
  api/
    useIncidentsQuery.ts           # nuevo
  store/
    useIncidentsStore.ts           # nuevo: { incidents, hasHydrated, setIncidents, removeIncident, updateIncident, addIncident }
    useIncidentModalStore.ts       # nuevo (incluye modo 'create' desde el inicio)
    useIncidentFiltersStore.ts     # nuevo
  constants/
    incidentFilterOptions.ts       # nuevo
  utils/
    incidentFormat.ts               # nuevo: incidentTypeLabel, incidentStatusLabel, incidentStatusColorRole, formatIncidentDate
    incidentFilters.ts               # nuevo: IncidentFilters, DEFAULT_INCIDENT_FILTERS, filterIncidents
  hooks/
    useIncidentStatusCards.ts      # nuevo
    useFilteredIncidents.ts        # nuevo
  schemas/
    incidentModalSchema.ts         # nuevo: z.enum de IncidentStatus (edición) — el schema de alta vive en feature 09
  components/
    IncidentsFilterBar.tsx         # nuevo
    IncidentsTable.tsx             # nuevo
    IncidentRowActionsMenu.tsx     # nuevo
    DeleteIncidentAlertDialog.tsx  # nuevo
    IncidentModal.tsx              # nuevo
    incidentsTable.styles.ts       # nuevo: ellipsis de la columna Descripción
  pages/
    IncidentsPage.tsx              # se reemplaza el placeholder: monta HeaderPage + StatusSummaryCards + IncidentsFilterBar + IncidentsTable + IncidentModal
```

## Gaps a resolver antes de implementar (pendiente de decisión del usuario)

1. **Orden de implementación respecto a [feature 09](./09-pagination-and-create-modal.md):** este
   spec asume que paginación y alta se desarrollan en el mismo cambio (sección 8 del Header ya llama
   a `openCreate()` y la tabla ya nace paginada). Si se prefiere aprobar Incidentes de forma aislada
   primero, el botón "Agregar Incidente" queda como placeholder y la tabla sin paginación hasta que
   se apruebe el otro spec — a confirmar.
2. **Truncado de `description` en la tabla:** se propone `ellipsis` con el texto completo visible en
   el modal de detalle. Alternativa: mostrar el texto completo en la celda (puede romper el ancho de
   columna con descripciones largas). Se propone truncar por defecto.
3. **Formato de fecha:** se propone `dd/mm/aaaa hh:mm` en base al `createdAt` ISO 8601 del backend,
   sin librería nueva (`Intl.DateTimeFormat` nativo). A confirmar si se prefiere otro formato.

## Fuera de alcance

- Paginación (15 registros/página) — especificada en
  [feature 09](./09-pagination-and-create-modal.md), no en este documento.
- Alta de incidentes (formulario completo de "Agregar Incidente") — especificada en
  [feature 09](./09-pagination-and-create-modal.md).
- Edición de `type`, `zoneId`, `lat`, `lng` o `description` — único campo editable es `status`,
  mismo criterio que Activos.
- Derivación geográfica de zona por polígono/bounding box — mismo estado del arte que el resto del
  proyecto (`zoneId` traducido a nombre vía `GET /zones`).
- Mapa de calor, marcadores de mapa, tooltips — pertenecen a la feature `map`.
- Tabs (Activos/Vehículos/Incidentes) — cada pantalla sigue siendo una ruta dedicada.
- Ordenamiento por columna (`docs/verified-scope.md` §6.1 también lo pide) — no incluido en este
  spec ni en el 09, queda como fast-follow futuro.

## Verificación post-implementación (cuando se apruebe y desarrolle)

1. `pnpm --filter client typecheck` compila sin errores (tipado estricto, sin `any`).
2. `pnpm --filter client lint` / `format:check` pasan sobre archivos nuevos.
3. `pnpm --filter client test`:
   - Tests de `incidentFormat.ts`/`incidentFilters.ts` (labels, `colorRole`, `filterIncidents` con
     los 3 criterios, `formatIncidentDate`).
   - Tests de `useIncidentStatusCards` (4 tarjetas, conteos y porcentajes, `total === 0`).
   - Tests de `IncidentsTable`, `IncidentRowActionsMenu`, `DeleteIncidentAlertDialog`,
     `IncidentsFilterBar`, `IncidentModal` (solo lectura, modo edición, guardar status válido,
     cancelar, cierre por overlay).
   - Cobertura ≥ 80%.
4. Revisión manual de que no hay `style={{ ... }}` literal fuera de un archivo `*.styles.ts`.
