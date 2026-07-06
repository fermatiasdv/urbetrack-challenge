# SPEC — Shell de navegación + TanStack Router (cambio de alcance)

**Tipo:** chore (spec paraguas de un cambio de alcance)
**ID:** SPEC-003
**Estado:** Aprobado (pendiente de implementación)
**Fecha:** 2026-07-05
**Relacionado:** [scope.md](../scope.md), [verified-scope.md](../verified-scope.md), [architecture.md](../specs/architecture.md), [component-test-vehicles-table.md](../specs/component-test-vehicles-table.md)

## Objetivo

Formalizar un **cambio de alcance** sobre lo definido en `docs/scope.md` y, en consecuencia, en
`docs/verified-scope.md`. Este chore es el **spec paraguas**: describe las funcionalidades
extendidas a alto nivel y enumera, con su detalle, **qué spec se modifica a partir de él**. La
implementación de cada parte se realiza recién cuando este chore y los specs derivados estén
aprobados (regla del proyecto: *nada se desarrolla sin spec aprobado; primero se crean/modifican los
specs, luego se implementa*).

Hasta hoy el frontend es un SPA de una sola vista (`App.tsx` renderiza el ejemplo
`component-test`) sin ruteo ni navegación. Este cambio introduce el **shell de navegación** (barra
lateral persistente + ruteo) y deja el terreno preparado para que cada pantalla aloje, más adelante,
su ABMC sobre el estado global.

## Funcionalidades extendidas (alto nivel)

1. **Barra lateral de navegación (sidebar).** Contiene, de arriba hacia abajo: un ícono de camión
   (logo, importado de una librería de íconos) seguido del texto **URBETRACK**, y luego la lista de
   enlaces: **Dashboard**, **Mapa**, **Activos**, **Vehículos** e **Incidentes**. Cada enlace navega
   a su pantalla correspondiente. La sidebar **no se re-renderiza** al navegar: solo cambia el
   contenido de la página (es un layout persistente; ver [architecture.md](../specs/architecture.md)
   → "Ruteo y navegación").
2. **Pantallas placeholder.** En este cambio, cada pantalla contiene **únicamente la leyenda con su
   nombre** (p. ej. la pantalla de Vehículos solo muestra "Vehículos", la de Activos "Activos",
   etc.). El desarrollo funcional de cada pantalla (mapa real, tablas, filtros, ABMC) queda para
   specs de feature posteriores.
3. **Instalación de TanStack Router.** Se extiende el spec que declara las instalaciones del cliente
   ([component-test-vehicles-table.md](../specs/component-test-vehicles-table.md) §3 "Stack") para
   agregar `@tanstack/react-router` (configuración **code-based**, fuertemente tipada) y la librería
   de íconos `lucide-react` (para el logo del camión y futuros íconos de la sidebar).
4. **Estado global como fuente única (objetivo del cambio).** Los datos se persisten en el estado
   global. La dirección de este cambio es que, en el futuro, **cada pantalla que no sea el Dashboard
   tenga su ABMC correspondiente**, y que las modificaciones "le peguen" al estado suscripto y se
   reflejen **en tiempo real** en las distintas vistas (mapa, tablas, modales). En este chore esto se
   deja **documentado como objetivo** en `scope.md`, `verified-scope.md` y `architecture.md`; **no se
   implementa el ABMC** todavía (ver "Fuera de alcance").

## Decisiones tomadas (usuario, 2026-07-05)

1. **Librería de íconos:** `lucide-react` (liviana, tree-shakeable, expone el ícono `Truck`). Se
   agrega como dependencia nueva de `client/`.
2. **Configuración de TanStack Router:** **code-based** (árbol de rutas definido en TypeScript dentro
   de `client/src/app/router/`), sin plugin de build ni file-based routing. Encaja con la estructura
   feature-sliced actual y con el proyecto fuertemente tipado.
3. **Alcance de este cambio:** por ahora, cada pantalla solo muestra una **leyenda** con su nombre
   ("Vehículos", "Activos", etc.). El ABMC completo de cada pantalla se desarrollará **luego**, en
   specs de feature aparte por entidad. Cita del usuario: *"Por ahora solo que la pantalla muestre
   una leyenda 'Vehiculos', 'Activos', etc. Luego desarrollaremos las features para desarrollar cada
   pantalla."*

## Stack nuevo (a instalar en `client/`)

| Paquete | Tipo | Motivo |
|---|---|---|
| `@tanstack/react-router` | dependency | Ruteo del SPA, code-based y fuertemente tipado. Habilita el layout persistente (sidebar) + `Outlet` de contenido. |
| `lucide-react` | dependency | Set de íconos; provee el ícono `Truck` para el logo de la sidebar. |

Instalación con `pnpm add` desde el paquete `client/` (workspace pnpm). El proyecto corre TypeScript
en modo **strict**; ambas librerías traen sus propios tipos, no se requieren `@types/*`.

