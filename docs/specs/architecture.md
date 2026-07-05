# SPEC — Arquitectura del frontend

**Estado:** Aprobado
**Fecha:** 2026-07-05
**Relacionado:** monorepo pnpm (`api` + `client`), [ci-cd-pipeline.md](./ci-cd-pipeline.md), [component-test-vehicles-table.md](./component-test-vehicles-table.md)

## Alcance

Este spec aplica **únicamente a `client/src`**. El repo es un monorepo pnpm con dos paquetes, `api` y `client` (`pnpm-workspace.yaml`):

- `api` es el mock backend (Express), ya construido, fuera de alcance de este equipo — no se modifica ni se reorganiza (ver [ci-cd-pipeline.md](./ci-cd-pipeline.md), que ya excluye a `api` del pipeline de CI por el mismo motivo). Mantiene su propia organización por capas (`controllers/`, `routes/`, `schemas/`, etc.), que no se toca.
- Todas las referencias a `src/` en este documento son relativas a `client/src/`, no a la raíz del repo.

## Visión general

El proyecto adopta una arquitectura ligera basada en funcionalidades (Feature-Sliced Architecture).

Objetivos:

- Alta cohesión
- Bajo acoplamiento
- Escalabilidad
- Facilidad de refactorización
- Límites claros de responsabilidad
- Crecimiento predecible del proyecto

---

## Principios

### Desarrollo orientado a funcionalidades

Todo nuevo desarrollo debe pertenecer a una feature. Una feature representa una capacidad funcional del negocio.

Ejemplos:

- `incidents`
- `vehicles`
- `zones`
- `map`
- `filters`

El código compartido únicamente debe extraerse cuando sea utilizado por al menos dos features distintas.

---

### Estrategia de ramas

