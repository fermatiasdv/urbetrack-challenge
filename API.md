# Urban Hygiene API

Base URL: `http://localhost:3000`

---

## Assets

### GET /assets

Lista todos los assets urbanos. Soporta filtrado por query params.

**Query Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `status` | string | Filtra por status: `OK`, `DAMAGED`, `FULL`, `OUT_OF_SERVICE` |
| `type` | string | Filtra por tipo: `BIN`, `CONTAINER`, `BENCH` |

**Ejemplo:**
```
GET /assets?status=OK&type=BIN
```

**Response 200:**
```json
[
  {
    "id": "1719123456789",
    "type": "BIN",
    "status": "OK",
    "lat": -34.6037,
    "lng": -58.3816,
    "address": "Av. Corrientes 1234",
    "zoneId": "1"
  }
]
```

---

### POST /assets

Crea un nuevo asset urbano.

**Body:**
```json
{
  "type": "BIN",
  "status": "OK",
  "lat": -34.6037,
  "lng": -58.3816,
  "address": "Av. Corrientes 1234",
  "zoneId": "1"
}
```

| Campo | Tipo | Requerido | Valores |
|-------|------|-----------|---------|
| `type` | string | Sí | `BIN`, `CONTAINER`, `BENCH` |
| `status` | string | Sí | `OK`, `DAMAGED`, `FULL`, `OUT_OF_SERVICE` |
| `lat` | number | Sí | Latitud |
| `lng` | number | Sí | Longitud |
| `address` | string | Sí | Dirección |
| `zoneId` | string | Sí | ID de la zona |

**Response 201:**
```json
{
  "id": "1719123456789",
  "type": "BIN",
  "status": "OK",
  "lat": -34.6037,
  "lng": -58.3816,
  "address": "Av. Corrientes 1234",
  "zoneId": "1"
}
```

**Response 400 (validación fallida):**
```json
{
  "issues": [...],
  "name": "ZodError"
}
```

---

## Zones

### GET /zones

Lista todas las zonas disponibles.

**Response 200:**
```json
[
  { "id": "1", "name": "Microcentro" },
  { "id": "2", "name": "Palermo" },
  { "id": "3", "name": "Recoleta" },
  { "id": "4", "name": "Belgrano" },
  { "id": "5", "name": "Caballito" }
]
```

---

### GET /zones/:id

Obtiene una zona por su ID.

**Path Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID de la zona |

**Ejemplo:**
```
GET /zones/1
```

**Response 200:**
```json
{ "id": "1", "name": "Microcentro" }
```

**Response 404:**
```json
{ "message": "Zone not found" }
```

---

## Incidents

### GET /incidents

Lista todos los incidentes. Soporta filtrado por query params.

**Query Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `status` | string | Filtra por status: `REPORTED`, `IN_PROGRESS`, `RESOLVED` |
| `type` | string | Filtra por tipo: `OVERFLOW`, `DAMAGE`, `LITTERING`, `OTHER` |
| `zoneId` | string | Filtra por ID de zona |

**Ejemplo:**
```
GET /incidents?status=REPORTED&type=OVERFLOW
```

**Response 200:**
```json
[
  {
    "id": "1",
    "type": "OVERFLOW",
    "status": "REPORTED",
    "description": "Contenedor desbordado en Av. Corrientes",
    "lat": -34.6037,
    "lng": -58.3816,
    "zoneId": "1",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### GET /incidents/:id

Obtiene un incidente por su ID.

**Path Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID del incidente |

**Ejemplo:**
```
GET /incidents/1
```

**Response 200:**
```json
{
  "id": "1",
  "type": "OVERFLOW",
  "status": "REPORTED",
  "description": "Contenedor desbordado en Av. Corrientes",
  "lat": -34.6037,
  "lng": -58.3816,
  "zoneId": "1",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Response 404:**
```json
{ "message": "Incident not found" }
```

---

### POST /incidents

Crea un nuevo incidente.

**Body:**
```json
{
  "type": "OVERFLOW",
  "status": "REPORTED",
  "description": "Contenedor desbordado en Av. Corrientes",
  "lat": -34.6037,
  "lng": -58.3816,
  "zoneId": "1"
}
```

| Campo | Tipo | Requerido | Valores |
|-------|------|-----------|---------|
| `type` | string | Sí | `OVERFLOW`, `DAMAGE`, `LITTERING`, `OTHER` |
| `status` | string | No | `REPORTED`, `IN_PROGRESS`, `RESOLVED` (default: `REPORTED`) |
| `description` | string | Sí | Descripción del incidente |
| `lat` | number | Sí | Latitud |
| `lng` | number | Sí | Longitud |
| `zoneId` | string | Sí | ID de la zona |

**Response 201:**
```json
{
  "id": "1719123456789",
  "type": "OVERFLOW",
  "status": "REPORTED",
  "description": "Contenedor desbordado en Av. Corrientes",
  "lat": -34.6037,
  "lng": -58.3816,
  "zoneId": "1",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Response 400 (validación fallida):**
```json
{
  "issues": [...],
  "name": "ZodError"
}
```

---

## Vehicles

### GET /vehicles

Lista todos los vehículos. Soporta filtrado por query params.

**Query Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `status` | string | Filtra por status: `ACTIVE`, `MAINTENANCE`, `OUT_OF_SERVICE` |
| `type` | string | Filtra por tipo: `TRUCK`, `VAN`, `PICKUP` |
| `zoneId` | string | Filtra por ID de zona |

**Ejemplo:**
```
GET /vehicles?status=ACTIVE&type=TRUCK
```

**Response 200:**
```json
[
  {
    "id": "1",
    "plate": "ABC123",
    "type": "TRUCK",
    "status": "ACTIVE",
    "capacity": 5000,
    "zoneId": "1"
  }
]
```

---

### GET /vehicles/:id

Obtiene un vehículo por su ID.

**Path Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID del vehículo |

**Ejemplo:**
```
GET /vehicles/1
```

**Response 200:**
```json
{
  "id": "1",
  "plate": "ABC123",
  "type": "TRUCK",
  "status": "ACTIVE",
  "capacity": 5000,
  "zoneId": "1"
}
```

**Response 404:**
```json
{ "message": "Vehicle not found" }
```

---

### POST /vehicles

Crea un nuevo vehículo.

**Body:**
```json
{
  "plate": "ABC123",
  "type": "TRUCK",
  "status": "ACTIVE",
  "capacity": 5000,
  "zoneId": "1"
}
```

| Campo | Tipo | Requerido | Valores |
|-------|------|-----------|---------|
| `plate` | string | Sí | Patente del vehículo |
| `type` | string | Sí | `TRUCK`, `VAN`, `PICKUP` |
| `status` | string | No | `ACTIVE`, `MAINTENANCE`, `OUT_OF_SERVICE` (default: `ACTIVE`) |
| `capacity` | number | Sí | Capacidad en kg (debe ser positivo) |
| `zoneId` | string | Sí | ID de la zona |

**Response 201:**
```json
{
  "id": "1719123456789",
  "plate": "ABC123",
  "type": "TRUCK",
  "status": "ACTIVE",
  "capacity": 5000,
  "zoneId": "1"
}
```

**Response 400 (validación fallida):**
```json
{
  "issues": [...],
  "name": "ZodError"
}
```
