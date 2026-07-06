# SPEC — `AvailabilityAlert` (§10.8)

**Tipo:** feature
**Estado:** Aprobado (2026-07-06) — revisado (2026-07-06): 2 cambios pedidos por el usuario tras la
primera implementación, ver "Revisión 2026-07-06 (texto con nombre de zona + bug de wiring)".
**Fecha:** 2026-07-06
**Relacionado:** [docs/verified-scope.md](../verified-scope.md) §5, §9 (criterio 11), §10.8,
[docs/feature/11-vehicle-assignment-engine.md](./11-vehicle-assignment-engine.md) (motor que provee
el dato, ya aprobado), [docs/feature/10-maps-create.md](./10-maps-create.md) (pantalla de Mapa),
[docs/specs/architecture.md](../specs/architecture.md)

## Objetivo

Mostrar en la pantalla de Mapa una alerta cuando alguna de las 5 zonas soportadas no tiene ningún
vehículo `ACTIVE` disponible, usando el dato que ya expone `useAssignmentStore.zoneAvailability`
(spec 11, ya implementado). Este spec cierra el trabajo que 11 dejó explícitamente pendiente: ese
spec entrega el motor (`zoneHasAvailableVehicle`, `useAssignmentStore`), pero aclara que
`AvailabilityAlert` "no se construye en este cambio". Este documento sí lo construye.

## Reglas de negocio (verified-scope.md §10.8 / §9 criterio 11)

> Cuando no existen vehículos disponibles para operar los incidentes de una zona, debe mostrarse una
> alerta no cerrable, de ancho completo, ubicada debajo del mapa y encima de las Tabs, con el texto
> "No hay vehículos disponibles para esta zona".

**Actualizado 2026-07-06 (pedido directo del usuario, ver "Revisión" más abajo):** el texto pasa a
incluir el nombre de la zona afectada — "No hay vehículos disponibles para **{nombre de zona}**"
(p. ej. "No hay vehículos disponibles para Microcentro") — en vez del genérico "para esta zona". Todo
lo demás de la resolución original (no cerrable, ancho completo, ubicación) se mantiene sin cambios.

De esto se derivan 4 restricciones, sin margen de interpretación:

1. **No cerrable** — sin botón de cierre ni estado de "descartada"; se muestra mientras la condición
   sea verdadera y desaparece sola cuando deja de serlo (no hay estado local de visibilidad).
2. **Ancho completo** — ocupa el 100% del ancho disponible del contenedor de la pantalla de Mapa.
3. **Ubicación fija** — debajo del `Flex` que contiene el mapa (y la sidebar de heatmap cuando está
   activo), encima de `MapEntityTabs`.
4. **Texto con nombre de zona** — "No hay vehículos disponibles para {nombre de zona}", usando el
   nombre visible de la zona (`Microcentro`, `Recoleta`, `Palermo`, `Belgrano`, `Caballito` — mismos 5
   nombres de `verified-scope.md` §2.1), no el literal `SupportedZone` (`MICROCENTRO`, etc.).

## Diagnóstico

- El dato ya existe: `useAssignmentStore.zoneAvailability: Record<SupportedZone, boolean>` (spec 11,
  implementado), sincronizado por `useSyncAssignmentStore` ante cualquier cambio de
  `vehicles`/`assets`/`incidents`/`zonasById`.
- `MapPage.tsx` tiene hoy un comentario explícito señalando la ausencia deliberada de
  `AvailabilityAlert`, condicionada a la aprobación de este spec.
- El código ya existente (`zoneHasAvailableVehicle.ts`, comentario JSDoc) anticipa **una alerta por
  cada una de las 5 zonas** para las que el booleano da `false` — es decir, ante 2 zonas sin
  disponibilidad se renderizan 2 alertas apiladas, cada una con su propio nombre de zona en el texto
  (no se consolidan en una sola alerta agregada).
