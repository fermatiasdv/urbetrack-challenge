# SPEC — Generar `README.md` de raíz

**Estado:** Aprobado — implementado
**Fecha:** 2026-07-06
**Relacionado:** `docs/scope.md`, `docs/verified-scope.md`, `docs/specs/architecture.md`,
`docs/specs/ci-cd-pipeline.md`, `docs/specs/cd-pipeline.md`, `docs/feature/09-pagination-and-create-modal.md`,
`API.md`, `docs/METHODS.md`

## Diagnóstico

El repositorio no tiene `README.md` en la raíz. Quien clona el proyecto no tiene, sin ir a `docs/`,
un punto de entrada único que explique qué es el proyecto, cómo instalarlo y correrlo, qué stack
usa, cómo está organizado el frontend, cómo funciona CI/CD, dónde vive el backlog y cuál es la
metodología de trabajo (spec-first). Esta información ya existe, pero está repartida entre
`docs/scope.md`, `docs/verified-scope.md`, `docs/specs/*.md`, `API.md` y `docs/METHODS.md`.

## Cambio propuesto

Crear `README.md` en la raíz del repositorio, con las siguientes secciones:

1. **Encabezado + descripción** — qué hace el sistema (mapa, activos, incidentes, vehículos, zonas
   de CABA, heatmap, motor de asignación) y link a la demo desplegada
   (`https://fermatiasdv.github.io/urbetrack-challenge/`).
2. **Stack** — frontend (`client/`) y backend mock (`api/`), aclarando que `api` es provisto por la
   organización y no se modifica (ver [architecture.md](../specs/architecture.md)).
3. **Instalación** — requisitos (Node 22, pnpm 9.15.9), link al repositorio
   (`https://github.com/fermatiasdv/urbetrack-challenge`) y paso único `pnpm install` (monorepo
   pnpm workspaces).
4. **Ejecución** — dos terminales (`pnpm dev:api`, `pnpm dev:client`), puertos y URL local.
5. **Scripts principales** — tabla con los scripts de la raíz (`dev:api`, `dev:client`, `build`,
   `lint`, `format:check`, `typecheck`, `test`, `coverage`).
6. **Arquitectura del frontend** — resumen de `app/`, `shared/`, `features/`, `tests/` con link a
   [architecture.md](../specs/architecture.md).
7. **Persistencia de datos (ABM) y estado global** — aclarar que el backend mock sólo expone `GET`
   (todas las entidades) y `POST` (vehículos, activos, incidentes), sin `PUT`/`PATCH`/`DELETE`; que
   el alta sí llama al backend real; que edición y borrado se resuelven enteramente contra el store
   global (`zustand`), que hidrata una única vez desde React Query y es la fuente única de verdad
   para mapa, tablas, filtros y modales — con link a
   [architecture.md](../specs/architecture.md#estado-global-cliente) y
   [feature 09](../feature/09-pagination-and-create-modal.md). Este punto se agrega explícitamente
   porque es una característica del proyecto que no queda evidente si sólo se lee el nombre del
   stack o la estructura de carpetas.
8. **CI/CD** — resumen de `ci.yml` (validación de rama, lint, formato, tipado, test, cobertura
   ≥80%, build) y `cd.yml` (deploy a GitHub Pages en push a `main`), con link a
   [ci-cd-pipeline.md](../specs/ci-cd-pipeline.md) y [cd-pipeline.md](../specs/cd-pipeline.md).
9. **Metodología de trabajo** — spec-first (ningún desarrollo sin spec aprobado), organización de
   `docs/` (`specs/`, `feature/`, `chore/`, `fix/`), link a `docs/scope.md` y
   `docs/verified-scope.md`.
10. **Backlog** — no se documenta como tabla en el README (el backlog vive fuera del repo): un
    párrafo con link al tablero de GitHub Projects
    (`https://github.com/users/fermatiasdv/projects/1/views/1`) y referencia a `docs/feature/` para
    el detalle técnico de cada historia ya implementada.
11. **API mock** — link a `API.md`, `docs/METHODS.md` y Swagger UI (`pnpm dev:api` →
    `localhost:3000/api-docs`), resumen de recursos y limitaciones conocidas (sin `POST /zones`,
    sin `PUT`/`PATCH`/`DELETE`).

Fuera de alcance: no se crean README adicionales por feature ni se modifica ningún README existente
dentro de `client/src/**` (ya cumplen otro propósito, documentación interna de carpeta).

## Verificación post-implementación

1. `README.md` existe en la raíz del repositorio.
2. Contiene las 11 secciones listadas arriba, en ese orden.
3. Todos los links relativos (`docs/...`, `API.md`) resuelven a archivos existentes en el repo.
4. El link a la demo, al repositorio y al tablero de GitHub Projects son URLs completas y correctas.
5. No incluye contenido de `docs/scope.md` duplicado línea por línea — sólo resumen con links a la
   fuente completa.

## Estado de implementación

- ✅ `README.md` creado en la raíz del repositorio con las 11 secciones descriptas arriba.
