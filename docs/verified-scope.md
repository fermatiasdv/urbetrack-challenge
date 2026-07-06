# URBETRACK — Scope verificado

**Estado:** Verificado — 12 de 12 observaciones resueltas y aplicadas
**Fuente original:** `docs/scope.md`
**Cruzado contra:** `API.md`, `docs/METHODS.md`, `src/types/index.ts`, `src/data/*.ts`
**Fecha de verificación:** 2026-07-04

Este documento reordena y consolida el contenido de `docs/scope.md` por tema (en el original, las mismas features aparecen descriptas en más de un lugar y con datos que no siempre coinciden entre sí). Además contrasta lo escrito contra el mock real del backend (`src/`) para detectar afirmaciones que ya no son ciertas o que nunca fueron consistentes. Ninguna inconsistencia fue resuelta unilateralmente: donde el original se contradice a sí mismo o contradice al backend implementado, se deja explícito en la sección 10 y se marca en el punto del texto donde aplica con `[Ver §10.N]`.

---

## 1. Introducción

El objetivo de la funcionalidad es establecer los puntos críticos de activos urbanos dentro de cada zona, para poder determinar qué vehículos son los adecuados para atenderlos.

---

## 2. Modelo de dominio

### 2.1 Zonas

Una zona es un lugar físico del mapa donde se ubican activos, vehículos e incidentes. Hay cinco zonas fijas:

| id | name |
|----|------|
| 1 | Microcentro |
| 2 | Palermo |
| 3 | Recoleta |
| 4 | Belgrano |
| 5 | Caballito |

Confirmado contra `GET /zones`.

### 2.2 Vehículos

Un vehículo pertenece a una única zona (`zoneId`) y tiene una capacidad de carga fija según su tipo:

| Tipo | Nombre visible | Capacidad |
|------|-----------------|-----------|
| `TRUCK` | Camión | hasta 5000 kg |
| `VAN` | Furgoneta | hasta 2000 kg |
| `PICKUP` | Camioneta | hasta 1000 kg |

Estados posibles (`VehicleStatus`, valores confirmados en `src/types/index.ts`; el original usaba "MAINTENCE", que es un typo de `MAINTENANCE`):

- `ACTIVE`: activo, opera con normalidad.
- `MAINTENANCE`: en mantenimiento, no puede usarse hoy.
- `OUT_OF_SERVICE`: fuera de servicio, no puede volver a usarse.

### 2.3 Activos urbanos (assets)

Un activo tiene un tipo (`AssetType`) y un estado (`AssetStatus`). Valores canónicos confirmados en `src/types/index.ts` (el original alternaba entre "Ok/Damage/Full/Out_of_service" y "OK/DAMAGED/FULL/OUT_OF_SERVICE"; se normaliza a esta última forma, que es la que efectivamente usa el backend):

Tipos: `CONTAINER` | `BIN` (cesto/tacho, menor tamaño que un container) | `BENCH` (banco).

Estados:
- `OK`: se opera con normalidad.
- `DAMAGED`: dañado.
- `FULL`: completo.
- `OUT_OF_SERVICE`: fuera de servicio.

### 2.4 Incidentes

Cada activo puede generar incidentes que registran su estado en un momento dado.

Tipos (`IncidentType`): `OVERFLOW` | `DAMAGE` | `LITTERING` | `OTHER`.
Estados (`IncidentStatus`): `REPORTED` | `IN_PROGRESS` | `RESOLVED`.

El sistema carga 1500 activos generados aleatoriamente en las 5 zonas, y un conjunto fijo de 40 incidentes distribuidos entre esas mismas zonas (resuelto en **§10.1**; `docs/scope.md` original decía "1500 incidentes", corregido).

---

## 3. Visualización en el mapa

### 3.1 Marcadores de activos

Cada activo se representa como un marcador cuyo color depende de su estado (paleta unificada, resuelto en **§10.2**):

- `OK`: verde
- `FULL`: rojo
- `DAMAGED`: naranja
- `OUT_OF_SERVICE`: negro

### 3.2 Mapa de calor (heatmap)

- Existe un check, tildado por defecto, que activa/desactiva el mapa de calor sobre la concentración de incidentes de la zona.
- Con el mapa de calor activo aparece un cuadro (leyenda) a la derecha del mapa, fuera del área del mapa, mostrando colores y su estado equivalente (resuelto en **§10.7**): `REPORTED` azul, `IN_PROGRESS` amarillo, `RESOLVED` verde.
- El mapa de calor permite filtrar por Estado (`REPORTED` | `IN_PROGRESS` | `RESOLVED`) y por Tipo (`OVERFLOW` | `DAMAGE` | `LITTERING` | `OTHER`), pudiendo seleccionarse uno, varios o todos los valores.

### 3.3 Tooltips

Al posicionar el cursor sobre un marcador se muestra un tooltip con:

```
Tipo de incidente: <TYPE>
Estado del incidente: <STATUS>
```

Esto describe un incidente, no el activo, aunque el marcador que lo dispara está definido como el marcador de un *activo* (coloreado por `AssetStatus`, sección 3.1). Resuelto en **§10.6**: si el activo no tiene un incidente asociado, el tooltip muestra la leyenda "Estado OK." en verde. Para los incidentes (tengan o no un activo asociado) se mantiene siempre la paleta de estado de incidente definida en 3.2 (`REPORTED` azul, `IN_PROGRESS` amarillo, `RESOLVED` verde).