Cada feature debe desarrollarse de manera aislada en una rama propia. Prefijo obligatorio, validado en CI (ver [ci-cd-pipeline.md](./ci-cd-pipeline.md#convención-de-ramas)):

```text
^(feat|fix|chore|docs|test|refactor)\/[a-z0-9._-]+$
```

Ejemplos:

```text
feat/incidents-map
feat/render-zones
feat/table-filters
fix/vehicle-popup
chore/update-eslint
docs/update-readme
test/incidents-coverage
refactor/map-layers
```

---

### Estrategia de commits

Los commits deben ser atómicos. Cada commit debe representar una modificación pequeña, comprensible y coherente.

Ejemplos:

```text
feat(incidents): create types
feat(incidents): implement service
feat(incidents): render markers
test(incidents): add marker tests
refactor(map): simplify layer rendering
```

Una feature puede estar compuesta por uno o varios commits.

---

### Pull Requests

Cada feature genera un único Pull Request contra `main`.

Requisitos mínimos (checks requeridos por Branch Protection, ver [ci-cd-pipeline.md](./ci-cd-pipeline.md)):

- `validate-branch-name` exitoso
- `ci` exitoso (lint, prettier `format:check`, typecheck, tests, cobertura, build — ver [Quality Gates](#quality-gates))
- PR obligatorio antes de mergear (push directo a `main` bloqueado)

**Nota sobre aprobación de revisión:** hoy el ruleset exige `Required approvals: 0`, porque GitHub no permite que el autor de un PR apruebe su propio PR y el proyecto tiene un único contribuidor — exigir 1 dejaría todo PR propio imposible de mergear. Si se suman colaboradores, esto se revisa y sube a 1 aprobación real (detalle completo en [ci-cd-pipeline.md](./ci-cd-pipeline.md#nota-sobre-aprobaciones-0-en-vez-de-1)).

---

## Estructura del proyecto

```text
src/
├── app/
├── shared/
├── features/
└── tests/
```

### app

Contiene la configuración global de la aplicación.

```text
app/
  providers/
  router/
  store/
  styles/
```

### shared

Contiene código reutilizable entre múltiples features.

```text
shared/
  components/
  hooks/
  utils/
  types/
  services/
  lib/
```

### features

Contiene toda la lógica funcional del dominio.

```text
features/
  incidents/
  vehicles/
  zones/
  map/
  filters/
```

---

## Estructura interna de una feature

```text
features/
  incidents/
    api/
    components/
    hooks/
    schemas/
    store/
    types/
    pages/
```

No todos los directorios son obligatorios. Cada feature define únicamente aquellos que necesite.

---

## Estado global y data-fetching

Patrón ya establecido e implementado (ver [component-test-vehicles-table.md](./component-test-vehicles-table.md)), formalizado aquí para que sea explícito y consistente en toda feature nueva.

### Librerías

| Responsabilidad | Librería | Motivo |
|---|---|---|
| Data-fetching / cache de servidor | `@tanstack/react-query` | Maneja loading/error/cache/revalidación; no se reimplementa a mano |
| Estado de cliente (UI, dominio derivado) | `zustand` | Store mínimo, tipado, sin boilerplate de Context/Redux |
| Tablas | `@tanstack/react-table` | Ya en uso para `VehiclesTable`; headless, se combina con Radix para estilos |

Ambas ya están declaradas en `client/package.json`; no se agregan alternativas (p. ej. Redux, SWR, RTK Query) para no duplicar responsabilidad.

### Patrón: query hidrata store

1. Un hook de **query** (`api/` de la feature, p. ej. `useVehiclesQuery`) usa `useQuery` de TanStack Query para pedir datos al backend (`queryKey`, `queryFn`).
2. En `useEffect`, cuando `query.data` cambia, se llama al setter del store (p. ej. `setVehicles`) para **hidratar** el store de Zustand.
3. El **store de Zustand es la fuente de verdad** para los componentes de UI: leen y mutan contra el store (ej. `updatePlate`), no directamente contra el resultado de la query.
4. `query.isLoading` / `query.isError` sí se consumen directamente desde los componentes (para skeletons/estados de error) — no se duplican en el store.

Esto separa dos responsabilidades distintas: TanStack Query gestiona el ciclo de vida de la petición (fetch, retry, cache), Zustand gestiona el estado derivado que la UI edita localmente (ej. edición inline de una patente) sin volver a pegarle al backend en cada tecla.

### Dónde vive cada store

- **`app/store/`** — estado global cruzado entre features (ej. filtros que afectan simultáneamente a `map` y a una tabla, selección de zona activa). Debe ser la excepción, no la regla: si un estado sólo lo usa una feature, vive en esa feature.
- **`features/<feature>/store/`** — estado propio de la feature (ej. `features/vehicles/store/useVehiclesStore.ts`). Es el caso por defecto.
- **`features/<feature>/api/`** — hooks de query/mutation de esa feature (ej. `useVehiclesQuery.ts`) y las funciones `fetch*` que llaman al backend.

Regla de dependencia: igual que el resto de la feature, un store de `features/vehicles` no se importa desde `features/incidents`. Si dos features necesitan el mismo slice de estado, ese estado se promueve a `app/store/` (estado realmente global) o el dato compartido se extrae a `shared/` si es lógica sin estado (ver [Regla para shared](#regla-para-shared)).

---

## Estrategia de testing

Las pruebas deben vivir próximas a la implementación. Se prioriza el enfoque de co-localización.

Ejemplo:

```text
IncidentCard.tsx
IncidentCard.test.tsx
useIncidents.ts
useIncidents.test.ts
severityColor.ts
severityColor.test.ts
```

Ventajas:

- Mantenimiento más sencillo
- Refactorizaciones más seguras
- Mejor descubrimiento del código
- Features autocontenidas

Los tests globales del proyecto permanecen en:

```text
tests/
  e2e/
  integration/
  fixtures/
```

---

## Regla para shared

Un módulo pasa a `shared` únicamente cuando es utilizado por al menos dos features.

Ejemplos:

```text
shared/components/Button
shared/hooks/useDebounce
shared/utils/dateFormatter
shared/types/Pagination
```

---

## Reglas de dependencia

Una feature puede importar desde:

```text
shared/
app/
```

Debe evitar depender directamente de otra feature.

Incorrecto:

```text
features/incidents
  ↓
features/vehicles
```

Correcto:

```text
features/incidents
  ↓
shared/
```

---

## Flujo de desarrollo

```text
Requerimiento
  ↓
Feature branch
  ↓
Implementación
  ↓
Tests
  ↓
Commit
  ↓
Pull Request
  ↓
CI
  ↓
Review
  ↓
Merge
```

---

## Quality Gates

El pipeline de integración continua valida únicamente `client` (`api` queda completamente excluida — no se toca, ver [ci-cd-pipeline.md](./ci-cd-pipeline.md)). Los scripts de la raíz (`pnpm lint`, etc.) delegan con `--filter client`.

Ejecuta:

```text
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm coverage
pnpm build
```

Cobertura mínima requerida:

```text
Statements ≥ 80%
Functions  ≥ 80%
Branches   ≥ 80%
Lines      ≥ 80%
```

Cualquier fallo bloquea el merge hacia `main`.

---

## Convenciones

Una feature equivale a:

- Una capacidad funcional entregable
- Una rama de trabajo
- Uno o varios commits atómicos
- Un Pull Request

Ejemplo:

Feature:

```text
Renderizar incidentes sobre el mapa
```

Rama:

```text
feat/incidents-map
```

Commits:

```text
feat(incidents): create types
feat(incidents): implement api
feat(incidents): render markers
test(incidents): add tests
```

Pull Request:

```text
feat/incidents-map → main
```
