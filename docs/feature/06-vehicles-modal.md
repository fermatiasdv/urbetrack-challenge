# SPEC — Modal de detalle/edición de vehículo (Vehicles Modal)

**Tipo:** feature
**Estado:** Aprobado por el usuario (2026-07-06) — en implementación.
**Fecha:** 2026-07-06
**Relacionado:** [docs/designs/05-vehicles-modal.md](../designs/05-vehicles-modal.md),
[docs/feature/03-vehicles-table.md](./03-vehicles-table.md) (`VehicleRowActionsMenu`,
`useVehicleModalStore`), [docs/feature/02-vehicle-statuscard.md](./02-vehicle-statuscard.md)
(mapeo de color por estado), [docs/verified-scope.md](../verified-scope.md) §7.1 y §7.4,
[docs/specs/architecture.md](../specs/architecture.md), `client/src/features/vehicles/`,
`@radix-ui/themes` `Dialog` (https://www.radix-ui.com/themes/docs/components/dialog) y `TextField`
(https://www.radix-ui.com/themes/docs/components/text-field), `zod` (ya instalado en
`client/package.json`)

## Objetivo

Implementar el modal de detalle/edición de vehículo descripto en
[docs/designs/05-vehicles-modal.md](../designs/05-vehicles-modal.md) y en
[docs/verified-scope.md](../verified-scope.md) §7.1, que hoy no existe:
`VehicleRowActionsMenu` ([feature 03](./03-vehicles-table.md)) ya escribe la intención de abrirlo
en `useVehicleModalStore` (opciones "Detalles"/"Editar"), pero ningún componente lo lee ni lo
renderiza todavía. El modal debe:

1. Mostrarse cuando `useVehicleModalStore.vehicleId` no es `null`, con un fondo (backdrop) gris
   suave y translúcido detrás.
2. Cerrarse sin guardar cambios si se hace click fuera del contenido del modal (backdrop) — se
   pierde cualquier edición en curso.
3. Al guardar ("Guardar"), validar el formulario con **Zod** y, si es válido, persistir el cambio
   en el estado global (`useVehiclesStore`), no en el backend (no existe `PUT`/`PATCH`, ver
   [docs/METHODS.md](../METHODS.md)).
4. Usar controles de [Radix UI](https://www.radix-ui.com/) (`Dialog`, `TextField`) para el modal y
   sus inputs, consistente con el resto del proyecto
   ([docs/chore/02-visual-alignment.md](../chore/02-visual-alignment.md)).

## Diagnóstico

- **Estado de partida verificado contra el código:** `useVehicleModalStore.ts`
  (`client/src/features/vehicles/store/`) ya existe y expone `{ vehicleId, mode: 'details' |
  'edit' | null, open(vehicleId, mode), close() }`. `VehicleRowActionsMenu.tsx` ya llama a
  `open(vehicle.id, 'details')` / `open(vehicle.id, 'edit')` desde el menú kebab de cada fila. Este
  spec es el primero en **leer** ese store para renderizar el modal — hasta ahora `mode` se
  guardaba sin ningún efecto visible.
- **Dos modos, un solo modal, con transición entre ellos** (`docs/verified-scope.md` §7.1): abrir
  en modo `details` muestra el vehículo de solo lectura con botones "Modificar"/"Cerrar"; al
  presionar "Modificar" el modal pasa a mostrar el campo de Placa editable con botones
  "Guardar"/"Cancelar" (el mockup de
  [docs/designs/05-vehicles-modal.md](../designs/05-vehicles-modal.md) retrata exactamente este
  segundo estado). Abrir directamente en modo `edit` (opción "Editar" del menú) salta directo a la
  vista editable, sin pasar por la de solo lectura. Es un **estado de UI local del componente modal**
  (qué vista mostrar dentro de la sesión de apertura), no necesita vivir en
  `useVehicleModalStore` — se resetea a favor del `mode` inicial cada vez que el store cambia de
  `vehicleId`.
- **El mockup del diseño 05 solo retrata un estado** (edición, placa inválida) — no es el único
  estado del modal. La fuente de verdad funcional para el resto de los estados (solo lectura,
  edición con placa válida) es `docs/verified-scope.md` §7.1, ya anotado en las "Notas" de
  [docs/designs/05-vehicles-modal.md](../designs/05-vehicles-modal.md).
- **Backdrop: discrepancia mockup vs. pedido explícito del usuario.** El mockup envuelve el modal
  en `backdrop-blur-custom` (difuminado), pero el usuario pidió explícitamente para este spec un
  backdrop que "opacará con un gris suave el fondo" — sin blur. Se resuelve a favor del pedido
  explícito del usuario (fuente de verdad más reciente y más específica que el mockup): el overlay
  es un gris translúcido plano, sin `backdrop-filter`. `Dialog.Overlay` de `@radix-ui/themes` ya
  aplica un overlay semitransparente por defecto (`--gray-a9` sobre negro); se confirma en
  implementación si ese valor por defecto ya cumple "gris suave" o si hace falta una excepción
  puntual de `style` (mismo patrón que `sidebarContainerStyle`/`headerPageActionButtonStyle` de
  specs anteriores) para acercarlo al tono exacto si el usuario lo pide al revisar.
- **Cierre al click afuera:** `Dialog.Root` de Radix ya cierra por defecto al hacer click fuera del
  `Dialog.Content` o al presionar Escape, invocando `onOpenChange(false)`. Conectar
  `onOpenChange` a `useVehicleModalStore.close()` alcanza para cumplir "se cerrará perdiéndose los
  cambios": como el borrador de edición vive en estado local del componente (no se escribe en
  `useVehiclesStore` hasta "Guardar"), cerrar sin guardar simplemente descarta ese estado local al
  desmontarse — no hace falta lógica de "revertir" explícita.
- **Persistencia en datos globales:** `useVehiclesStore.ts` hoy solo tiene `setVehicles` y
  `removeVehicle` — no existe una acción para actualizar un vehículo existente. Hace falta agregar
  `updateVehicle(id, changes)`, análoga a `removeVehicle` (mismo patrón: mutación in-memory, sin
  llamada a backend, ver `docs/verified-scope.md` §7.4 y el comentario ya existente en
  `useVehiclesStore.ts` sobre `removeVehicle`).
- **Único campo editable: Placa.** Tanto el mockup (único `<input>` del formulario) como
  `docs/verified-scope.md` §7.1 ("Aparece el campo: Placa") coinciden en que Capacidad y Zona son
  de solo lectura incluso en modo edición — no hace falta `Select` de Zona ni input numérico de
  Capacidad en este modal, pese a que el pedido del usuario menciona "inputs o selects" en plural
  (cobertura general de la librería a usar, no una lista cerrada de controles a construir).
- **Validación de placa:** ya existe una implementación de referencia de los 2 formatos aceptados
  (`AAA111`, `AA111AA`) en `client/src/component-test/plate.ts`
  (`isValidPlate`/`isAcceptablePrefix`), pero es código de una carpeta de prueba/exploración
  (`docs/specs/component-test-vehicles-table.md`), no del árbol real de `features/vehicles/`. Este
  spec **no reutiliza ese archivo tal cual** (no está en el módulo de producción y no usa Zod);
  define en su lugar un `z.string().regex(...)` equivalente dentro de `features/vehicles/`, ver
  Decisión 3.
- **Colores del chip de estado:** ya existen `statusBadgeStyleFor`/`statusDotStyleFor`
  (`client/src/features/vehicles/components/vehicleStatusBadge.styles.ts`, creados en
  [feature 03](./03-vehicles-table.md)) que mapean `ACTIVE`→`success`, `MAINTENANCE`→`tertiary`,
  `OUT_OF_SERVICE`→`error`, ya usados en `VehiclesTable`. El chip "MANTENIMIENTO" del mockup usa el
  color de error, que es una inconsistencia del mockup respecto a este mapeo ya establecido (ver
  también "Notas" de `docs/designs/05-vehicles-modal.md`) — el modal reutiliza estos dos helpers
  existentes en vez de duplicar o copiar el color fijo del mockup.
- **Zona por nombre, no `zoneId`:** igual que en `VehiclesTable`
  ([feature 03](./03-vehicles-table.md)), el modal debe mostrar `zoneNameFor(vehicle.zoneId,
  zonesById)` (`utils/vehicleFormat.ts`) usando el mismo `useZonesQuery`, no el `zoneId` crudo
  (`docs/verified-scope.md` §10.4).
- **Mensajes de éxito/error de "Guardar" (`docs/verified-scope.md` §7.4):** "Vehículo actualizado
  correctamente." / "No fue posible actualizar el vehículo.", con el botón deshabilitado mientras
  se procesa. Como `updateVehicle` es una mutación síncrona en memoria (sin `await` a un backend
  real), "procesando" es efectivamente instantáneo, pero el spec igual modela el flujo como
  potencialmente asíncrono (booleano de estado local) para no asumir que nunca puede fallar y para
  dejar el mismo contrato si en el futuro `updateVehicle` pasa a llamar a un backend real.
- No existe hoy ningún uso de `zod` en `client/src/` (está en `package.json` pero sin importar
  desde ningún archivo) — este spec es el primero en usarlo en el frontend, replicando el patrón ya
  usado en `api/src/schemas/vehicle.schema.ts` (mismo backend mock).

## Decisiones propuestas

1. **Componente nuevo `VehicleModal.tsx`**, en `features/vehicles/components/`, montado una única
   vez en `VehiclesPage.tsx` (no por fila): lee `useVehicleModalStore` completo y no renderiza nada
   (`Dialog.Root open={false}`) cuando `vehicleId` es `null`. Cuando hay un `vehicleId`, resuelve el
   `Vehicle` buscándolo en `useVehiclesStore((s) => s.vehicles)` por `id` — si no se encuentra
   (vehículo eliminado mientras el modal iba a abrirse), se cierra a sí mismo (`close()`) sin
   renderizar contenido.
2. **Mapeo mockup → Radix**, en línea con las "Notas" de
   [docs/designs/05-vehicles-modal.md](../designs/05-vehicles-modal.md):

   | Elemento del mockup | Componente/origen |
   |---|---|
   | Contenedor + overlay | `Dialog.Root` (`open`, `onOpenChange={() => close()}`) — el overlay gris suave lo da `Dialog.Overlay` por defecto |
   | Caja del modal | `Dialog.Content` (`maxWidth="480px"`, análogo al `max-w-lg` del mockup) |
   | Título + chip de estado | `Dialog.Title` (`<TIPO> (<PLACA>)`, vía `vehicleTypeLabel`) + `span` con `statusBadgeStyleFor`/`statusDotStyleFor` (reutilizados de `vehicleStatusBadge.styles.ts`, no duplicados) + `Text` con `vehicleStatusLabel` |
   | Botón cerrar (`X`) | `Dialog.Close` + `IconButton` (`variant="ghost"`, ícono `X` de `lucide-react`) — mismo efecto que "Cerrar"/"Cancelar" según el modo |
   | Input Placa | `TextField.Root` (`TextField.Slot` a la derecha con ícono `AlertCircle` de `lucide-react` cuando hay error, reemplazando `error` de Material Symbols) |
   | Mensaje de error de placa | `Text` (`color="red"`, `size="1"`), debajo del `TextField.Root`, solo si el Zod parse falla |
   | Grilla Capacidad/Zona | `Grid` (`columns="2"`, `gap="4"`) con `Text` + ícono `lucide-react` (`Weight` para Capacidad, `MapPin` para Zona — reemplazan `weight`/`distance` de Material Symbols) |
   | Caja de contexto ("La patente debe...") | `Flex` con ícono `Info` (`lucide-react`) + `Text` (`color="gray"`, tamaño body) dentro de un `Box` con fondo `surfaceContainerLow` (excepción de `style`, sin prop equivalente en Radix, mismo patrón que specs anteriores) |
   | Footer con 2 botones | `Flex` (`justify="end"`, `gap="3"`) |

3. **Validación con Zod**, nuevo archivo `features/vehicles/schemas/vehicleModalSchema.ts`:

   ```ts
   export const PLATE_REGEX = /^(?:[A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/

   export const vehicleModalFormSchema = z.object({
     plate: z
       .string()
       .trim()
       .toUpperCase()
       .regex(PLATE_REGEX, 'Formato de placa inválido')
   })

   export type VehicleModalFormValues = z.infer<typeof vehicleModalFormSchema>
   ```

   Reemplaza los 2 formatos de `docs/verified-scope.md` §7.1 (`AAA111`, `AA111AA`) con una única
   regex, sin reimplementar `client/src/component-test/plate.ts` (carpeta de exploración, fuera del
   árbol de producción — ver Diagnóstico). El input normaliza a mayúsculas antes de validar
   (`.toUpperCase()`), igual que `isValidPlate` en el código de referencia. El texto del mensaje de
   error coincide literalmente con el del mockup ("Formato de placa inválido"). `safeParse` se
   ejecuta on-submit (al presionar "Guardar") y, opcionalmente, on-change para feedback inmediato
   como en el mockup — se define en implementación si el error se muestra mientras se tipea o solo
   tras un primer intento de guardar (ninguno de los dos documentos de origen lo especifica).
4. **`updateVehicle` nuevo en `useVehiclesStore`**:

   ```ts
   export interface VehiclesState {
     vehicles: Vehicle[]
     hasHydrated: boolean
     setVehicles: (vehicles: Vehicle[]) => void
     removeVehicle: (id: string) => void
     updateVehicle: (id: string, changes: Partial<Vehicle>) => void
   }

   updateVehicle: (id, changes) =>
     set((state) => ({
       vehicles: state.vehicles.map((vehicle) =>
         vehicle.id === id ? { ...vehicle, ...changes } : vehicle
       )
     }))
   ```

   `VehicleModal` llama `updateVehicle(vehicleId, { plate: values.plate })` — solo la Placa cambia,
   consistente con la Decisión 1 ("único campo editable"). Mismo criterio que `removeVehicle`: pura
   mutación in-memory, sin llamada a backend (`docs/verified-scope.md` §7.4).
5. **Flujo de guardado y mensajes** (`docs/verified-scope.md` §7.4): estado local `isSaving`
   (booleano) en `VehicleModal`. Al presionar "Guardar": `vehicleModalFormSchema.safeParse` → si
   falla, muestra el error y no llama a `updateVehicle`; si pasa, `isSaving = true`, llama
   `updateVehicle`, y si no lanza (nunca debería, es una mutación síncrona de array) muestra
   "Vehículo actualizado correctamente." y cierra el modal (`close()`); si lanzara, muestra "No fue
   posible actualizar el vehículo." y mantiene el modal abierto. El mensaje se resuelve con el
   mecanismo de feedback ya usado en el proyecto para operaciones puntuales (a confirmar en
   implementación si hay ya un patrón de toast/callout general o si este spec introduce el primero
   — no hay precedente identificado en `features/vehicles/` hoy). Mientras `isSaving` es `true`, el
   botón "Guardar" queda deshabilitado (igual que el estado "placa inválida" del mockup, mismo
   aspecto visual: `disabled`).
6. **Transición "Modificar" ↔ "Guardar"/"Cancelar":** estado local `viewMode: 'details' | 'edit'`
   en `VehicleModal`, inicializado desde `useVehicleModalStore.mode` cada vez que cambia
   `vehicleId` (`useEffect`/derivado, no se sincroniza de vuelta al store). En `viewMode ===
   'details'`: no se renderiza el `TextField` de Placa ni la caja de contexto, la Placa se muestra
   como texto plano en el título (ya incluida) y el footer tiene "Cerrar" (cierra el modal,
   `close()`) y "Modificar" (`viewMode = 'edit'`, sin tocar el store de vehículos). En `viewMode ===
   'edit'`: se renderiza el formulario completo del mockup, y el footer tiene "Cancelar" (vuelve a
   `viewMode = 'details'` si se abrió desde ahí, o cierra el modal si se abrió directo en modo
   `edit` — en ambos casos descarta el borrador de Placa sin guardar) y "Guardar" (Decisión 5).
7. **Click afuera / Escape:** `Dialog.Root onOpenChange={(open) => { if (!open) close() }}`. No
   hace falta lógica adicional de descarte: el borrador de Placa vive en estado local de
   `VehicleModal` (`useState`, inicializado en `vehicle.plate` al abrir), que se pierde al
   desmontarse el contenido del `Dialog` — cerrar sin guardar nunca llegó a llamar `updateVehicle`.

## Estructura de archivos propuesta

```text
client/src/features/vehicles/
  schemas/
    vehicleModalSchema.ts        # nuevo: PLATE_REGEX, vehicleModalFormSchema (Zod), VehicleModalFormValues
  components/
    VehicleModal.tsx             # nuevo: Dialog.Root, lee useVehicleModalStore + useVehiclesStore + useZonesQuery, viewMode local, valida con Zod, llama updateVehicle
  store/
    useVehiclesStore.ts          # se modifica: agrega updateVehicle(id, changes)
  pages/
    VehiclesPage.tsx             # se modifica: monta <VehicleModal /> una vez (fuera del map de filas de la tabla)
```

No se toca `useVehicleModalStore.ts` (ya expone todo lo necesario) ni `VehicleRowActionsMenu.tsx`
(ya llama `open(...)` correctamente).

## Fuera de alcance

- Hacer editables Capacidad o Zona — `docs/verified-scope.md` §7.1 y el mockup coinciden en que
  solo la Placa es editable; ampliar el formulario a más campos es un cambio de alcance futuro si
  se pide explícitamente.
- Cualquier llamada a backend (`PUT`/`PATCH /vehicles/:id`): no existe ese endpoint
  ([docs/METHODS.md](../METHODS.md) "Limitaciones conocidas"); "Guardar" solo muta
  `useVehiclesStore`.
- Modales de Activos e Incidentes (`docs/verified-scope.md` §7.2, §7.3) — son de solo lectura y no
  comparten este `useVehicleModalStore`; quedan para specs propios si se desarrollan.
- Definir o instalar un sistema de toasts/notificaciones general para los mensajes de éxito/error
  de la Decisión 5, si no existe ya un patrón — se resuelve con lo mínimo necesario en
  implementación si no aparece uno ya establecido en el proyecto.
- Ajustar el tono exacto del gris del backdrop más allá del valor por defecto de `Dialog.Overlay`,
  salvo que el usuario lo pida explícitamente tras revisar el resultado visual.

## Hallazgos de verificación (post-implementación)

Verificado en una copia aislada del repo (mismo mecanismo que specs anteriores por el problema de
mount ya documentado en [feature 05](./05-vehicles-header.md) y [fix 07](../fix/07-format-check-tsbuild-and-preexisting-lines.md)).
En esta sesión el mount conectado mostró, además, un problema nuevo y más severo: varias lecturas
por `bash` de archivos ya existentes en el repo (`vite.config.ts`, `HeaderPage.tsx`,
`VehicleStatusCard.tsx`, `useVehicleFiltersStore.ts`, algunos tests, e incluso el propio archivo
recién editado `useVehiclesStore.ts`) devolvían contenido truncado a mitad de línea, mientras que
la misma ruta leída con la herramienta de archivos (la fuente de verdad) mostraba el contenido
completo y correcto — un problema de caché desactualizada del puente de archivos de esta sesión,
no una corrupción real del repositorio del usuario. Se resolvió reescribiendo esos archivos en la
copia aislada a partir del contenido confirmado con la herramienta de archivos antes de compilar;
ningún archivo real del proyecto quedó afectado.

- `pnpm --filter client typecheck`: sin errores, una vez corregido lo anterior. Se encontró y
  corrigió además un error real de tipos propio de este spec: `vehicle.plate`/`vehicle.id` dentro
  de `handleCancel`/`handleSave` (funciones anidadas declaradas después del guard de
  `vehicleId`/`vehicle`) no heredaban el angostamiento de tipos de TypeScript (no lo hace a través
  de límites de función anidada). Se corrigió re-vinculando a una constante `const vehicle:
  Vehicle = foundVehicle` con tipo estático no nulo inmediatamente después del guard.
- `pnpm --filter client lint`: sin errores (solo 3 warnings preexistentes de
  `client/coverage/*.js`, artefactos de build, no relacionados).
- `pnpm --filter client format:check`: `vehicleModalSchema.ts` necesitó una pasada de `prettier
  --write` (colapsó la cadena `.trim().toUpperCase().regex(...)` a una sola línea) — aplicado. Los
  demás warnings (`.tsbuild-node/*`, 5 `README.md`) son preexistentes y no relacionados
  ([fix 07](../fix/07-format-check-tsbuild-and-preexisting-lines.md)).
- `pnpm --filter client test`: se encontraron y corrigieron 2 problemas reales de este spec:
  1. `VehicleModal.test.tsx` → "opens read-only..." fallaba por ambigüedad de accesibilidad: el
     botón "X" del header y el botón "Cerrar" del footer en modo solo-lectura resolvían al mismo
     nombre accesible ("Cerrar"). Se renombró el `aria-label` del botón "X" a "Cerrar modal".
  2. `VehiclesPage.test.tsx` fallaba con "No QueryClient set" porque `VehicleModal` (ahora montado
     siempre en `VehiclesPage`) llama a `useZonesQuery` real, y ese test no envuelve
     `<VehiclesPage>` en un `QueryClientProvider` (los demás hijos ya estaban mockeados). Se agregó
     `vi.mock('../components/VehicleModal', ...)` a `VehiclesPage.test.tsx`, mismo patrón que los
     otros 3 mocks de ese archivo.
  3. Con ambos fixes: 117/120 tests en verde. Los 3 tests que siguen en rojo
     (`VehiclesFilterBar.test.tsx`, interacción con `Select` de Zona/Tipo/Capacidad/Estado bajo
     jsdom, `TypeError: target.hasPointerCapture is not a function`) son la misma falla
     preexistente y no relacionada ya documentada en
     [feature 05](./05-vehicles-header.md#hallazgos-de-verificación-post-implementación) — ningún
     archivo de `VehiclesFilterBar` se tocó en este spec.
  4. `pnpm --filter client coverage` no llegó a imprimir la tabla de cobertura porque el run global
     falla por las 3 fallas preexistentes de `VehiclesFilterBar` (mismo bloqueo ya señalado en
     specs anteriores). Cobertura no confirmada con el número exacto; los archivos nuevos quedan
     ejercitados por 10 tests de `VehicleModal.test.tsx` (render nulo, vehículo inexistente, modo
     `details`, modo `edit`, "Modificar", placa inválida, guardado válido, "Cancelar" en sus 2
     variantes, cierre por overlay/Escape) y 10 de `vehicleModalSchema.test.ts` (formatos válidos,
     normalización a mayúsculas, trim, formatos inválidos), más 2 tests nuevos de
     `useVehiclesStore.test.ts` para `updateVehicle`.

## Verificación post-implementación (cuando se apruebe y desarrolle)

1. `pnpm --filter client typecheck` compila sin errores (tipado estricto, sin `any`).
2. `pnpm --filter client lint` / `format:check` pasan sobre los archivos nuevos/modificados.
3. `pnpm --filter client test`:
   - `vehicleModalSchema.test.ts`: acepta `AAA111` y `AA111AA` (incluyendo minúsculas, normalizadas
     a mayúsculas), rechaza formatos inválidos, con el mensaje de error exacto del mockup.
   - `useVehiclesStore.test.ts`: `updateVehicle` reemplaza solo los campos indicados del vehículo
     con el `id` dado, no toca los demás vehículos del array.
   - `VehicleModal.test.tsx`: no renderiza contenido si `vehicleId` es `null`; abre en modo
     `details` (solo lectura, botones "Cerrar"/"Modificar") o `edit` (formulario, botones
     "Cancelar"/"Guardar") según `mode`; "Modificar" pasa a la vista editable; placa inválida
     bloquea "Guardar" y muestra el error; placa válida llama `updateVehicle` y cierra el modal;
     click en el overlay (o `Escape`) cierra el modal sin llamar `updateVehicle`.
   - Cobertura ≥ 80% en los archivos nuevos.
4. Revisión manual de que no hay `style={{ ... }}` literal fuera de un archivo `*.styles.ts` (mismo
   criterio que specs anteriores), salvo la excepción puntual documentada en la Decisión 2 (caja de
   contexto).
5. Verificación visual contra
   [docs/designs/05-vehicles-modal.md](../designs/05-vehicles-modal.md) para el estado de edición
   con placa inválida, y contra `docs/verified-scope.md` §7.1 para el resto de los estados (solo
   lectura, edición con placa válida).