---

## 4. Limpieza y asociación de datos (disclaimer)

Las direcciones cargadas por el sistema incluyen valores fuera de las cinco zonas soportadas. Antes de cargar el mapa se realiza una limpieza de datos, sin tocar el backend:

1. Se filtran, al momento de cargar los datos, los puntos cuyas coordenadas no caen dentro de ninguna de las cinco zonas establecidas. La pertenencia se evalúa geométricamente contra los límites de zona definidos en el frontend, no por el campo `zoneId` del backend (**ver §10.5**). Los puntos excluidos no aparecen en mapa, tablas ni mapa de calor.
2. Las coordenadas se redondean a 4 decimales.

Adicionalmente, existe un proceso de asociación entre activos e incidentes, porque sus coordenadas no siempre coinciden exactamente:

- Si `asset.type` es `BIN` o `CONTAINER` y el incidente tiene `type = OVERFLOW`, se busca el asset más cercano dentro de un radio máximo de 100 metros.
- Si se encuentra un activo válido, el incidente adopta el `lat`/`lng` del activo asociado, y ambos se consideran el mismo punto geográfico.
- Esta relación se persiste en el estado global de la aplicación, para que mapa, filtros y tablas trabajen sobre una única fuente de datos.
- Si no se encuentra un activo compatible dentro del radio, el incidente igual se muestra en mapa y listados, marcado como incidente sin activo asociado.

Nota técnica relevante para este proceso: en el mock actual, `zoneId` se asigna a cada asset de forma aleatoria e independiente de sus coordenadas reales (`data/seed.ts`, `generateAssets`), y las coordenadas se generan dentro de todo el bounding box de Buenos Aires, no acotadas a las 5 zonas. Esto refuerza la necesidad de la limpieza descripta arriba. Resuelto en **§10.5**: la zona de cada punto se deriva de sus coordenadas (no del campo `zoneId`), y esa zona derivada es la única fuente de verdad para mapa, filtros y tablas; el `zoneId` crudo del backend no se usa para agrupar ni filtrar.

---

## 5. Asignación de vehículos a incidentes/activos

Reglas de compatibilidad por tipo de vehículo:

| Vehículo | Puede operar activos de tipo |
|----------|-------------------------------|
| `PICKUP` | `BENCH` únicamente |
| `VAN` | `BENCH` o `BIN` |
| `TRUCK` | `BENCH`, `BIN` o `CONTAINER` |

Activos en estado `OUT_OF_SERVICE` no se consideran para asignación de vehículos; los incidentes asociados a esos activos se descartan y no generan asignaciones.

Cuando existen múltiples vehículos aptos para un mismo activo, se prioriza, en este orden:

1. Que se encuentre `ACTIVE`.
2. Que pertenezca a la misma zona que el activo.
3. Que tenga la menor capacidad posible que alcance para resolver el incidente.

Adicionalmente, el documento define una prioridad entre tipos de incidente: `OVERFLOW > DAMAGE > LITTERING > OTHER`. Resuelto en **§10.3**: como la cantidad de vehículos disponibles es limitada, esta prioridad determina el orden en que se procesan los incidentes para asignarles vehículo cuando varios compiten por los mismos vehículos disponibles.

Resuelto en **§10.8**: cuando no existen vehículos disponibles para operar los incidentes de una zona, debe mostrarse una alerta no cerrable, de ancho completo, ubicada debajo del mapa y encima de las Tabs, con el texto "No hay vehículos disponibles para esta zona".

---

## 6. Listados (tablas)

### 6.1 Comportamiento general

