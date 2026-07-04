# METHODS.md — Backend (mock API)

Documentación de los métodos implementados en el backend mock (`src/`) del proyecto: qué función cumple cada uno y cómo interactúan entre sí.

## Arquitectura general

El backend es una API REST mock construida con **Express**, pensada para servir de fuente de datos al frontend mientras no exista un backend real. Sigue el flujo clásico:

```
request → routes → controller → schema (validación, solo en POST) → data store (en memoria) → response
```

- **`app.ts`**: crea la instancia de Express, registra los middlewares globales (`cors`, `express.json`) y monta los cuatro routers bajo sus prefijos (`/assets`, `/zones`, `/incidents`, `/vehicles`).
- **`server.ts`**: punto de entrada del proceso. Importa `app` y lo pone a escuchar en el puerto `3000`.
- **`types/index.ts`**: define los tipos de dominio (`UrbanAsset`, `Zone`, `Incident`, `Vehicle`) y sus enums de estado/tipo. Es la fuente de verdad de tipado que comparten controllers, schemas y data.
- **`data/`**: actúa como "base de datos" en memoria (arrays exportados con `let`, mutados directamente por los controllers).
- **`schemas/`**: validación de payloads de entrada con `zod`, uno por entidad.
- **`utils/geo.ts`**: utilidades geográficas usadas para generar datos mock.

No hay capa de persistencia real: los datos viven en memoria del proceso y se reinician con cada reinicio del servidor.

---

## Rutas y métodos por entidad

### Assets (`/assets`)

| Método HTTP | Ruta | Controller | Descripción |
|---|---|---|---|
| GET | `/assets` | `getAssets` | Lista assets urbanos (tachos, contenedores, bancos), filtrable por `status` y `type` (query params). |
| POST | `/assets` | `createAsset` | Crea un nuevo asset. Valida el body contra `assetSchema`. |

**`getAssets(req, res)`**
Lee `assets` desde `data/mock.ts` y aplica filtros opcionales por `status` y `type` (query string). Si no se pasan filtros, devuelve el array completo. Responde el resultado como JSON.

**`createAsset(req, res)`**
Valida `req.body` con `assetSchema.safeParse`. Si falla, responde `400` con el detalle del error de `zod`. Si es válido, genera un `id` (`Date.now().toString()`), arma el objeto completo, lo agrega (`push`) al array `assets` en memoria y responde `201` con el nuevo asset.

### Zones (`/zones`)

| Método HTTP | Ruta | Controller | Descripción |
|---|---|---|---|
| GET | `/zones` | `getZones` | Lista todas las zonas. |
| GET | `/zones/:id` | `getZoneById` | Devuelve una zona puntual por `id`. |

**`getZones(req, res)`**
Devuelve el array `zones` completo (`data/zones.ts`) sin filtros. No hay endpoint de creación: las zonas son datos fijos de referencia (Microcentro, Palermo, Recoleta, Belgrano, Caballito) usados por las demás entidades vía `zoneId`.

**`getZoneById(req, res)`**
Busca en `zones` por `id` (`req.params.id`). Si no existe, responde `404` con `{ message: 'Zone not found' }`; si existe, la devuelve.

Nota: `zone.schema.ts` define `zoneSchema` (solo `name: string`) pero actualmente ningún controller de zonas lo usa — no existe `POST /zones`.

### Incidents (`/incidents`)

| Método HTTP | Ruta | Controller | Descripción |
|---|---|---|---|
| GET | `/incidents` | `getIncidents` | Lista incidentes, filtrable por `status`, `type` y `zoneId`. |
| GET | `/incidents/:id` | `getIncidentById` | Devuelve un incidente puntual por `id`. |
| POST | `/incidents` | `createIncident` | Crea un nuevo incidente. Valida el body contra `incidentSchema`. |

**`getIncidents(req, res)`**
Lee `incidents` (`data/incidents.ts`, dataset fijo de 40 registros) y filtra opcionalmente por `status`, `type` y `zoneId` (query params combinables).

**`getIncidentById(req, res)`**
Busca por `id`; `404` si no existe, si no devuelve el incidente.

**`createIncident(req, res)`**
Valida con `incidentSchema` (`status` tiene default `'REPORTED'` si no se envía). Si falla, `400` con el error de `zod`. Si pasa, genera `id` y `createdAt` (timestamp ISO actual), agrega el incidente a `incidents` y responde `201`.

