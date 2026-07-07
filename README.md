# Urbetrack — Desafío Técnico Frontend

Sistema de gestión de higiene urbana: mapa interactivo con activos (contenedores, cestos, bancos), incidentes y vehículos de recolección, distribuidos en 5 zonas de CABA (Microcentro, Palermo, Recoleta, Belgrano, Caballito). Incluye mapa de calor de incidentes, tablas filtrables con paginación, modal de detalle/edición de vehículos y un motor de asignación automática de vehículos a incidentes según reglas de compatibilidad, zona y capacidad.

## Stack

**Frontend** (`client/`): React 18 + TypeScript, Vite, Zustand (estado global), TanStack Query + TanStack Router + TanStack Table, Radix UI Themes, React-Leaflet + leaflet.heat (mapa y mapa de calor), Zod (validación), Vitest + Testing Library (tests).

**Backend mock** (`api/`): Express + TypeScript, Zod, Swagger UI (documentación interactiva autogenerada). Provisto por la organización, fuera de alcance del equipo: no se modifica.

Monorepo gestionado con **pnpm workspaces**.

## Instalación

**Requisitos previos:** Node 22 y pnpm 9.15.9 instalados.

1. Clonar el repositorio ([`fermatiasdv/urbetrack-challenge`](https://github.com/fermatiasdv/urbetrack-challenge)) y ubicarse en la carpeta del proyecto.
2. Instalar todas las dependencias del monorepo (`api` + `client`) con un único comando desde la raíz:
   ```bash
   pnpm install
   ```

## Ejecución

Se necesitan **dos terminales** (API y cliente corren por separado):

```bash
pnpm dev:api      # terminal 1 — backend mock en http://localhost:3000 (Swagger en /api-docs)
pnpm dev:client   # terminal 2 — frontend en http://localhost:5173
```

Con ambos corriendo, abrir `http://localhost:5173` en el navegador.

## Scripts principales

Todos se ejecutan desde la raíz del monorepo.

| Script | Descripción |
|---|---|
| `pnpm install` | Instala dependencias de `api` y `client` |
| `pnpm dev:api` | Levanta el backend mock (modo desarrollo) |
| `pnpm dev:client` | Levanta el frontend (modo desarrollo) |
| `pnpm build` | Build de producción del cliente |
| `pnpm lint` | ESLint sobre `client` |
| `pnpm format:check` | Verifica formato con Prettier |
| `pnpm typecheck` | Chequeo de tipos (`tsc -b`) |
| `pnpm test` | Corre la suite de tests (Vitest) |
| `pnpm coverage` | Tests + reporte de cobertura (mínimo 80%) |

## Arquitectura del frontend

`client/src` sigue una arquitectura orientada a funcionalidades (Feature-Sliced):

```
src/
├── app/        # configuración global: router, layout, providers, estilos
├── shared/     # código reutilizado por 2+ features: componentes, tipos, utils, servicios
├── features/   # lógica de negocio por dominio: vehicles, assets, incidents, map
└── tests/      # fixtures e integración
```

Principios clave: alta cohesión y bajo acoplamiento por feature, tipado de dominio centralizado en `shared/types/domain.types.ts` como única fuente de verdad, y código compartido que solo se extrae cuando lo usa más de una feature. Detalle completo en [`docs/specs/architecture.md`](./docs/specs/architecture.md).

## Persistencia de datos (ABM) y estado global

El mock de backend (`api/`) sólo expone `GET` para las 4 entidades y `POST` para vehículos, activos e incidentes — **no expone `PUT`, `PATCH` ni `DELETE` para ninguna entidad**. Esto no limita las capacidades de alta, edición y borrado del frontend: todas están implementadas igual, pero con distinto punto de persistencia según lo que el backend permite:

- **Alta ("Agregar X"):** llama al `POST` real del backend (sí existe) y, con la respuesta (incluido el `id` generado por el mock), agrega el registro al estado global.
- **Edición y eliminación:** como el backend no tiene endpoint para eso, la operación se resuelve **enteramente contra el estado global de la aplicación**, sin ninguna llamada de red. Se considera exitosa en el momento en que el store se actualiza correctamente (con su mensaje de éxito/error correspondiente en el modal).

En los tres casos, `zustand` es la **fuente única de verdad**: React Query trae los datos del backend una única vez por sesión (hidrata el store la primera vez), y de ahí en adelante toda mutación (alta, edición de placa/estado, borrado) se aplica sobre ese store centralizado. Mapa, tablas, filtros y modales están todos suscriptos al mismo store, así que cualquier cambio se refleja de inmediato en toda la app y **persiste durante la sesión** (no se pierde al navegar entre pantallas ni si React Query vuelve a resolver la query en segundo plano). Detalle completo en [`docs/specs/architecture.md`](./docs/specs/architecture.md#estado-global-cliente) y en el spec de alta/paginación [`docs/feature/09-pagination-and-create-modal.md`](./docs/feature/09-pagination-and-create-modal.md).

## CI/CD

- **CI** (`.github/workflows/ci.yml`): en cada push/PR corre validación de nombre de rama, lint, formato (Prettier), tipado, tests y cobertura (mínimo 80% statements/branches/functions/lines) y build. Cualquier falla bloquea el merge.
- **CD** (`.github/workflows/cd.yml`): al mergear a `main`, build automático del cliente y despliegue a GitHub Pages.
- **Ramas:** prefijo obligatorio `feat/`, `fix/`, `chore/`, `docs/`, `test/` o `refactor/`, validado en CI.
- **`main` protegida:** push directo bloqueado, merge solo vía Pull Request con checks en verde.

Detalle completo en [`docs/specs/ci-cd-pipeline.md`](./docs/specs/ci-cd-pipeline.md) y [`docs/specs/cd-pipeline.md`](./docs/specs/cd-pipeline.md).

## Metodología de trabajo

Ningún desarrollo se implementa sin spec previamente aprobado. Cada cambio primero documenta (o actualiza) su spec en `docs/`, luego se implementa. Specs organizados por tipo:

- `docs/specs/` — specs técnicos transversales (arquitectura, CI/CD, Swagger, derivación de zonas, tests de componentes)
- `docs/feature/` — historias de funcionalidad (sidebar, tablas, filtros, modales, páginas de vehículos/activos/incidentes, mapa, motor de asignación)
- `docs/chore/` — tareas de mantenimiento (gitignore, tokens visuales, router, migración de tipos)
- `docs/fix/` — correcciones puntuales (cobertura, formato, CI)

El scope funcional completo (reglas de negocio, modelo de dominio, criterios de aceptación) está documentado en [`docs/scope.md`](./docs/scope.md), con una versión verificada y consolidada contra el backend real en [`docs/verified-scope.md`](./docs/verified-scope.md).

## Backlog (historias de usuario)

El backlog vive en GitHub Projects: [Urbetrack — Project](https://github.com/users/fermatiasdv/projects/1/views/1). El detalle técnico de cada historia ya implementada está documentado en [`docs/feature/`](./docs/feature/).

## API mock

Documentación completa de endpoints en [`API.md`](./API.md) y [`docs/METHODS.md`](./docs/METHODS.md), o vía Swagger UI (`pnpm dev:api`, luego `http://localhost:3000/api-docs`). Recursos: `zones`, `vehicles`, `assets`, `incidents` (todos con `GET` y búsqueda por `:id`; el mock no expone `POST` de zonas ni `PUT`/`PATCH`/`DELETE` en ninguna entidad).

## Autor

Fernando del Valle — [github.com/fermatiasdv](https://github.com/fermatiasdv)