- Se listan vehículos, activos e incidentes en tablas separadas, presentadas como tabs (ver [MUI Tabs](https://mui.com/material-ui/react-tabs/)).
- Al cambiar de tab, los filtros disponibles cambian dinámicamente según la entidad.
- Activos e incidentes muestran sus coordenadas en la tabla y en el modal. Resuelto en **§10.4**: los vehículos (que no tienen `lat`/`lng` en el modelo, solo `zoneId`) muestran en su lugar la zona por nombre (no el `zoneId`), tanto en la tabla como en el modal.
- Orden disponible: por identificador, zona o estado. Resuelto en **§10.9**: para vehículos, el orden por "identificador" se aplica sobre la Placa (`plate`), no sobre el `id` interno.
- Paginación de 15 registros por página.
- La totalidad de los registros se obtiene una única vez al cargar la pantalla. Filtros, búsqueda, orden y paginación se aplican localmente, sin nuevas consultas al backend.

### 6.2 Filtros por tab

**Tab "Activos":**
- Tipo: Todos | Container | Bin | Bench
- Estado: Todos | OK | DAMAGED | FULL | OUT_OF_SERVICE
- Zonas: una, varias o todas, entre las 5 zonas

**Tab "Vehículos":**
- Búsqueda por placa
- Capacidad: Todos | Hasta 1000kg | Entre 1001kg y 2000kg | Más de 2000kg
- Tipo: Todos | Camión | Furgoneta | Camioneta (se agrega "Furgoneta", que faltaba en el original — resuelto en **§10.10**)
- Estado: Todos | Activos | En Mantenimiento | Fuera de servicio
- Zonas: una, varias o todas

**Tab "Incidentes":**
- Tipo: Todos | OVERFLOW | DAMAGE | LITTERING | OTHER
- Estado: Todos | REPORTED | IN_PROGRESS | RESOLVED
- Zonas: una, varias o todas
- Búsqueda por identificador

Nota sobre el filtro por zona (resuelto en **§10.5**): para activos e incidentes, la zona filtrada es la **zona derivada de las coordenadas**, no el campo `zoneId` del backend, de modo que tabla y mapa siempre coincidan. Los vehículos no tienen coordenadas en el modelo (solo `zoneId`), por lo que su filtro por zona se resuelve por `zoneId` traducido a nombre (§10.4); esa zona no está sujeta a la derivación geográfica.

---

## 7. Modales de detalle y edición

Al seleccionar un registro se abre un modal con el detalle. El contenido varía según la entidad.

### 7.1 Vehículos

```
<TYPE> (<PLATE>) — círculo de estado: ACTIVE (verde), MAINTENANCE (amarillo), OUT_OF_SERVICE (rojo)
Capacidad: XXXX KG
ZONA: <ZONE>  (nombre de la zona, no zoneID)
[Botón "Modificar"] [Botón "Cerrar"]
```

Al hacer hover sobre el círculo de estado se muestra "En actividad", "En mantenimiento" o "Fuera de servicio" según corresponda.

Botón "Cerrar": cierra el modal sin cambios.

Botón "Modificar": pasa a modo edición — "Modificar" se convierte en "Guardar" y "Cerrar" en "Cancelar". Aparece el campo:

- **Placa**: editable, con el valor actual precargado. Debe cumplir uno de estos formatos: `AAA111` (tres letras y tres números) o `AA111AA` (dos letras, tres números, dos letras). Si no cumple el formato, se muestra un error en rojo debajo del input.

### 7.2 Activos

```
<TYPE> — círculo de estado: OK (verde), FULL (rojo), DAMAGED (naranja), OUT_OF_SERVICE (negro)
Zona: <ZONE>
Latitud: <LAT>
Longitud: <LNG>
[Botón "Cerrar"]
```

Solo lectura — no tiene botón "Modificar". Paleta de colores unificada con la del marcador del mapa (sección 3.1), resuelto en **§10.2**.

### 7.3 Incidentes

```
INCIDENTE (<ID>)
Activo asociado: <ASSET_ID>
Tipo de incidente: <TYPE>
Estado: <STATUS>
Zona: <ZONE>
Latitud: <LAT>
Longitud: <LNG>
Fecha: <DATE>
[Botón "Cerrar"]
```

Solo lectura. Nota: `ASSET_ID` es un dato derivado del proceso de asociación descripto en la sección 4 (frontend), no un campo que devuelva `GET /incidents` directamente.

### 7.4 Guardado, validaciones y mensajes

El botón "Guardar" existe únicamente en el modal de vehículos (el único con flujo de edición) — los modales de activos e incidentes son de solo lectura y solo tienen botón "Cerrar". Resuelto en **§10.11**:

- El backend mock no expone `PUT` ni `PATCH`, por lo que "Guardar" no hace ninguna llamada al backend: valida el formulario, cierra el modal y actualiza el vehículo en el contexto/estado global de la aplicación.
- El guardado se considera exitoso en el momento en que el contexto se actualiza correctamente; no hay validación de negocio adicional del lado del servidor.
- Mientras se procesa el guardado, el botón "Guardar" queda deshabilitado.
- Éxito: "Vehículo actualizado correctamente."
- Error (al actualizar el contexto): "No fue posible actualizar el vehículo."

---

## 8. Referencias técnicas

- Zonas: `api-docs/zones` (`GET /zones`, `GET /zones/:id`)
- Vehículos: `api-docs/vehicles` (`GET /vehicles`, `GET /vehicles/:id`)
- Activos urbanos: `api-docs/assets` (`GET /assets`)
- Incidentes: `api-docs/incidents` (`GET /incidents`, `GET /incidents/:id`)

Cada recurso admite búsqueda por id: `<recurso>/:id`. Documentación completa en `docs/METHODS.md` y Swagger UI (`pnpm dev`, luego `localhost:3000/api-docs`).

El backend mock actual no expone `POST /zones` ni ningún endpoint de actualización (`PUT`/`PATCH`) o borrado (`DELETE`) para ninguna entidad (confirmado en `docs/METHODS.md`, sección "Limitaciones conocidas").

---

## 9. Criterios de aceptación

1. El sistema carga 1500 activos y 40 incidentes (conjunto fijo) distribuidos en las 5 zonas soportadas (Microcentro, Palermo, Recoleta, Belgrano, Caballito).
2. En el mapa y en las tablas solo se muestran puntos cuyas coordenadas caen dentro de alguna de las 5 zonas; la zona se deriva de las coordenadas (no del `zoneId` del backend) y los puntos fuera de toda zona se excluyen (§10.5).
3. Las coordenadas se muestran redondeadas a 4 decimales.
4. Los filtros se pueden combinar entre sí y actualizan la información mostrada sin nuevas consultas al backend.
5. Las tablas paginan de a 15 registros.
6. El mapa de calor se activa/desactiva con un check habilitado por defecto.
7. El mapa de calor filtra incidentes por tipo y estado, pudiendo seleccionarse uno, varios o todos.
8. Los marcadores de activos usan colores por estado: `OK` verde, `FULL` rojo, `DAMAGED` naranja, `OUT_OF_SERVICE` negro.
9. Al hacer hover sobre un marcador se ve un tooltip con tipo y estado del incidente asociado; si el activo no tiene incidente asociado, muestra "Estado OK." en verde.
10. La leyenda del mapa de calor muestra `REPORTED` azul, `IN_PROGRESS` amarillo, `RESOLVED` verde.
11. Si no hay vehículos disponibles para una zona, se muestra una alerta no cerrable, de ancho completo, debajo del mapa y encima de las Tabs: "No hay vehículos disponibles para esta zona".
12. Los incidentes `OVERFLOW` se asocian al `BIN`/`CONTAINER` más cercano dentro de 100 metros.
13. Si se encuentra un activo válido, el incidente adopta sus coordenadas `lat`/`lng`.
14. Si no se encuentra un activo dentro del radio, el incidente se sigue mostrando en mapa y tablas, marcado como sin activo asociado.
15. Vehículos en `MAINTENANCE` u `OUT_OF_SERVICE` no se consideran en la asignación.
16. Activos en `OUT_OF_SERVICE` no generan asignaciones de vehículos.
17. La prioridad `OVERFLOW > DAMAGE > LITTERING > OTHER` determina el orden de procesamiento de incidentes cuando compiten por los mismos vehículos disponibles.
18. La edición de un vehículo valida el formato de placa (`AAA111` o `AA111AA`).
19. Las tablas y el modal de vehículos muestran la zona por nombre (no `zoneId`); el orden por "identificador" en vehículos usa la placa.
20. El filtro de tipo de vehículo incluye Camión, Furgoneta y Camioneta.
21. Al guardar con éxito, el modal se cierra y el cambio se persiste en el estado global de la aplicación (sin llamada a backend, ya que el mock no expone `PUT`/`PATCH`).
22. Al fallar la actualización del contexto, se muestra "No fue posible actualizar el vehículo."
23. Al guardar con éxito, se muestra "Vehículo actualizado correctamente."
24. Filtros, tablas, mapa, mapa de calor y modales se mantienen sincronizados sobre una única fuente de datos compartida.

---

## 10. Inconsistencias y puntos a validar

### 10.1 Cantidad de incidentes: 1500 vs. 40 — RESUELTO

`docs/scope.md` afirmaba dos veces (introducción de incidentes y criterios de aceptación) que el sistema carga **1500 incidentes** en las 5 zonas. El backend mock implementado hace lo contrario: `data/seed.ts` (`generateAssets(1500)`, invocado desde `data/mock.ts`) genera **1500 activos** (`assets`), mientras que `data/incidents.ts` es un dataset **fijo de 40 incidentes**.

**Resolución (confirmada):** el scope estaba mal escrito; el requisito real, ya reflejado en el backend, es 1500 activos generados aleatoriamente y 40 incidentes fijos. `docs/scope.md` fue corregido en las dos secciones donde aparecía el número.

### 10.2 Colores de estado de activos: tres paletas distintas — RESUELTO

| Fuente | OK | DAMAGED | FULL | OUT_OF_SERVICE |
|---|---|---|---|---|
| Características → marcadores del mapa (línea 34-37) | verde | naranja | rojo | negro |
| Modal de vehículo → círculo de estado de activo (línea 129) | verde | amarillo | naranja | rojo |
| Criterios de aceptación → marcadores del mapa (línea 192-196) | verde | amarillo | naranja | negro |

Las tres coinciden en `OK = verde`, pero difieren en el resto.

**Resolución (confirmada):** paleta única para todo el sistema (marcador de mapa y círculo de estado en modal de activo): `OK` verde, `FULL` rojo, `DAMAGED` naranja, `OUT_OF_SERVICE` negro. `docs/scope.md` fue corregido en el modal de activos y en los criterios de aceptación para usar esta paleta.

### 10.3 Prioridad de incidentes vs. criterio de asignación de vehículos — RESUELTO

La sección de asignación define un orden de prioridad para elegir vehículo (`ACTIVE` > misma zona > menor capacidad suficiente) y, por separado, una prioridad entre tipos de incidente (`OVERFLOW > DAMAGE > LITTERING > OTHER`). No se explicaba cómo interactúan ambas reglas.

**Resolución (confirmada):** la cantidad de vehículos disponibles es limitada, por lo que los incidentes compiten entre sí por los vehículos aptos. La prioridad `OVERFLOW > DAMAGE > LITTERING > OTHER` determina el orden en que se procesan los incidentes para asignarles vehículo en ese escenario de contención.

### 10.4 Coordenadas en la tabla de vehículos — RESUELTO

El scope decía que "en todos los casos" (vehículo/activo/incidente) se muestra el registro con sus coordenadas. El modelo `Vehicle` (`src/types/index.ts`, confirmado también en `API.md`) no tiene `lat`/`lng`, solo `zoneId`.

**Resolución (confirmada):** para vehículos, tanto la tabla como el modal muestran la zona por su nombre (traducción de `zoneId` a `name`, no el id crudo), en lugar de coordenadas.

### 10.5 `zoneId` de un activo puede no coincidir con su ubicación geográfica real — RESUELTO

**Contexto del problema.** En `data/seed.ts`, cada activo recibe una zona aleatoria (`faker.helpers.arrayElement(zones)`) independiente de sus coordenadas, y estas se generan uniformemente dentro de todo el bounding box de Buenos Aires (`BA_BOUNDS` en `utils/geo.ts`), no acotadas a las 5 zonas. Además, `data/zones.ts` define cada zona solo como `{ id, name }`: **no existe ninguna geometría de zona en el backend** (ni polígonos ni bounding boxes). Por eso el campo `zoneId` no es confiable como indicador de ubicación, y el filtro geográfico prometido en el §4 y en el criterio de aceptación #2 no tenía, hasta ahora, una fuente de verdad contra la cual evaluarse.

**Resolución (confirmada).** La zona de un punto (activo o incidente) se determina **por sus coordenadas**, no por el campo `zoneId` que envía el backend. Reglas:

1. Se define, del lado del frontend, un **límite geográfico por cada una de las 5 zonas** (bounding box o polígono). Los límites son **mutuamente excluyentes**: no se solapan, de modo que un punto pertenece a lo sumo a una zona.
2. Para cada punto se resuelve su **zona real** aplicando un test de pertenencia (point-in-zone) sobre sus coordenadas ya limpiadas (§4: redondeo a 4 decimales y, en incidentes, coordenada adoptada del activo asociado cuando corresponde).
3. Todo punto que **no caiga dentro de ninguna de las 5 zonas** se considera fuera del área soportada y se **excluye por completo** — no se muestra en el mapa ni en las tablas ni en el mapa de calor.
4. Esa **zona real derivada es la única fuente de verdad** para todo el sistema: coloreado y agrupación en el mapa, leyenda "Zona: `<name>`" en modales, y el **filtro y el orden "por zona" de las tablas (§6.2)** operan sobre la zona derivada, **no** sobre el `zoneId` crudo del backend. Esto elimina la posibilidad de que un mismo activo aparezca en el mapa bajo una zona y en la tabla bajo otra.

**Nota de implementación (no bloqueante para el spec).** La geometría concreta de las 5 zonas (las coordenadas que las limitan) es un artefacto de datos a producir durante la implementación. Para el mock se recomiendan bounding boxes rectangulares disjuntos por su simplicidad y por garantizar la no-superposición; si más adelante se requiere fidelidad con los barrios reales, pueden reemplazarse por polígonos sin cambiar estas reglas. Dado que las coordenadas del seed se generan sobre todo Buenos Aires, se espera que una fracción importante de los 1500 activos quede fuera de las 5 zonas y sea excluida; si el volumen resultante en pantalla fuera insuficiente para la demo, el ajuste correcto es acotar la generación de coordenadas del seed a las zonas definidas (no relajar el filtro).

---

## 11. Ampliación de alcance — shell de navegación y ruteo (2026-07-05)

Esta sección consolida y verifica el cambio de alcance definido en `docs/scope.md` → "Ampliación de alcance (2026-07-05)" y en el spec paraguas `docs/chore/03-navigation-shell-router.md`, cruzándolo contra el estado real del frontend (`client/src`) y los specs vigentes. Como en el resto del documento, no se resuelve nada unilateralmente que no haya sido decidido por el usuario; las decisiones tomadas se citan en 11.4.

### 11.1 Situación de partida (verificada contra el código)

Hoy el frontend **no tiene ruteo ni navegación**: `client/src/App.tsx` renderiza un `<main>` con `<h1>Urbetrack</h1>`, y `client/src/main.tsx` monta `<App />` dentro de `QueryClientProvider` + `<Theme>` (Radix). El único desarrollo funcional es el ejemplo `client/src/component-test` (tabla de vehículos), explícitamente marcado como *proof-of-concept* con datos locales en `component-test-vehicles-table.md`. Las carpetas `client/src/app/router/`, `client/src/app/providers/` y `client/src/app/store/` existen pero están vacías (solo `.gitkeep`), consistente con `architecture.md`: *"Se puebla a medida que cada spec lo requiera; no se crea contenido especulativo"*.

Al implementar, `main.tsx` deja de montar `<App />` y pasa a montar `<RouterProvider router={router} />` dentro de los providers ya existentes (`QueryClientProvider` + `<Theme>`); ese cambio es código y se realiza en la fase de implementación, no en este spec.

### 11.2 Qué entra en este cambio

1. **Barra lateral de navegación (sidebar) persistente.** Logo (ícono de camión, `lucide-react` → `Truck`) + leyenda `URBETRACK`, seguido de los enlaces: Dashboard, Mapa, Activos, Vehículos, Incidentes. Vive en un **layout persistente** (ruta raíz del router): al navegar, solo cambia el contenido (`Outlet`); la sidebar **no se re-renderiza**.
2. **Cinco pantallas placeholder**, una por enlace, que por ahora muestran **solo su leyenda** (`Dashboard`, `Mapa`, `Activos`, `Vehículos`, `Incidentes`). Sin funcionalidad todavía.
3. **TanStack Router (code-based)** como mecanismo de ruteo, declarado como instalación en `component-test-vehicles-table.md` §3 y detallado en `architecture.md` → "Ruteo y navegación". Se agrega también `lucide-react`.
4. **Estado global como fuente única, documentado como objetivo**: cada pantalla que no sea el Dashboard alojará, más adelante, su ABMC, y las modificaciones "le pegarán" al estado suscripto, reflejándose en tiempo real en las demás vistas.

### 11.3 Qué NO entra (diferido)

- El **ABMC** (Alta/Baja/Modificación/Consulta) real de Activos, Vehículos e Incidentes. Se implementará en specs de feature por entidad. Restricción ya verificada contra el backend (`docs/METHODS.md` → "Limitaciones conocidas"): el mock **solo expone `GET`/`POST`**, no `PUT`/`PATCH`/`DELETE`. Por lo tanto el ABMC operará **sobre el estado global del frontend**, sin llamadas de escritura al backend, extendiendo el mismo patrón ya acordado para la edición de vehículos (§7.4 de este documento: "Guardar" no llama al backend, actualiza el contexto/estado global).
- El contenido funcional de cada pantalla (mapa Leaflet, tabs de tablas, filtros, mapa de calor, modales) descripto en las secciones 3, 6 y 7. Las pantallas de este cambio son placeholders.

### 11.4 Decisiones tomadas (usuario, 2026-07-05)

1. **Librería de íconos:** `lucide-react`.
2. **TanStack Router:** configuración **code-based** (árbol de rutas tipado en `client/src/app/router/`), sin file-based routing ni plugin de build.
3. **Alcance:** por ahora las pantallas muestran solo su leyenda; el ABMC de cada pantalla se desarrolla luego, en features aparte. Cita: *"Por ahora solo que la pantalla muestre una leyenda 'Vehiculos', 'Activos', etc. Luego desarrollaremos las features para desarrollar cada pantalla."*

### 11.5 Impacto sobre secciones existentes de este documento

- **§6 (Listados/tabs) y §7 (Modales):** sin cambios en su contenido; su implementación queda ahora encuadrada dentro de la pantalla correspondiente del nuevo shell (las tablas/tabs y modales vivirán en las pantallas de Activos, Vehículos e Incidentes cuando se desarrolle su feature). El comportamiento de sincronización sobre una única fuente de datos (criterio de aceptación #24) se refuerza con el objetivo de estado global de 11.2.4.
- **§7.4 (guardado sin backend):** se generaliza como el patrón base para todo el futuro ABMC, no solo para vehículos.

### 11.6 Criterios de aceptación del cambio

25. Existe una barra lateral persistente con logo (camión) + `URBETRACK` y los enlaces Dashboard, Mapa, Activos, Vehículos, Incidentes.
26. Cada enlace navega a su pantalla; al navegar, la sidebar no se re-renderiza (solo cambia el `Outlet`).
27. Cada una de las cinco pantallas muestra únicamente su leyenda correspondiente.
28. El ruteo usa TanStack Router en configuración code-based, fuertemente tipada, bajo `client/src/app/router/`.
29. `@tanstack/react-router` y `lucide-react` quedan declarados como dependencias del cliente (spec de instalaciones) e instalados con `pnpm add`.
30. El ABMC sobre estado global queda documentado como objetivo; no se implementa en este cambio.

### 10.6 Marcador de activo vs. tooltip de incidente — RESUELTO

El marcador coloreado en el mapa representa el estado de un **activo**, pero el tooltip al hacer hover muestra tipo y estado de un **incidente**. El scope no aclaraba qué se muestra en el tooltip de un activo sin incidente asociado, ni cómo se tratan los incidentes sin activo asociado.

**Resolución (confirmada):** si el activo no tiene un incidente asociado, el tooltip muestra la leyenda "Estado OK." en verde. Para los incidentes, tanto los asociados a un activo como los que no tienen activo asociado, se mantiene siempre la paleta de estado de incidente (§10.7): `REPORTED` azul, `IN_PROGRESS` amarillo, `RESOLVED` verde.

### 10.7 Colores de la leyenda del mapa de calor — RESUELTO

**Resolución (confirmada):** `REPORTED` azul, `IN_PROGRESS` amarillo, `RESOLVED` verde.

### 10.8 Sin vehículo apto disponible — RESUELTO

**Resolución (confirmada):** cuando no existen vehículos disponibles para operar los incidentes de una zona, debe mostrarse una alerta no cerrable, de ancho completo, ubicada debajo del mapa y encima de las Tabs, con el texto: "No hay vehículos disponibles para esta zona".

### 10.9 "Identificador" como criterio de orden en vehículos — RESUELTO

**Resolución (confirmada):** para vehículos, "ordenar por identificador" usa la Placa (`plate`) en lugar del `id` interno.

### 10.10 Filtro de tipo de vehículo incompleto — RESUELTO

**Resolución (confirmada):** se agrega la opción "Furgoneta" al filtro de tipo de vehículo. Queda: Todos | Camión | Furgoneta | Camioneta.

### 10.11 Alcance del botón "Guardar" y disparador del mensaje de error — RESUELTO

**Resolución (confirmada):** el backend mock no expone `PUT` ni `PATCH`, por lo que "Guardar" no llama al backend — solo actualiza el vehículo en el contexto/estado global de la aplicación. Una vez que el contexto se actualiza correctamente, se considera guardado con éxito ("Vehículo actualizado correctamente."). El mensaje de error ("No fue posible actualizar el vehículo.") queda reservado para una falla al actualizar ese contexto, no para una validación de negocio adicional del servidor (que no existe).

### 10.12 Correcciones menores de nomenclatura (ya aplicadas en este documento)

Estas no requieren decisión, se normalizaron directamente contra `src/types/index.ts`:

- `MAINTENCE` → `MAINTENANCE`.
- Estados de activo `Ok/Damage/Full/Out_of_service` → `OK/DAMAGED/FULL/OUT_OF_SERVICE`.

### 10.13 "Una única carga" (§6.1) — ¿por sesión o por apertura de pantalla? — RESUELTO

**Contexto del problema (bug real detectado 2026-07-06):** al implementar el borrado de un
vehículo (`docs/feature/03-vehicles-table.md`), se observó que al eliminar un registro, navegar a
otra pantalla y volver a "Vehículos", el vehículo eliminado reaparecía. La causa: el hook de query
volvía a hidratar el store de Zustand con el dataset cacheado original en cada nuevo montaje de la
pantalla, pisando el borrado local. El texto original de §6.1 ("la totalidad de los registros se
obtiene una única vez al cargar la pantalla") no aclaraba si esa carga única es por sesión de la
app o se repite cada vez que se vuelve a abrir la pantalla — con escrituras que solo viven en el
store (sin backend, ver §7.4), esta última lectura rompe cualquier ABMC apenas se navega.

**Resolución (confirmada):** la carga es única **por sesión de la aplicación**, no por cada
apertura de pantalla. Una vez que un store de feature fue hidratado desde su query, permanece como
única fuente de verdad hasta que la app se recarga — remontar la pantalla (navegar afuera y volver)
**no** vuelve a pedir ni a pisar los datos. Esto aplica a `vehicles` hoy y a `assets`/`incidents`
cuando desarrollen su propio ABMC. Detalle de la implementación (flag `hasHydrated` + query sin
refetch automático) documentado como regla general en
[docs/specs/architecture.md](./specs/architecture.md) → "Patrón: query hidrata store" →
"Hidratación única".
4. Esa **zona real derivada es la única fuente de verdad** para todo el sistema: coloreado y agrupación en el mapa, leyenda "Zona: `<name>`" en modales, y el **filtro y el orden "por zona" de las tablas (§6.2)** operan sobre la zona derivada, **no** sobre el `zoneId` crudo del backend. Esto elimina la posibilidad de que un mismo activo aparezca en el mapa bajo una zona y en la tabla bajo otra.

**Nota de implementación (no bloqueante para el spec).** La geometría concreta de las 5 zonas (las coordenadas que las limitan) es un artefacto de datos a producir durante la implementación. Para el mock se recomiendan bounding boxes rectangulares disjuntos por su simplicidad y por garantizar la no-superposición; si más adelante se requiere fidelidad con los barrios reales, pueden reemplazarse por polígonos sin cambiar estas reglas. Dado que las coordenadas del seed se generan sobre todo Buenos Aires, se espera que una fracción importante de los 1500 activos quede fuera de las 5 zonas y sea excluida; si el volumen resultante en pantalla fuera insuficiente para la demo, el ajuste correcto es acotar la generación de coordenadas del seed a las zonas definidas (no relajar el filtro).

---

## 11. Ampliación de alcance — shell de navegación y ruteo (2026-07-05)

Esta sección consolida y verifica el cambio de alcance definido en `docs/scope.md` → "Ampliación de alcance (2026-07-05)" y en el spec paraguas `docs/chore/03-navigation-shell-router.md`, cruzándolo contra el estado real del frontend (`client/src`) y los specs vigentes. Como en el resto del documento, no se resuelve nada unilateralmente que no haya sido decidido por el usuario; las decisiones tomadas se citan en 11.4.

### 11.1 Situación de partida (verificada contra el código)

Hoy el frontend **no tiene ruteo ni navegación**: `client/src/App.tsx` renderiza un `<main>` con `<h1>Urbetrack</h1>`, y `client/src/main.tsx` monta `<App />` dentro de `QueryClientProvider` + `<Theme>` (Radix). El único desarrollo funcional es el ejemplo `client/src/component-test` (tabla de vehículos), explícitamente marcado como *proof-of-concept* con datos locales en `component-test-vehicles-table.md`. Las carpetas `client/src/app/router/`, `client/src/app/providers/` y `client/src/app/store/` existen pero están vacías (solo `.gitkeep`), consistente con `architecture.md`: *"Se puebla a medida que cada spec lo requiera; no se crea contenido especulativo"*.

Al implementar, `main.tsx` deja de montar `<App />` y pasa a montar `<RouterProvider router={router} />` dentro de los providers ya existentes (`QueryClientProvider` + `<Theme>`); ese cambio es código y se realiza en la fase de implementación, no en este spec.

### 11.2 Qué entra en este cambio

1. **Barra lateral de navegación (sidebar) persistente.** Logo (ícono de camión, `lucide-react` → `Truck`) + leyenda `URBETRACK`, seguido de los enlaces: Dashboard, Mapa, Activos, Vehículos, Incidentes. Vive en un **layout persistente** (ruta raíz del router): al navegar, solo cambia el contenido (`Outlet`); la sidebar **no se re-renderiza**.
2. **Cinco pantallas placeholder**, una por enlace, que por ahora muestran **solo su leyenda** (`Dashboard`, `Mapa`, `Activos`, `Vehículos`, `Incidentes`). Sin funcionalidad todavía.
3. **TanStack Router (code-based)** como mecanismo de ruteo, declarado como instalación en `component-test-vehicles-table.md` §3 y detallado en `architecture.md` → "Ruteo y navegación". Se agrega también `lucide-react`.
4. **Estado global como fuente única, documentado como objetivo**: cada pantalla que no sea el Dashboard alojará, más adelante, su ABMC, y las modificaciones "le pegarán" al estado suscripto, reflejándose en tiempo real en las demás vistas.

### 11.3 Qué NO entra (diferido)

- El **ABMC** (Alta/Baja/Modificación/Consulta) real de Activos, Vehículos e Incidentes. Se implementará en specs de feature por entidad. Restricción ya verificada contra el backend (`docs/METHODS.md` → "Limitaciones conocidas"): el mock **solo expone `GET`/`POST`**, no `PUT`/`PATCH`/`DELETE`. Por lo tanto el ABMC operará **sobre el estado global del frontend**, sin llamadas de escritura al backend, extendiendo el mismo patrón ya acordado para la edición de vehículos (§7.4 de este documento: "Guardar" no llama al backend, actualiza el contexto/estado global).
- El contenido funcional de cada pantalla (mapa Leaflet, tabs de tablas, filtros, mapa de calor, modales) descripto en las secciones 3, 6 y 7. Las pantallas de este cambio son placeholders.

### 11.4 Decisiones tomadas (usuario, 2026-07-05)

1. **Librería de íconos:** `lucide-react`.
2. **TanStack Router:** configuración **code-based** (árbol de rutas tipado en `client/src/app/router/`), sin file-based routing ni plugin de build.
3. **Alcance:** por ahora las pantallas muestran solo su leyenda; el ABMC de cada pantalla se desarrolla luego, en features aparte. Cita: *"Por ahora solo que la pantalla muestre una leyenda 'Vehiculos', 'Activos', etc. Luego desarrollaremos las features para desarrollar cada pantalla."*

### 11.5 Impacto sobre secciones existentes de este documento

- **§6 (Listados/tabs) y §7 (Modales):** sin cambios en su contenido; su implementación queda ahora encuadrada dentro de la pantalla correspondiente del nuevo shell (las tablas/tabs y modales vivirán en las pantallas de Activos, Vehículos e Incidentes cuando se desarrolle su feature). El comportamiento de sincronización sobre una única fuente de datos (criterio de aceptación #24) se refuerza con el objetivo de estado global de 11.2.4.
- **§7.4 (guardado sin backend):** se generaliza como el patrón base para todo el futuro ABMC, no solo para vehículos.

### 11.6 Criterios de aceptación del cambio

25. Existe una barra lateral persistente con logo (camión) + `URBETRACK` y los enlaces Dashboard, Mapa, Activos, Vehículos, Incidentes.
26. Cada enlace navega a su pantalla; al navegar, la sidebar no se re-renderiza (solo cambia el `Outlet`).
27. Cada una de las cinco pantallas muestra únicamente su leyenda correspondiente.
28. El ruteo usa TanStack Router en configuración code-based, fuertemente tipada, bajo `client/src/app/router/`.
29. `@tanstack/react-router` y `lucide-react` quedan declarados como dependencias del cliente (spec de instalaciones) e instalados con `pnpm add`.
30. El ABMC sobre estado global queda documentado como objetivo; no se implementa en este cambio.

### 10.6 Marcador de activo vs. tooltip de incidente — RESUELTO

El marcador coloreado en el mapa representa el estado de un **activo**, pero el tooltip al hacer hover muestra tipo y estado de un **incidente**. El scope no aclaraba qué se muestra en el tooltip de un activo sin incidente asociado, ni cómo se tratan los incidentes sin activo asociado.

**Resolución (confirmada):** si el activo no tiene un incidente asociado, el tooltip muestra la leyenda "Estado OK." en verde. Para los incidentes, tanto los asociados a un activo como los que no tienen activo asociado, se mantiene siempre la paleta de estado de incidente (§10.7): `REPORTED` azul, `IN_PROGRESS` amarillo, `RESOLVED` verde.

### 10.7 Colores de la leyenda del mapa de calor — RESUELTO

**Resolución (confirmada):** `REPORTED` azul, `IN_PROGRESS` amarillo, `RESOLVED` verde.

### 10.8 Sin vehículo apto disponible — RESUELTO

**Resolución (confirmada):** cuando no existen vehículos disponibles para operar los incidentes de una zona, debe mostrarse una alerta no cerrable, de ancho completo, ubicada debajo del mapa y encima de las Tabs, con el texto: "No hay vehículos disponibles para esta zona".

### 10.9 "Identificador" como criterio de orden en vehículos — RESUELTO

**Resolución (confirmada):** para vehículos, "ordenar por identificador" usa la Placa (`plate`) en lugar del `id` interno.

### 10.10 Filtro de tipo de vehículo incompleto — RESUELTO

**Resolución (confirmada):** se agrega la opción "Furgoneta" al filtro de tipo de vehículo. Queda: Todos | Camión | Furgoneta | Camioneta.

### 10.11 Alcance del botón "Guardar" y disparador del mensaje de error — RESUELTO

**Resolución (confirmada):** el backend mock no expone `PUT` ni `PATCH`, por lo que "Guardar" no llama al backend — solo actualiza el vehículo en el contexto/estado global de la aplicación. Una vez que el contexto se actualiza correctamente, se considera guardado con éxito ("Vehículo actualizado correctamente."). El mensaje de error ("No fue posible actualizar el vehículo.") queda reservado para una falla al actualizar ese contexto, no para una validación de negocio adicional del servidor (que no existe).

### 10.12 Correcciones menores de nomenclatura (ya aplicadas en este documento)

Estas no requieren decisión, se normalizaron directamente contra `src/types/index.ts`:

- `MAINTENCE` → `MAINTENANCE`.
- Estados de activo `Ok/Damage/Full/Out_of_service` → `OK/DAMAGED/FULL/OU