# SPEC — Geometría de zonas y derivación por coordenadas (MAP-00)

**Estado:** Aprobado
**Fecha:** 2026-07-06
**Relacionado:** [docs/verified-scope.md](../verified-scope.md) §10.5 (resolución que exige esta
geometría), [docs/specs/architecture.md](./architecture.md) ("Regla para shared", "shared/types"),
`api/src/data/zones.ts` (5 zonas por nombre, sin geometría), `api/src/utils/geo.ts` (`BA_BOUNDS`,
bounding box aproximado de Buenos Aires usado para generar coordenadas mock)

## Objetivo

Incorporar en `client/src` una representación geométrica simplificada (bounding boxes rectangulares
disjuntos) de las 5 zonas soportadas (Microcentro, Palermo, Recoleta, Belgrano, Caballito), que actúe
como **fuente de verdad** para determinar la zona real de un punto a partir de sus coordenadas —
según lo ya resuelto en `verified-scope.md` §10.5 pero nunca implementado.

## Alcance

Este spec **únicamente define geometría y utilidades puras**:

- No renderiza mapas ni capas.
- No crea componentes visuales.
- No integra Leaflet.
- No consume APIs (no reemplaza `GET /zones`, que sigue existiendo para traducir `zoneId -> name`
  en `vehicles`, `docs/verified-scope.md` §10.4).
- No modifica el backend (`api/`, fuera de alcance de este equipo, `architecture.md` §Alcance).
- No modifica todavía ningún consumidor (`assets`, `incidents`, `map`, tablas, filtros): esos specs
  migrarán a `deriveZone` cuando se implementen (ya anotado como deuda explícita en
  [docs/feature/07-assets-page.md](../feature/07-assets-page.md) "Diagnóstico" y "Fuera de alcance").

## Reglas de negocio

### Fuente de verdad

La zona de un punto se deriva **exclusivamente** de sus coordenadas:

```text
(lat, lng) → deriveZone() → 'MICROCENTRO' | ... | null
```

No se utiliza `asset.zoneId` ni `incident.zoneId` provenientes del backend — ese campo se asigna
aleatoriamente en el seed (`api/src/data/seed.ts`) y no refleja la ubicación real (§10.5).

### Geometría

Cada zona se modela con:

```ts
export interface BoundingBox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}
```

### Restricciones de los bounding boxes

1. No se solapan entre sí (verificado programáticamente, ver "Verificación").
2. Son mutuamente excluyentes: un punto pertenece, a lo sumo, a una zona.
3. Representan aproximadamente el área esperada de cada barrio real dentro de CABA, y están
   contenidos en `BA_BOUNDS` (`api/src/utils/geo.ts`), el rango del que el mock genera coordenadas.
4. Cubren únicamente las 5 zonas soportadas — no hay una sexta zona "catch-all".

### Puntos fuera de zona