## Cambios propuestos (a nivel de este chore)

Estructura objetivo (referencial; se detalla en `architecture.md`):

```text
client/src/
  app/
    router/
      routes.tsx        # árbol de rutas code-based (root + 5 rutas hijas)
      router.ts         # createRouter(routeTree) + tipado del registro
    layout/
      AppLayout.tsx     # shell persistente: <Sidebar /> + <Outlet />
      Sidebar.tsx       # logo (Truck) + URBETRACK + enlaces de navegación
  features/
    dashboard/pages/DashboardPage.tsx   # placeholder: "Dashboard"
    map/pages/MapPage.tsx               # placeholder: "Mapa"
    assets/pages/AssetsPage.tsx         # placeholder: "Activos"
    vehicles/pages/VehiclesPage.tsx     # placeholder: "Vehículos"
    incidents/pages/IncidentsPage.tsx   # placeholder: "Incidentes"
```

Rutas (code-based): una **ruta raíz** que renderiza `AppLayout` (sidebar + `Outlet`) y cinco rutas
hijas (`/` → Dashboard, `/mapa`, `/activos`, `/vehiculos`, `/incidentes`). Como la sidebar vive en la
ruta raíz y solo el `Outlet` cambia, **la sidebar no se re-renderiza** al navegar. `main.tsx` pasa a
montar `<RouterProvider router={router} />` en lugar de `<App />` (dentro de los providers ya
existentes: `QueryClientProvider` + `<Theme>` de Radix).

## Specs que se modifican a partir de este chore

Este chore es el disparador; los cambios concretos viven en cada spec derivado:

1. **`docs/scope.md`** — se agrega una sección de **ampliación de alcance** con las cuatro
   funcionalidades extendidas (sidebar, pantallas placeholder, instalación de TanStack Router, ABMC
   sobre estado global como objetivo).
2. **`docs/verified-scope.md`** — se agrega la sección **analizada por el LLM** que consolida la
   ampliación y la cruza contra el estado real del código (`client/src`) y los specs vigentes,
   marcando qué entra en este cambio y qué queda diferido.
3. **`docs/specs/component-test-vehicles-table.md`** (el spec que declara las **instalaciones** del
   cliente) — se extiende §3 "Stack" con `@tanstack/react-router` (Routing) y `lucide-react` (Icons),
   y se actualiza la nota de §1 que declaraba el ruteo como *out of scope* (ahora lo cubre este
   chore).
4. **`docs/specs/architecture.md`** — se agrega la sección **"Ruteo y navegación"** (TanStack Router
   code-based en `app/router/`, layout persistente con sidebar + `Outlet`, pantallas placeholder por
   feature, mapa de rutas) y una carpeta `app/layout/` en la estructura del proyecto.

> Nota menor de documentación (no es un spec): `client/src/app/README.md` suma la entrada `layout/`
> para quedar consistente con la estructura `app/` de `architecture.md`.

## Fuera de alcance (diferido a specs de feature posteriores)

- El **ABMC** (Alta / Baja / Modificación / Consulta) real de Activos, Vehículos e Incidentes. En
  este cambio las pantallas son placeholders con su leyenda; el ABMC se especifica e implementa
  después, por entidad. Nota técnica a retomar en esos specs: el backend mock **no expone `PUT`,
  `PATCH` ni `DELETE`** (confirmado en `docs/METHODS.md` → "Limitaciones conocidas"), por lo que todo
  el ABMC vivirá en el **estado global del frontend** (patrón ya usado por la edición de vehículos:
  ver `verified-scope.md` §7.4), sin llamadas de escritura al backend.
- El contenido funcional de cada pantalla (mapa Leaflet real, tabs de tablas, filtros, mapa de
  calor, modales) definido en `verified-scope.md` secciones 3, 6 y 7.
- El wiring de `@radix-ui/themes` con los design tokens (ver [chore 02](./02-visual-alignment.md)),
  independiente de este cambio.

## Verificación post-implementación (para los specs derivados)

1. `pnpm --filter client typecheck` compila sin errores con el router code-based y el registro de
   rutas tipado.
2. `pnpm --filter client lint` / `format:check` pasan sobre los archivos nuevos.
3. Navegar entre las cinco rutas cambia solo el contenido (`Outlet`); la sidebar permanece montada
   (no se re-renderiza) — verificable visualmente y/o con un test de que el nodo de la sidebar
   persiste entre navegaciones.
4. Cada pantalla renderiza únicamente su leyenda (`Dashboard`, `Mapa`, `Activos`, `Vehículos`,
   `Incidentes`).
5. Coherencia documental: `scope.md`, `verified-scope.md`, `architecture.md` y
   `component-test-vehicles-table.md` referencian este chore y no se contradicen entre sí.
