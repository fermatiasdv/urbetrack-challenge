# SPEC — Integración de Swagger / OpenAPI

**Estado:** Aprobado
**Fecha:** 2026-07-04

## Objetivo

Exponer una UI interactiva (Swagger UI) que permita verificar en tiempo real el estado y contrato de los endpoints actualmente mockeados (`/assets`, `/zones`, `/incidents`, `/vehicles`), sin duplicar la definición de tipos ya existente.

## Enfoque

Generar el documento OpenAPI a partir de los schemas `zod` ya existentes en `src/schemas/*.ts`, usando `@asteasolutions/zod-to-openapi`. Los schemas de validación actuales **no se modifican**: se crean variantes anotadas (extend + metadata `.openapi()`) en una capa de documentación separada, para no acoplar la validación de negocio con la documentación.

Swagger UI se sirve en `/api-docs`.

## Paquetes nuevos

| Paquete | Tipo | Motivo |
|---|---|---|
| `@asteasolutions/zod-to-openapi` | dependency | Genera el documento OpenAPI 3 a partir de schemas zod |
| `swagger-ui-express` | dependency | Sirve la UI de Swagger |
| `@types/swagger-ui-express` | devDependency | Tipado (proyecto fuertemente tipado) |
| `@types/cors` | devDependency | Faltaba en el proyecto original; `tsc --strict` fallaba (`TS7016`) al no tener tipos para `cors`, ya usado en `app.ts`. Se agrega para que `pnpm build` compile sin `any` implícitos. |

Instalación con `pnpm add` / `pnpm add -D`.

Nota de compatibilidad: `@asteasolutions/zod-to-openapi` se fija en `7.3.4` (no la última, `8.x`) porque la v8 requiere Zod v4; este proyecto usa Zod v3 (`^3.23.8`).

## Archivos nuevos

- **`src/docs/zod-setup.ts`** — llama una única vez a `extendZodWithOpenApi(z)`. Se importa antes que cualquier otro módulo de `docs/` para aplicar el patch a zod.
- **`src/docs/schemas.ts`** — define variantes "de respuesta" de cada schema existente, agregando los campos generados por el backend (`id`, `createdAt` donde aplique) y metadata (`.openapi('Nombre')`, ejemplos):
  - `assetResponseSchema` = `assetSchema.extend({ id })` → `Asset`
  - `zoneResponseSchema` = `zoneSchema.extend({ id })` → `Zone`
  - `incidentResponseSchema` = `incidentSchema.extend({ id, createdAt })` → `Incident`
  - `vehicleResponseSchema` = `vehicleSchema.extend({ id })` → `Vehicle`
  - `notFoundSchema` = `{ message: string }` → `NotFoundError`
  - `validationErrorSchema` = `{ issues: any[], name: 'ZodError' }` → `ValidationError`
- **`src/docs/registry.ts`** — crea un `OpenAPIRegistry`, registra los schemas de arriba como componentes y registra cada path/método existente (uno por cada fila de las tablas en `API.md`), incluyendo query params, path params, request body y responses (200/201/400/404) tal como están documentados hoy.
- **`src/docs/openapi.ts`** — genera el documento final (`OpenApiGeneratorV3`) con `info` (title: "Urban Hygiene API", version del `package.json`, descripción indicando que es un mock) y `servers` (`http://localhost:3000`). Exporta `openApiDocument`.

## Archivos modificados

- **`src/app.ts`** — importa `swagger-ui-express` y `openApiDocument`, monta:
  ```ts
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
  ```
- **`package.json`** — nuevas dependencias.
- **`pnpm-workspace.yaml`** — `swagger-ui-express` trae `@scarf/scarf` (script de telemetría, transitivo vía `swagger-ui-dist`) como build script no aprobado. Se fija `allowBuilds: { '@scarf/scarf': false }` para denegarlo explícitamente; si no se resuelve, `pnpm run <script>` falla porque pnpm re-verifica el estado de builds pendientes en cada `run`.
- **`API.md`** — se agrega una línea al inicio indicando que la documentación interactiva está disponible en `/api-docs`.

## Endpoints a documentar (alcance completo, según `API.md` / `docs/METHODS.md`)

| Método | Ruta | Request | Responses |
|---|---|---|---|
| GET | `/assets` | query: `status?`, `type?` | 200: `Asset[]` |
| POST | `/assets` | body: `assetSchema` | 201: `Asset`, 400: `ValidationError` |
| GET | `/zones` | — | 200: `Zone[]` |
| GET | `/zones/:id` | path: `id` | 200: `Zone`, 404: `NotFoundError` |
| GET | `/incidents` | query: `status?`, `type?`, `zoneId?` | 200: `Incident[]` |
| GET | `/incidents/:id` | path: `id` | 200: `Incident`, 404: `NotFoundError` |
| POST | `/incidents` | body: `incidentSchema` | 201: `Incident`, 400: `ValidationError` |
| GET | `/vehicles` | query: `status?`, `type?`, `zoneId?` | 200: `Vehicle[]` |
| GET | `/vehicles/:id` | path: `id` | 200: `Vehicle`, 404: `NotFoundError` |
| POST | `/vehicles` | body: `vehicleSchema` | 201: `Vehicle`, 400: `ValidationError` |

No se agrega ningún endpoint nuevo ni se cambia comportamiento de los controllers existentes: este spec es puramente de documentación.

## Verificación post-implementación

1. `pnpm install` — instala las nuevas dependencias.
2. `pnpm build` (`tsc`) — el proyecto sigue tipando en modo `strict` sin errores.
3. `pnpm dev` — levantar el servidor y verificar:
   - `GET http://localhost:3000/api-docs` devuelve la UI de Swagger.
   - Los 10 endpoints de la tabla aparecen documentados con schemas correctos.
   - Probar un endpoint real desde la UI ("Try it out") contra el mock y confirmar que la respuesta coincide con el schema documentado.

## Fuera de alcance

- No se agregan endpoints `PUT`/`PATCH`/`DELETE` (no existen hoy).
- No se valida `zoneId` contra zonas existentes (limitación ya conocida, ver `docs/METHODS.md`).
- No se generan clientes ni SDKs a partir del spec.
