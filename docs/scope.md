# URBETRACK
---
### Introducción.
Esta funcionalidad planea establecer los puntos críticos de activos dentro de cada uno las zonas, y así poder establecer los vehículos adecuados.

### Características.
Una zona es un lugar físico del mapa en donde se ubicarán las diferentes direcciones (acá puntos "LTN, LGN").
Un vehículo tiene asociada una única zona. Tienen determinados la cantidad de pesos que puede soportar.
Existen tres tipos de vehículos: 
TRUCK (Camión), soporta hasta 5000kg. 
VAN (Furgoneta), soporta hasta 2000kg.
PICKUP (Camioneta), soporta hasta 1000kg.

Cada vehiculo puede tener diferentes estados (status):
ACTIVE: Activo, funciona OK.
MAINTENCE: En mantenimiento, hoy no se puede usar.
OUT_OF_SERVICE: Fuera de servicio. Ya no se puede usar mas.

Un activo (assets) va a tener un tipo (type) que puede ser un container, un Bin (cesto o tacho, es de menor tamaño que un container) o un banco (bench).
Cada activo puede tener diferentes estados (status):
Ok => Se opera con normalidad
Damage => Dañado
Full => completo
Out_of_service => Fuera de servicio.

Por cada activo se puede crear un incidente en donde se determina el estado del mismo.
El sistema carga 1500 activos de manera aleatoria en 5 localidades de CABA:
Microcentro, Palermo, Recoleta, Belgrano y Caballito.
Los incidentes son un conjunto fijo de 40 registros, distribuidos entre esas mismas 5 localidades.


El operador visualizará el mapa y podrá activar un mapa de calor que represente la concentración de incidentes dentro de una zona.
Habrá un check que, por defecto estará tildado, y marcará si se aplica el mapa de calor o no.
Adicionalmente, cada activo será representado mediante un marcador cuyo color dependerá de su estado:
OK: verde
FULL: rojo
DAMAGED: naranja
OUT_OF_SERVICE: negro

Al posicionar el cursor sobre un marcador se mostrará un tooltip indicando:
Tipo de incidente: <TYPE>
Estado del incidente: <STATUS>
TYPE: OVERFLOW | DAMAGE | LITTERING | OTHER
STATUS: REPORTED | IN_PROGRESS | RESOLVED
En caso de que el activo no tenga un incidente asociado, el tooltip mostrará la leyenda "Estado OK." en color verde.
Para los incidentes, tanto los asociados a un activo como los que no tienen activo asociado, se mantendrán siempre los colores definidos según su estado (ver colores de estado de incidente más abajo).

También, al estar habilitado el mapa de calor, aparecerá un cuadro a la derecha del mapa, del lado de afuera, que mostrará los colores con su equivalente estado:
REPORTED: azul
IN_PROGRESS: amarillo
RESOLVED: verde
El mapa de calor permitirá filtrar:

Estados: REPORTED | IN_PROGRESS | RESOLVED
Tipos: OVERFLOW | DAMAGE | LITTERING | OTHER
Pudiendo seleccionarse uno, varios o todos.

El sistema establece la prioridad de envíos de vehiculos en función de la criticidad, a saber:
Los activos con estado OUT_OF_SERVICE no serán considerados para asignación de vehículos.

Las reglas de asignación serán las siguientes:
PICKUP: Únicamente puede operar activos de tipo BENCH.
VAN: Puede operar activos de tipo BENCH o BIN.
TRUCK: Puede operar activos de tipo BENCH, BIN o CONTAINER.

En caso de existir múltiples vehículos aptos para operar un activo, se priorizará aquel que:
- Se encuentre ACTIVE.
- Pertenezca a la misma zona.
- Posea la menor capacidad posible que permita resolver el incidente.
La prioridad de incidentes será: OVERFLOW > DAMAGE > LITTERING > OTHER.
Como la cantidad de vehículos disponibles es limitada, esta prioridad determina el orden en que se procesan los incidentes para asignarles vehículo cuando varios incidentes compiten por los mismos vehículos disponibles.

Los incidentes asociados a activos OUT_OF_SERVICE serán descartados y no generarán asignaciones.