Cuando un punto no cae dentro de ninguna geometría, `deriveZone(lat, lng)` retorna `null` (convención
elegida para este proyecto: `Zone | null`, ya que `undefined` se reserva en el resto del código para
"valor no cargado todavía", p. ej. datos de una query en curso, y `null` para "resuelto, sin
resultado" — mismo criterio que evitar ambigüedad con `hasHydrated`/`isLoading` de `architecture.md`).

### Redondeo previo a la evaluación

Las coordenadas de entrada se redondean a 4 decimales **antes** de evaluar pertenencia (mismo criterio
de redondeo ya usado en `docs/feature/07-assets-page.md` para visualización, ahora aplicado también
al cálculo de zona). `roundCoordinates(lat, lng)` es una utilidad pura, reutilizable.

## Ubicación en el proyecto

Se ubica en `shared/geo/` (no en `features/map/`), como excepción documentada a la regla general de
`architecture.md` ("un módulo pasa a shared únicamente cuando es utilizado por al menos dos
features"): esta geometría es, por diseño, un dato transversal que van a consumir como mínimo
`map` (capas/colores), `assets` y `incidents` (filtrado y agrupación por zona real, §10.5) y
potencialmente `vehicles`/tablas si en el futuro se agregan coordenadas a vehículos. Tratarla como
"de `map`" y promoverla recién cuando aparezca el segundo consumidor repetiría la misma migración ya
hecha una vez con `useZonesQuery`/`zoneNameFor` (`docs/feature/07-assets-page.md` "Generalización a
`shared/`") — se prefiere no repetir ese movimiento de archivos para un módulo cuya naturaleza
cross-feature ya es conocida de antemano.

```text
client/src/shared/
  types/
    domain.types.ts     # se amplía: + BoundingBox, Zone (enum de las 5 zonas soportadas)
  geo/
    zones.ts            # ZONES: Record<Zone, BoundingBox>, las 5 geometrías
    roundCoordinates.ts  # roundCoordinates(lat, lng) -> { lat, lng }
    isPointInsideZone.ts # isPointInsideZone(lat, lng, zone: BoundingBox) -> boolean
    deriveZone.ts        # deriveZone(lat, lng) -> Zone | null
    roundCoordinates.test.ts
    isPointInsideZone.test.ts
    deriveZone.test.ts
    zones.test.ts        # valida las 4 restricciones de geometría (CA-01/02/04)
```

**Nota de tipado:** el proyecto ya tiene `export interface Zone { id: string; name: string }` en
`domain.types.ts` (modelo espejo del backend, usado por `useZonesQuery`/`zoneNameFor`). Para no
colisionar nombres ni mezclar conceptos (zona-recurso-del-backend vs. zona-geográfica-derivada), el
tipo de las 5 zonas soportadas para geometría se llama `SupportedZone` (unión de literales):

```ts
export type SupportedZone = 'MICROCENTRO' | 'PALERMO' | 'RECOLETA' | 'BELGRANO' | 'CABALLITO'
```

`deriveZone` retorna `SupportedZone | null`. La traducción `SupportedZone -> nombre visible` (si hace
falta mostrarlo en UI) es responsabilidad de cada consumidor cuando se implemente (fuera de alcance
de este spec).

## Geometrías propuestas

Bounding boxes rectangulares disjuntos, aproximando la posición relativa real de cada barrio dentro
de `BA_BOUNDS` (`minLat: -34.705, maxLat: -34.526, minLng: -58.531, maxLng: -58.335`):

| Zona | minLat | maxLat | minLng | maxLng |
|---|---|---|---|---|
| MICROCENTRO | -34.612 | -34.600 | -58.383 | -58.368 |
| RECOLETA | -34.596 | -34.585 | -58.400 | -58.385 |
| PALERMO | -34.584 | -34.565 | -58.430 | -58.400 |
| BELGRANO | -34.564 | -34.545 | -58.465 | -58.435 |
| CABALLITO | -34.630 | -34.615 | -58.450 | -58.430 |

Verificado programáticamente (script ad-hoc, no forma parte del repo): las 5 cajas están contenidas
en `BA_BOUNDS` y ninguna par se superpone (para cada par, o el rango de latitudes o el de longitudes
no se intersecan, con un margen mínimo de 0.001° entre zonas contiguas — p. ej. Recoleta/Palermo —
para que el redondeo a 4 decimales no genere ambigüedad de borde). Esta tabla es la única fuente de
la geometría; los tests unitarios (`zones.test.ts`) validan estas 4 restricciones contra el objeto
real exportado, no contra esta tabla.

## Utilidades

```ts
export function roundCoordinates(lat: number, lng: number): { lat: number; lng: number }

export function isPointInsideZone(lat: number, lng: number, zone: BoundingBox): boolean
// lat >= zone.minLat && lat <= zone.maxLat && lng >= zone.minLng && lng <= zone.maxLng
// (límites inclusivos en los 4 bordes)

export function deriveZone(lat: number, lng: number): SupportedZone | null
// 1. redondea (lat, lng) con roundCoordinates
// 2. recorre ZONES y devuelve la primera SupportedZone cuyo BoundingBox contiene el punto
// 3. si ninguna zona lo contiene, devuelve null
```

`isPointInsideZone` no redondea por sí misma (recibe las coordenadas ya listas para evaluar) —
el redondeo es responsabilidad exclusiva de `deriveZone`, así `isPointInsideZone` queda testeable de
forma aislada con valores exactos de borde/esquina sin depender del redondeo.

## Criterios de aceptación

- **CA-01:** Existen exactamente 5 bounding boxes (`Object.keys(ZONES).length === 5`).
- **CA-02:** Los bounding boxes no presentan intersección (test que compara las 10 combinaciones de
  pares).
- **CA-03:** Un punto pertenece a una única zona (para cualquier punto de prueba, a lo sumo un
  elemento de `ZONES` lo contiene).
- **CA-04:** Los puntos fuera de las 5 zonas retornan `null`.
- **CA-05:** `deriveZone()` utiliza exclusivamente coordenadas — no recibe ni lee `zoneId`.
- **CA-06:** Las coordenadas de entrada se redondean a 4 decimales antes de evaluar pertenencia.
- **CA-07:** Existen pruebas unitarias para puntos internos, externos, bordes, esquinas y zonas
  adyacentes (ver "Plan de tests").

## Plan de tests

- `roundCoordinates.test.ts`: redondea a 4 decimales (casos con más y menos decimales, negativos).
- `isPointInsideZone.test.ts`: punto interno, punto externo, los 4 bordes exactos (inclusivos), las 4
  esquinas exactas (inclusivas), punto justo fuera de cada borde (por fuera por 0.0001).
- `deriveZone.test.ts`: un punto interno por cada una de las 5 zonas (CA-01 cubierto indirectamente),
  un punto en el "gap" entre dos zonas adyacentes (Recoleta/Palermo, el par con menor margen) que debe
  devolver `null`, un punto claramente fuera de `BA_BOUNDS` que debe devolver `null`, un punto con
  coordenadas de más de 4 decimales que redondea justo dentro de una zona (verifica CA-06 de punta a
  punta), verificación de que la firma no acepta `zoneId` (tipado, CA-05).
- `zones.test.ts`: recorre las 5 zonas y valida CA-01/02/04 de forma genérica (no hardcodea el
  resultado esperado zona por zona, para que seguir siendo válido si el equipo ajusta ligeramente
  algún límite).

## Fuera de alcance

- Migrar `assets`/`incidents`/`map`/tablas/filtros para consumir `deriveZone` en vez de `zoneId` — se
  hará en el/los spec(s) de cada feature consumidora (`map` es la primera candidata natural, al ser
  quien va a colorear/agrupar por zona).
- Polígonos reales de barrio (en vez de bounding boxes) — anotado en `verified-scope.md` §10.5 como
  posible evolución futura sin cambiar estas reglas ni la firma de `deriveZone`.
- Traducción de `SupportedZone` a nombre visible en UI (`'MICROCENTRO' -> 'Microcentro'`) — se define
  cuando el primer consumidor lo necesite.

## Verificación post-implementación

1. `pnpm --filter client typecheck` sin errores.
2. `pnpm --filter client lint` / `format:check` en verde sobre los archivos nuevos.
3. `pnpm --filter client test` — todos los tests de `shared/geo/` en verde, cobertura ≥ 80% en las 4
   métricas para los archivos nuevos.
4. Revisión manual de que `shared/geo/` no importa nada de `features/` (regla de dependencia,
   `architecture.md`).

## Estado de implementación

- ✅ `client/src/shared/geo/zones.ts`
- ✅ `client/src/shared/geo/roundCoordinates.ts`
- ✅ `client/src/shared/geo/isPointInsideZone.ts`
- ✅ `client/src/shared/geo/deriveZone.ts`
- ✅ Tests unitarios (puntos internos, externos, bordes, esquinas, zonas adyacentes)
- ✅ `client/src/shared/types/domain.types.ts` ampliado con `BoundingBox` y `SupportedZone`

## Hallazgos de verificación (post-implementación)

- **El mount conectado a esta sesión no permitió correr `pnpm --filter client typecheck|test`
  directamente** (mismo problema ya documentado en specs anteriores —
  [docs/feature/07-assets-page.md](../feature/07-assets-page.md) "Hallazgos de verificación": los
  binarios de `node_modules/.bin` y varios symlinks de paquetes (`typescript`, `vitest`, etc.) están
  rotos por el puente de archivos cruzado Windows/Linux de esta sesión — error de E/S al resolver el
  symlink, no un problema del código).
- **Mitigación:** se invocó `tsc` directamente desde su ubicación real dentro de
  `node_modules/.pnpm/typescript@5.9.3/...` (sorteando el symlink roto) y se corrió `tsc -b` sobre
  todo `client/`: no reportó ningún error en `shared/geo/*` ni en `domain.types.ts` — los únicos
  errores (`TS1127`, `TS17008`, etc.) aparecen en archivos preexistentes no tocados por este spec
  (`vehicleFormat.test.ts`, `HeaderPage.tsx`, `StatusSummaryCards.tsx`, `TablePagination.tsx`, y
  varios más de `assets`/`incidents`/`vehicles`), consistente con contenido corrupto por el mismo
  puente de archivos, no con una regresión de este cambio.
- Adicionalmente se replicó la lógica de `roundCoordinates`/`isPointInsideZone`/`deriveZone` en un
  script Node ad-hoc (fuera del repo) ejecutando los mismos casos que los tests unitarios (midpoints
  de las 5 zonas, gap Recoleta/Palermo, punto fuera de `BA_BOUNDS`, redondeo de esquina, aridad de
  `deriveZone`): los 5 casos coinciden exactamente con lo esperado por `deriveZone.test.ts`.
- **Acción pendiente del usuario:** correr `pnpm --filter client typecheck && pnpm --filter client
  lint && pnpm --filter client test && pnpm --filter client coverage` en un entorno con `node_modules`
  instalado nativamente (no vía este mount), mismo pedido que en specs previos con la misma
  limitación.

## Fix post-CI (2026-07-06)

**Síntoma real reportado por el usuario (GitHub Actions, `pnpm build` → `tsc -b`):**

```text
src/shared/geo/zones.test.ts(24,15): error TS2488: Type '[string, BoundingBox] | undefined' must
have a '[Symbol.iterator]()' method that returns an iterator.
```

**Causa raíz:** `client/tsconfig.json` tiene `noUncheckedIndexedAccess: true`. `zones.test.ts`
recorría pares de zonas indexando el array manualmente (`entries[i]`, `entries[j]`), lo cual bajo ese
flag tipa el resultado como `T | undefined` — el `tsc -b` local de esta sesión no lo detectó porque
corría contra un `node_modules`/symlinks con el mismo problema de corrupción ya documentado arriba
(no llegaba a evaluar ese archivo con el tsconfig real del proyecto).

**Fix:** se reescribió el test para recorrer pares con `for...of` anidado sobre `Object.entries(ZONES)`
en vez de indexar por posición, evitando el acceso indexado:

```ts
for (const [nameA, boxA] of entries) {
  for (const [nameB, boxB] of entries) {
    if (nameA >= nameB) continue // pares sin repetir, sin auto-comparación
    expect.soft(overlaps(boxA, boxB), `${nameA} overlaps ${nameB}`).toBe(false)
  }
}
```

Verificado con un script Node ad-hoc que la doble iteración sigue cubriendo las 10 combinaciones
únicas de las 5 zonas (`C(5,2) = 10`), mismo comportamiento que antes.

**Nota adicional de esta sesión:** al reescribir el archivo se detectó que el *mount* de esta sesión
también puede dejar bytes nulos (`0x00`) al final de un archivo tras un `Edit` — visible solo desde
`bash` (herramienta de shell), no desde `Read`/`Write` (que muestran el contenido real y correcto).
Confirma que, en este entorno, `bash` opera sobre un espejo del filesystem potencialmente
desincronizado del que usan las herramientas de archivo — para cualquier verificación de contenido
de archivo, `Read` es la fuente de verdad, no `cat`/`xxd` vía `bash`.