- **Sin mapeo de nombre visible para `SupportedZone`.** `shared/geo/` no tenía (hasta esta revisión)
  ningún `Record<SupportedZone, string>` — `supportedZoneFromName.ts` va en el sentido contrario
  (nombre → `SupportedZone`). Se agrega `shared/geo/supportedZoneLabel.ts` con el mapeo inverso, los 5
  nombres tomados de `verified-scope.md` §2.1.
- No existe hoy en el proyecto un componente de alerta reutilizable de este tipo (no confundir con
  `ConfirmAlertDialog`/`Delete*AlertDialog`, que son diálogos de confirmación modales, no banners
  informativos). Se usa `Callout` de `@radix-ui/themes` (ya instalado, mismo paquete que el resto de
  la UI — `Flex`, `Heading`, `Skeleton`, etc. en `MapPage.tsx`), que es no cerrable por diseño (no
  expone acción de dismiss), cumpliendo la restricción 1 sin código adicional.

## Diseño

### Ubicación en el proyecto

```text
client/src/features/map/
  components/
    AvailabilityAlert.tsx
    AvailabilityAlert.test.tsx
```

Vive en `features/map/components/`, no en `shared/`: el único consumidor es `MapPage` (regla de
`architecture.md` — "un módulo pasa a shared únicamente cuando es utilizado por al menos dos
features"), mismo criterio ya aplicado a `features/map/assignment/` en spec 11.

### Componente

```ts
export function AvailabilityAlert(): JSX.Element | null
```

- Lee `zoneAvailability` de `useAssignmentStore` (no recibe props: es un componente conectado al
  store, mismo patrón que `HeatmapLegend`/`HeatmapFilters` leyendo de `useMapStore`).
- Deriva `unavailableZones = ALL_ZONES.filter((zone) => !zoneAvailability[zone])` (recorrido en el
  mismo orden en que `useAssignmentStore` genera `zoneAvailability`, `Object.keys(ZONES)`, para un
  orden de renderizado determinístico y estable entre renders).
- Si `unavailableZones.length === 0`, retorna `null` (no renderiza ningún nodo — no hay "alerta
  vacía").
- Si no, renderiza un `Callout.Root` de ancho completo por cada zona en `unavailableZones`, todos con
  el mismo texto literal.

```tsx
import { Callout, Flex } from '@radix-ui/themes'
import { TriangleAlert } from 'lucide-react'
import { useAssignmentStore } from '../assignment/useAssignmentStore'
import { ZONES } from '../../../shared/geo/zones'
import { SUPPORTED_ZONE_LABELS } from '../../../shared/geo/supportedZoneLabel'
import type { SupportedZone } from '../../../shared/types/domain.types'
import { availabilityAlertStyle } from './mapPage.styles'

const ALL_ZONES = Object.keys(ZONES) as SupportedZone[]

export function AvailabilityAlert(): JSX.Element | null {
  const zoneAvailability = useAssignmentStore((state) => state.zoneAvailability)
  const unavailableZones = ALL_ZONES.filter((zone) => !zoneAvailability[zone])

  if (unavailableZones.length === 0) {
    return null
  }

  return (
    <Flex direction="column" gap="2" data-testid="availability-alert">
      {unavailableZones.map((zone) => (
        <Callout.Root key={zone} color="red" style={availabilityAlertStyle} role="alert">
          <Callout.Icon>
            <TriangleAlert size={16} />
          </Callout.Icon>
          <Callout.Text>
            No hay vehículos disponibles para {SUPPORTED_ZONE_LABELS[zone]}
          </Callout.Text>
        </Callout.Root>
      ))}
    </Flex>
  )
}
```

```ts
// shared/geo/supportedZoneLabel.ts
export const SUPPORTED_ZONE_LABELS: Record<SupportedZone, string> = {
  MICROCENTRO: 'Microcentro',
  RECOLETA: 'Recoleta',
  PALERMO: 'Palermo',
  BELGRANO: 'Belgrano',
  CABALLITO: 'Caballito'
}
```

`availabilityAlertStyle` (`width: '100%'`) se agrega a `mapPage.styles.ts` existente (co-localización
ya establecida en esa feature, mismo archivo que `mapLayoutStyle`/`heatmapLegendSwatchStyle`), no un
archivo `.styles.ts` nuevo.

`TriangleAlert` de `lucide-react` (ya en uso en el proyecto, `architecture.md` "Íconos") — ícono, no
texto, así que no altera el texto literal requerido.

`role="alert"` es un atributo de accesibilidad estándar (no visual, no textual), no una desviación del
texto aprobado.

### Integración en `MapPage`

```tsx
<Flex style={mapLayoutStyle}>{/* ...mapa + sidebar heatmap... */}</Flex>

<AvailabilityAlert />

<MapEntityTabs />
```

Se inserta entre el `Flex` del mapa y `MapEntityTabs`, dentro del mismo `Flex direction="column"
gap="4"` que ya envuelve ambos — cumple "debajo del mapa y encima de las Tabs" sin reestructurar el
layout existente. Se actualiza el comentario JSDoc de `MapPage` que hoy documenta la ausencia
deliberada de `AvailabilityAlert`, quitando esa nota (deja de aplicar una vez implementado).

`AvailabilityAlert` no depende del estado `isLoading`/`Skeleton` de `MapPage`: solo se monta dentro de
la rama ya cargada (mismo bloque que `MapEntityTabs`), por lo que nunca se evalúa contra datos
todavía no hidratados.

## Fuera de alcance

- Cualquier cambio a `zoneHasAvailableVehicle`/`assignVehicles` (spec 11, ya aprobado e implementado)
  — este spec solo consume `zoneAvailability`, no cambia cómo se calcula.
- Consolidar varias zonas sin disponibilidad en una sola alerta — se mantienen apiladas, una por zona
  (ver "Diagnóstico").
- Persistencia o descarte manual de la alerta (contradice "no cerrable").
- Sonido, notificación del sistema operativo o cualquier canal fuera de la propia pantalla de Mapa.

## Criterios de aceptación

- **CA-01:** Con las 5 zonas en `zoneAvailability: true`, `AvailabilityAlert` no renderiza ningún
  nodo (retorna `null`).
- **CA-02:** Con exactamente 1 zona en `false` (p. ej. `PALERMO`), se renderiza exactamente 1
  `Callout` con el texto "No hay vehículos disponibles para Palermo".
- **CA-03:** Con más de 1 zona en `false` (p. ej. 3 de 5), se renderizan esa misma cantidad de
  `Callout`, cada uno con el nombre de su propia zona, en el orden de `Object.keys(ZONES)`.
- **CA-04:** La alerta no expone ningún control de cierre (no hay botón "x" ni handler de
  dismiss/onClose en el árbol renderizado).
- **CA-05:** El contenedor de cada alerta tiene ancho 100% (`availabilityAlertStyle`).
- **CA-06:** En `MapPage`, el/los nodo(s) de `AvailabilityAlert` se ubican en el DOM después del
  contenedor del mapa y antes de `MapEntityTabs`.
- **CA-07:** La alerta reacciona a cambios de `zoneAvailability` sin remount: si una zona pasa de
  `false` a `true` (p. ej. tras activar un vehículo), su `Callout` correspondiente desaparece sin
  recargar la pantalla.
- **CA-08 (nuevo, revisión 2026-07-06):** en la app real (no en el test unitario del componente),
  `MapPage` mantiene `useAssignmentStore.zoneAvailability` sincronizado durante toda la sesión: al
  crear un vehículo `ACTIVE` en una zona que no tenía ninguno, la alerta de esa zona desaparece sin
  recargar la pantalla; al quedarse una zona sin ningún vehículo `ACTIVE` (el único se borra o pasa a
  `MAINTENANCE`/`OUT_OF_SERVICE`), la alerta aparece. Requiere que `MapPage` invoque
  `useSyncAssignmentStore()` (ver "Revisión 2026-07-06").
- **CA-09 (nuevo, revisión 2026-07-06):** `SUPPORTED_ZONE_LABELS` cubre exactamente las 5
  `SupportedZone` con los nombres de `verified-scope.md` §2.1 (`Object.keys(SUPPORTED_ZONE_LABELS)`
  igual a `Object.keys(ZONES)`).

## Plan de tests

- `AvailabilityAlert.test.tsx` (mockeando `useAssignmentStore` con `zoneAvailability` fijo por caso,
  mismo patrón que `HeatmapLegend.test.tsx`/`AssignmentControl.test.tsx` mockeando sus stores):
  - Las 5 zonas en `true` → no renderiza nada (`queryByTestId('availability-alert')` es `null`).
  - 1 zona en `false` → 1 `Callout` con el texto exacto.
  - 3 zonas en `false` → 3 `Callout`, orden estable, mismo texto en los 3.
  - Ninguna alerta expone rol/atributo de botón de cierre.
  - Cambio de prop simulado (re-render con `zoneAvailability` distinto) → refleja el nuevo estado sin
    necesidad de desmontar.
- `MapPage.test.tsx` (archivo ya existente): agregar caso de integración verificando la posición
  relativa de `AvailabilityAlert` respecto de `MapEntityTabs` en el DOM renderizado (CA-06).
- `supportedZoneLabel.test.ts` (nuevo): las 5 claves de `SUPPORTED_ZONE_LABELS` coinciden con
  `Object.keys(ZONES)`, cada valor es el nombre esperado (CA-09).
- `MapPage.test.tsx` (nuevo caso, CA-08): con `useSyncAssignmentStore()` ya wireado, mockear el fetch
  de `/zones` (mismo patrón que `useSyncAssignmentStore.test.tsx`) e hidratar `useVehiclesStore` con
  un único vehículo `ACTIVE` en una zona — verificar que la alerta de esa zona no aparece; luego
  `removeVehicle` (o `updateVehicle` a `MAINTENANCE`) ese vehículo y verificar que la alerta aparece
  sin desmontar `MapPage`; luego `addVehicle` uno nuevo `ACTIVE` en la misma zona y verificar que
  desaparece de nuevo.
- Cobertura ≥ 80% en los archivos nuevos/modificados.

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `format:check` sin errores.
2. `pnpm --filter client test` — cobertura ≥ 80%, incluyendo el caso de integración en
   `MapPage.test.tsx`.
3. Revisión manual: `AvailabilityAlert` no importa nada de otra feature (regla de dependencia,
   `architecture.md`) — únicamente `features/map/assignment/useAssignmentStore`, `shared/geo/zones`,
   `shared/types/domain.types` y `@radix-ui/themes`/`lucide-react`.

## Revisión 2026-07-06 (texto con nombre de zona + bug de wiring)

El usuario pidió, sobre la primera implementación ya aprobada, 2 cambios:

1. El texto debe nombrar la zona afectada ("No hay vehículos disponibles para (la zona que no
   tiene)") — cubierto arriba en "Reglas de negocio" / "Diseño" / CA-02, CA-03, CA-09.
2. La alerta debe **desaparecer** si aparece un vehículo disponible en la zona, y **aparecer** si una
   zona se queda sin ninguno.

Sobre el punto 2: revisando el código de la primera implementación se encontró que el punto 2 **ya
estaba soportado por el diseño** (`useAssignmentStore.zoneAvailability` se recalcula reactivamente
vía `useSyncAssignmentStore`, que se suscribe a `useVehiclesStore`/`useMapStore`/`useZonesQuery` —
spec 11), pero con un bug real que lo desactivaba por completo en la app:

**Bug encontrado:** `useSyncAssignmentStore()` **nunca se invoca** en `MapPage.tsx` ni en ningún otro
componente montado de la app (solo se llama desde sus propios tests,
`useSyncAssignmentStore.test.tsx`). Sin ese hook montado, nada dispara `recompute`:
`useAssignmentStore.zoneAvailability` se queda congelado en su valor inicial (`false` para las 5
zonas, ver `INITIAL_ZONE_AVAILABILITY` en `useAssignmentStore.ts`) durante toda la sesión, sin
importar cuántos vehículos se creen, editen o borren. Es decir: en la app real, antes de esta
revisión, `AvailabilityAlert` habría mostrado **las 5 alertas todo el tiempo**, nunca reactivas a
nada — el punto 2 del pedido del usuario no fallaba por un error de lógica, sino porque el hook que
la mantiene sincronizada jamás se ejecutaba fuera de sus propios tests.

**Fix:** `MapPage` invoca `useSyncAssignmentStore()` (mismo patrón que ya usa `useSyncMapStore()` en
esa misma pantalla), junto al resto de sus hooks de sincronización, antes del `return`. No requiere
ningún cambio en `useAssignmentStore`/`useSyncAssignmentStore`/`zoneHasAvailableVehicle` (spec 11):
el motor ya calculaba correctamente, solo hacía falta invocarlo.

```tsx
export function MapPage(): JSX.Element {
  const { isLoading } = useSyncMapStore()
  useSyncAssignmentStore()
  // ...resto sin cambios
}
```

Con esto: crear un vehículo `ACTIVE` en una zona (`addVehicle`) dispara el efecto de
`useSyncAssignmentStore` (nueva identidad del array `vehicles`) → `recompute` → `zoneAvailability`
pasa a `true` para esa zona → `AvailabilityAlert` deja de renderizar su `Callout`. Borrar el único
vehículo `ACTIVE` de una zona (`removeVehicle`) sigue el mismo camino en sentido inverso.

## Estado de implementación

- ✅ `client/src/features/map/components/mapPage.styles.ts` — `availabilityAlertStyle` agregado.
- ✅ `client/src/shared/geo/supportedZoneLabel.ts` — `SUPPORTED_ZONE_LABELS` (CA-09).
- ✅ `client/src/shared/geo/supportedZoneLabel.test.ts`
- ✅ `client/src/features/map/components/AvailabilityAlert.tsx` — texto con nombre de zona.
- ✅ `client/src/features/map/components/AvailabilityAlert.test.tsx` (CA-01 a CA-05, CA-07, CA-09)
- ✅ `client/src/features/map/pages/MapPage.tsx` — integrado entre el mapa y `MapEntityTabs`, invoca
  `useSyncAssignmentStore()` (fix del bug de wiring), JSDoc actualizado.
- ✅ `client/src/features/map/pages/MapPage.test.tsx` — caso de integración de posición (CA-06) y caso
  de reactividad end-to-end con `useVehiclesStore` real (CA-08).

## Hallazgos de verificación (post-implementación)

- **Mismo problema ya documentado en specs anteriores** ([docs/specs/geo-zone-derivation.md](../specs/geo-zone-derivation.md)
  "Hallazgos de verificación"): el mount conectado a esta sesión no permitió correr
  `pnpm --filter client typecheck|test` directamente (`pnpm` ni siquiera está en el `PATH` de esta
  sesión), y los binarios/symlinks de `node_modules/.bin` dan error de E/S.
- **Mitigación intentada:** se invocó `tsc -b` directamente desde una copia real de `typescript`
  disponible en el entorno (`/tmp/v4/client/node_modules/typescript/bin/tsc`) contra el proyecto
  montado. Reportó únicamente errores preexistentes no relacionados con este cambio
  (`vehicleFormat.test.ts`, `main.tsx`, `HeaderPage.tsx`, `StatusSummaryCards.tsx`,
  `TablePagination.tsx`, `zones.test.ts`) — mismo patrón de corrupción del puente de archivos ya
  reportado.
- **Hallazgo nuevo esta sesión:** además, `MapPage.test.tsx` (con el caso nuevo agregado por este
  cambio) fue reportado por `tsc` como con un "Unterminated string literal" en la línea que contiene
  el segundo `it(...)`. Se verificó con `cat`/`sed`/`xxd` vía `bash` que el archivo tal como lo ve el
  *shell* de esta sesión está **truncado a 3268 bytes**, cortado a mitad de esa misma línea — pero
  `Read` (herramienta de archivos) muestra el archivo completo y sintácticamente correcto, incluyendo
  el caso de test nuevo (CA-06) hasta el cierre final. Confirma, con un ejemplo más extremo que el ya
  documentado en `geo-zone-derivation.md` (que solo mencionaba bytes nulos finales), que el *bridge*
  de archivos de esta sesión puede truncar contenido completo visible solo desde `bash`, no desde
  `Read`/`Write`. Se toma `Read` como fuente de verdad, consistente con el criterio ya establecido.
- **Acción pendiente del usuario:** correr `pnpm --filter client typecheck && pnpm --filter client
  lint && pnpm --filter client format:check && pnpm --filter client test && pnpm --filter client
  coverage` en un entorno con `node_modules` instalado nativamente (no vía este mount), mismo pedido
  que en specs previos con la misma limitación.

### Fix post-`pnpm test` real (2026-07-06)

El usuario corrió `pnpm test` en su entorno (fuera de esta sesión) y reportó una falla real —la
primera confirmación efectiva de que el código corre, ya que en esta sesión nunca se pudo ejecutar la
suite (ver "Hallazgos de verificación"):

```text
FAIL AvailabilityAlert.test.tsx > updates without remounting when zoneAvailability changes (CA-07)
expect(element).not.toBeInTheDocument()
expected document not to contain element, found <div role="alert">...Microcentro</div> instead
```

**Causa raíz:** el segundo `useAssignmentStore.setState(...)` del test (el que vuelve las 5 zonas a
`true`, ya con el componente montado) se llamaba fuera de un `act(...)` de
`@testing-library/react`. La suscripción de Zustand notifica el cambio y React programa el
re-render, pero sin `act(...)` el test no espera a que React lo aplique antes de la siguiente
aserción — la aserción corría contra el DOM previo al re-render, todavía con la alerta de
`MICROCENTRO` montada.

**Fix:** se envolvió esa segunda mutación en `act(() => { ... })`
(`client/src/features/map/components/AvailabilityAlert.test.tsx`, caso CA-07), consistente con el
patrón ya usado en el nuevo test end-to-end de `MapPage.test.tsx` (CA-08), que sí envolvía sus
mutaciones de `useVehiclesStore` en `act(...)`. Ningún otro test de este archivo necesitaba el mismo
fix: los demás casos solo mutan el store **antes** de `renderAlert()`, donde el primer render ya
parte del estado final sin necesitar un flush intermedio.

### Revisión 2026-07-06 — mismo hallazgo, confirmado de nuevo

Al re-verificar tras el cambio de texto + fix de wiring, se repitió el mismo patrón: `tsc -b` reportó
"JSX element has no corresponding closing tag" en `AvailabilityAlert.tsx` y "'}' expected" en
`AvailabilityAlert.test.tsx`/`MapPage.test.tsx`. Se confirmó con `wc -l`/`tail -c` vía `bash` que
`AvailabilityAlert.tsx` tal como lo ve el *shell* de esta sesión tiene solo 38 líneas, cortado a mitad
de la palabra "vehículo" — mientras que `Read` muestra las 46 líneas completas y correctas (cierre de
`Callout.Text`/`Callout.Root`/`Flex`/función incluido). Mismo criterio que antes: `Read`/`Write` son
la fuente de verdad, no `bash`. Esto no cambia la acción pendiente: sigue haciendo falta correr la
suite completa fuera de este entorno antes de mergear.