### Vehicles (`/vehicles`)

| Método HTTP | Ruta | Controller | Descripción |
|---|---|---|---|
| GET | `/vehicles` | `getVehicles` | Lista vehículos, filtrable por `status`, `type` y `zoneId`. |
| GET | `/vehicles/:id` | `getVehicleById` | Devuelve un vehículo puntual por `id`. |
| POST | `/vehicles` | `createVehicle` | Crea un nuevo vehículo. Valida el body contra `vehicleSchema`. |

**`getVehicles(req, res)`**
Lee `vehicles` (`data/vehicles.ts`, dataset fijo de 10 registros) y filtra opcionalmente por `status`, `type` y `zoneId`.

**`getVehicleById(req, res)`**
Busca por `id`; `404` si no existe, si no lo devuelve.

**`createVehicle(req, res)`**
Valida con `vehicleSchema` (`status` default `'ACTIVE'`, `capacity` debe ser positivo). Si falla, `400`. Si pasa, genera `id`, agrega a `vehicles` y responde `201`.

---

## Generación de datos mock

**`utils/geo.ts` → `randomCoord()`**
Devuelve una coordenada `{ lat, lng }` aleatoria dentro de `BA_BOUNDS` (bounding box aproximado de Buenos Aires). Es una utilidad pura, sin dependencias de otros módulos del backend.

**`data/seed.ts` → `generateAssets(count = 1000)`**
Genera un array de `count` `UrbanAsset` sintéticos usando:
- `randomCoord()` (de `utils/geo.ts`) para `lat`/`lng`.
- `faker` para `type` (aleatorio entre `BIN`/`CONTAINER`/`BENCH`) y `address`.
- `weightedStatus()` (función interna del mismo archivo) para el `status`, con distribución ponderada: 70% `OK`, 15% `FULL`, 10% `DAMAGED`, 5% `OUT_OF_SERVICE`.
- `zones` (de `data/zones.ts`) para asignar un `zoneId` aleatorio a cada asset.

**`data/mock.ts`**
Ejecuta `generateAssets(1500)` una única vez al importarse el módulo y exporta el resultado como `assets`. Este array es el que consumen `getAssets` y `createAsset`.

---

## Cómo interactúan los módulos entre sí

1. **`server.ts` → `app.ts`**: el entry point levanta la app Express configurada en `app.ts`.
2. **`app.ts` → `routes/*.routes.ts`**: cada router se monta bajo su prefijo y delega el manejo de cada verbo HTTP a las funciones exportadas por su controller correspondiente.
3. **`routes/*.routes.ts` → `controllers/*.controller.ts`**: los routers son finos, solo mapean método+path a una función controller, sin lógica propia.
4. **`controllers/*.controller.ts` → `schemas/*.schema.ts`**: en cada `create*`, el controller valida `req.body` con el schema `zod` de su entidad antes de tocar el data store. Ningún endpoint `GET` pasa por schemas.
5. **`controllers/*.controller.ts` → `data/*.ts`**: los controllers leen y mutan directamente los arrays exportados desde `data/` (no hay capa de repositorio intermedia). Las escrituras (`push`) son las únicas mutaciones; no hay `update` ni `delete` implementados para ninguna entidad.
6. **`data/mock.ts` → `data/seed.ts` → `utils/geo.ts`** y **`data/zones.ts`**: la generación de assets encadena estas dependencias solo al arrancar el proceso (no hay regeneración en caliente).
7. **`types/index.ts`** es transversal: `data/*.ts` tipa sus arrays con las interfaces de dominio, y los controllers reciben/devuelven esos mismos tipos vía `express.Request`/`Response`, manteniendo consistencia end-to-end entre lo que valida `zod`, lo que se guarda y lo que se responde al frontend.

## Limitaciones conocidas del mock actual

- No hay endpoints `PUT`/`PATCH`/`DELETE` para ninguna entidad: no se puede actualizar ni borrar assets, incidentes, vehículos ni zonas.
- `zoneSchema` existe pero no se usa (no hay creación de zonas).
- No hay validación de que `zoneId` referencie una zona existente al crear assets, incidentes o vehículos.
- Los datos de `assets` viven en memoria y se regeneran (aleatoriamente) en cada reinicio del proceso; `incidents` y `vehicles` son fixtures estáticos que solo crecen en memoria durante la vida del proceso.