En caso de no existir vehículos disponibles para operar los incidentes de una zona, deberá mostrarse una alerta que no pueda cerrarse, que ocupe el ancho completo de la página, ubicada debajo del mapa y encima de las Tabs, con el texto: "No hay vehículos disponibles para esta zona".

El sistema, además, listará por medio de una tabla el listado de vehiculos, de activos y de incidentes.
No se mostrarán todas las tablas juntas sino que se utilizarán tabs (Ejemplo de Tabs: https://mui.com/material-ui/react-tabs/) para diferenciarlos. 
En cuanto se selecciona un Tab también se modificarán los filtros de manera dinámica.
Para activos e incidentes se mostrará por cada registro sus coordenadas. Para vehículos se mostrará la zona (el nombre de la zona, no el zoneID).
Los registros podrán ordenarse por:
- Identificador (para vehículos se utilizará la Placa en lugar del ID)
- Zona
- Estado

La tabla tendrá paginación de 15 registros por página.
La totalidad de registros será obtenida al cargar la pantalla.
Los filtros, búsquedas, ordenamientos y paginación serán aplicados localmente.
No se realizarán nuevas consultas al backend al modificar filtros.

Habrán filtros para determinar:

* Si el Tab = "Activos":
Tipo: Todos | Container | Bin | Bench
Estado: Todos | OK | DAMAGED | FULL | OUT_OF_SERVICE
Zonas: 'Microcentro' | 'Palermo' | 'Recoleta' | 'Belgrano' |'Caballito'

* Si el Tab = "Vehiculos":
- Búsqueda por placa.
Capacidad: "Todos" | "Hasta 1000kg" | "Entre 1001kg y 2000kg" | "Más de 2000kg"
Tipo: "Camión" | "Furgoneta" | "Camioneta"
Estado: "Todos" | "Activos" | "En Mantenimiento" | "Fuera de servicio"
- Las zonas: pueden ser una, varias o todas.
 
Si el Tab = "Incidentes":
Tipo: Todos | OVERFLOW | DAMAGE | LITTERING | OTHER
Estado: Todos | REPORTED | IN_PROGRESS | RESOLVED
Zonas: 'Microcentro' | 'Palermo' | 'Recoleta' | 'Belgrano' | 'Caballito'
Búsqueda por identificador.

Para todos los casos Zonas de todos los Tabs: Una, varias o todas.
 
Al seleccionar un registro se abrirá un modal con el detalle, en caso de ser:
vehiculos los valores a mostrar serán: plate, type, status, capacity y zona (nombre, traducido a partir del zoneID). Pero se aplicarán el siguiente formato:
<INICIO DE MODAL>
<TYPE> (<PLATE>) y con círculo se determinará el STATUS: ACTIVE (verde), MAINTENANCE (Amarillo) y OUT_OF_SERVICE (rojo).
Capacidad: XXXXKG
ZONA: <ZONE>
<Botón "Modificar"><Botón "Cerrar">
<FIN MODAL>
Al hacer un hover sobre el círculo se mostrará "En actividad", "En mantenimiento" o "Fuera de servicio".
ZONE es el mapeo de las zonas, a saber:
id: '1', name: 'Microcentro' | id: '2', name: 'Palermo' | id: '3', name: 'Recoleta' | id: '4', name: 'Belgrano' | id: '5', name: 'Caballito'
Botones:
"Cerrar": Se cierra sin mas.
"Modificar": Por un lado "Modificar" pasa a ser "Guardar" y "Cerrar" a "Cancelar". Además aparecen los campos:
* PLACA: Con el valor que tiene cargado, seleccionado, se puede modificar. Validación: Debe tener el siguiente formato: AAA111 (tres letras y tres números) o AA111AA (dos letras, tres números y dos letras mas).
En caso de no tener el formato seleccionado, debe aparecer un error en rojo debajo del input que lo indique.

En caso de ser activos los valores a mostrar serán:
<INICIO DE MODAL>
<TYPE> y con círculo se determinará el STATUS.
Zona: <ZONE>
Latitud: <LAT>
Longitud: <LNG>
<Botón "Cerrar">
<FIN MODAL>
Status: OK (verde), DAMAGED (naranja), FULL (rojo), OUT_OF_SERVICE (negro)

En caso de ser incidentes los valores a mostrar serán:

<INICIO DE MODAL>
INCIDENTE (<ID>)
Activo asociado: <ASSET_ID>
Tipo de incidente: <TYPE>
Estado:<STATUS>
Zona: <ZONE>
Latitud: <LAT>
Longitud: <LNG>
Fecha: <DATE>
<Botón "Cerrar">
<FIN MODAL>
TYPE: OVERFLOW | DAMAGE | LITTERING | OTHER
STATUS: REPORTED | IN_PROGRESS | RESOLVED


El botón Guardar (disponible únicamente en el modal de vehículos, el único que permite edición) valida que todo sea correcto, cierra el modal y actualiza el vehículo en el estado (contexto) global de la aplicación.
El backend mock no expone métodos PUT ni PATCH, por lo que el guardado no realiza ninguna llamada al backend: se considera guardado exitoso en el momento en que el contexto se actualiza correctamente.
En caso de error al actualizar el contexto, se mostrará un mensaje indicando: "No fue posible actualizar el vehículo."
En caso de éxito se mostrará un mensaje: "Vehículo actualizado correctamente."
Mientras se procesa la acción de guardado el botón "Guardar" quedará deshabilitado.

### Disclaimer.
Evidenciando que las direcciones cargadas por el sistema contemplan valores por fuera de las localidades buscadas, antes de cargar el mapa, se procederá a hacer una limpieza de datos dejando únicamente aquellos valores que nos resulten válidos para las zonas establecidas.
De esta manera no se toca directamente al backend (que, en muchos casos, si no sos parte del equipo no es una responsabilidad que podamos afrontar) y al mismo tiempo nuestro mapa queda limpio de tener valores en, por ej, la costa o zonas del GBA.
Habrá que buscar los puntos correspondientes a cada una de las zonas establecidas y, al momento de cargar los datos a mostrarse en el mapa, que filtre aquellos puntos designados por el backend que no correspondan a cada distrito.
Además hay que redondear a 4 números despues de la coma.
Además, como las coordenadas de algunos activos no coinciden exactamente con las coordenadas de los incidentes, se realizará un proceso de asociación.
Si asset.type = "BIN" o asset.type = "CONTAINER" y el incidente posee type = "OVERFLOW", se buscará el asset más cercano dentro de un radio máximo de 100 metros.
En caso de encontrarse un activo válido, el incidente tomará los valores LAT y LNG del activo asociado, considerándose ambos elementos como pertenecientes al mismo punto geográfico.
La relación establecida deberá persistirse en el estado global de la aplicación para que el mapa, los filtros y las tablas trabajen sobre una única fuente de información.
En caso de no existir un activo compatible dentro del radio establecido, el incidente seguirá mostrándose en el mapa y en los listados, pero se considerará un incidente sin activo asociado.

### Métodos asociados a listar las características:
Zonas: api-docs/zones
Vehiculos: api-docs/vehicles
Activos urbanos: api-docs/assets
Incidentes: api-docs/incidents

Asímismo, cada uno de estos puede buscarse a partir de su ID: <característica>/:id
Para mayor información se puede leer: <:root>/docs/METHODS.md
O bien consultar el swagger: 
Ejecutar pnpm dev
localhost:3000/api-docs/...

### Criterios de aceptación.

El sistema deberá cargar 1500 activos distribuidos en las zonas: Microcentro, Palermo, Recoleta, Belgrano y Caballito, y un conjunto fijo de 40 incidentes distribuidos entre esas mismas zonas.

Únicamente se mostrarán en el mapa aquellos puntos cuyas coordenadas pertenezcan a alguna de las zonas válidas configuradas.

Las coordenadas deberán mostrarse redondeadas a 4 decimales.

Los filtros deberán poder combinarse entre sí y actualizar la información mostrada sin realizar nuevas consultas al backend.

Las tablas deberán paginarse mostrando 15 registros por página.

El mapa de calor deberá poder activarse y desactivarse mediante un check habilitado por defecto.

El mapa de calor deberá permitir filtrar incidentes por TYPE y STATUS, pudiendo seleccionarse uno, varios o todos.

Los marcadores del mapa deberán representar activos y utilizar colores según su STATUS:
OK (verde)
FULL (rojo)
DAMAGED (naranja)
OUT_OF_SERVICE (negro)

Al posicionar el cursor sobre un marcador deberá visualizarse un tooltip indicando TYPE y STATUS del incidente asociado. Si el activo no tiene incidente asociado, el tooltip deberá mostrar "Estado OK." en verde.

La leyenda del mapa de calor deberá mostrar los colores de estado de incidente: REPORTED (azul), IN_PROGRESS (amarillo), RESOLVED (verde).

En caso de no existir vehículos disponibles para operar los incidentes de una zona, deberá mostrarse una alerta no cerrable, de ancho completo, debajo del mapa y encima de las Tabs, con el texto "No hay vehículos disponibles para esta zona".

Los incidentes de tipo OVERFLOW deberán asociarse con el BIN o CONTAINER más cercano dentro de un radio máximo de 100 metros.

En caso de encontrarse un activo válido, el incidente deberá adoptar las coordenadas LAT y LNG del activo asociado.

En caso de no encontrarse un activo dentro del radio establecido, el incidente continuará visualizándose en el mapa y en las tablas como incidente sin activo asociado.

Los vehículos con estado MAINTENANCE u OUT_OF_SERVICE no podrán ser considerados durante el proceso de asignación.

Los activos con estado OUT_OF_SERVICE no generarán asignaciones de vehículos.

La edición de un vehículo deberá validar el formato de PLATE: AAA111 y AA111AA

Las tablas y modales de vehículos deberán mostrar la zona por su nombre (no por zoneID). El ordenamiento por "Identificador" en vehículos deberá aplicarse sobre la Placa.

En caso de guardar correctamente, el modal deberá cerrarse y persistir los cambios en el estado global de la aplicación (no existe llamada al backend, dado que el mock no expone PUT ni PATCH).

En caso de error al guardar, deberá mostrarse el mensaje: "No fue posible actualizar el vehículo."

En caso de éxito deberá mostrarse el mensaje: "Vehículo actualizado correctamente."

Los filtros, tablas, mapa, mapas de calor y modales deberán mantenerse sincronizados utilizando una única fuente de información compartida.

---

### Ampliación de alcance (2026-07-05).

Se define un cambio de alcance sobre lo descripto arriba. Su detalle, decisiones y specs derivados están en el spec paraguas `docs/chore/03-navigation-shell-router.md`; una vez analizado por el LLM, esta ampliación se refleja también en `docs/verified-scope.md`. Las funcionalidades extendidas son:

1. **Barra lateral de navegación.** Tendrá: un ícono de un camión (logo, importado desde una librería de íconos) seguido de la leyenda URBETRACK, y luego la lista de enlaces: Dashboard, Mapa, Activos, Vehículos e Incidentes. Cada una de estas opciones irá a la pantalla correspondiente. La barra de navegación no se re-renderizará: solo se re-renderiza el contenido de la página (es un layout persistente).

2. **Pantallas placeholder.** Por ahora, cada una de estas pantallas contendrá únicamente la leyenda que le corresponde a su enlace (por ejemplo, Dashboard solo tendrá escrito "Dashboard"; Vehículos, "Vehículos"; etc.). El desarrollo funcional de cada pantalla se hará luego, en features aparte.

3. **Instalación de TanStack Router.** Se extiende el spec que declara las instalaciones del cliente para agregar TanStack Router (configuración code-based, fuertemente tipada). Se agrega además la librería de íconos `lucide-react` para el logo del camión y futuros íconos de la sidebar.

4. **Estado global como fuente única (objetivo).** Los datos se persisten en el estado global. La dirección del cambio es que, más adelante, cada pantalla que no sea el Dashboard tenga su ABMC correspondiente, y que las modificaciones "le peguen" al estado suscripto y se reflejen en tiempo real en las diferentes vistas (mapa, tablas, modales). En este cambio esto queda documentado como objetivo; el ABMC concreto se especifica e implementa en specs de feature posteriores. Nota: el backend mock no expone `PUT`/`PATCH`/`DELETE`, por lo que el ABMC vivirá en el estado global del frontend (mismo patrón que ya usa la edición de vehículos, sin llamada de escritura al backend).
