# SPEC — Fix: archivos huérfanos en la raíz + sacar `component-test` de la vista principal

**Estado:** Aprobado — implementado (ver §"Estado de implementación")
**Fecha:** 2026-07-05
**Relacionado:** `docs/specs/architecture.md` (define `client/src` como único árbol de código), `docs/specs/component-test-vehicles-table.md` (SPEC-002, origen de `component-test`), `docs/specs/ci-cd-pipeline.md`, `.gitignore`

## Objetivo

1. Eliminar del repo archivos y carpetas que no pertenecen a ningún paquete del workspace (`api`,
   `client`) ni cumplen ninguna función en build, test o runtime — quedaron sueltos por procesos
   externos al proyecto (descompresión de zip, entorno de trabajo, scaffolding previo al split a
   workspace) — y dejar en `.gitignore` una prevención para que no vuelvan a colarse.
2. Sacar el componente de prueba `client/src/component-test` de la vista principal (`App.tsx`) sin
   borrarlo, dejando documentado en el propio directorio que es solo una prueba de verificación de
   instalación (SPEC-002) y cómo importarlo manualmente si se lo quiere volver a ver.

## Diagnóstico — inventario de huérfanos detectados

Auditoría de la raíz del repo contra `pnpm-workspace.yaml` (`packages: api, client`):

1. **`_tmp_21_*`** (4 archivos, 0 bytes, en la raíz):
   `_tmp_21_09f8eb8f7fd9aac4842d7f3f445d73e6`, `_tmp_21_28b6bf1968e8836acee59e94d49df250`,
   `_tmp_21_42ccb06c6454a780e8ad565c82a5ee9b`, `_tmp_21_9089276677e6859aaf3b0fae83691827`.
   No pertenecen a `api` ni a `client`, no están referenciados en código ni configuración. 2 de los
   4 ya están staged en git (`git add` accidental). Origen: artefactos del entorno de trabajo
   (sandbox), ajenos al proyecto.

2. **`__MACOSX/`** (carpeta completa en la raíz, 19 archivos): metadata de macOS (`._*`,
   AppleDouble) generada al descomprimir un `.zip` en macOS — espeja 1:1 la estructura de `api/src`
   pero sin contenido útil (son punteros de recursos, no código). Ya están staged en git.

3. **`src/` (raíz, vacía)**: no es un package declarado en `pnpm-workspace.yaml`. El código real
   del frontend vive en `client/src` (ver `docs/specs/architecture.md`, que define ese árbol como
   único alcance). Resto de un scaffold anterior al split a workspace (`api/` + `client/`).

4. **`client/src/component-test/`**: no es huérfano en el sentido de "sin dueño" — es el PoC de
   SPEC-002, creado únicamente para verificar que el stack instalado funcionaba end-to-end con
   datos falsos. El problema es que hoy sigue siendo lo único que se renderiza en la vista
   principal (`client/src/App.tsx` importa y renderiza `VehiclesTable` directamente), como si fuera
   parte de la app real. Por decisión explícita del usuario: **no se borra** (código y tests se
   conservan), pero se saca de `App.tsx` y se documenta su propósito real dentro de la carpeta.

## Alcance

- Borrar del working tree y destrackear de git (donde ya estén staged/trackeados):
  - los 4 archivos `_tmp_21_*` en la raíz.
  - `__MACOSX/` completa (raíz).
  - `src/` (raíz, vacía).
- Agregar a `.gitignore` los patrones `_tmp_*` y `__MACOSX/`, para que no vuelvan a quedar
  trackeados si el proceso que los genera se repite.
- `client/src/App.tsx`: quitar el import y el render de `VehiclesTable` (queda una vista principal
  mínima, sin contenido de `component-test`).
- `client/src/component-test/README.md` (nuevo): documentar que el componente existe únicamente
  para verificar la instalación (SPEC-002), que no tiene otro uso, y cómo importarlo manualmente
  si se lo quiere volver a ver.

## Fuera de alcance

- Código sin uso dentro de `client/src` más allá de `component-test` (otros exports, imports o
  componentes sin consumidores). Es un problema distinto — análisis estático de código (ej.
  `knip`, `ts-prune`) — y ameritaría spec propio si se decide abordarlo.
- Cualquier feature real (map, incidents, vehicles, zones, filters) que eventualmente reemplace a
  `component-test` como vista principal — queda fuera, es trabajo de desarrollo nuevo, no de este
  fix.
- `api/`, `client/` (resto del contenido real de ambos packages), `docs/`, `.github/`, `API.md`,
  `DESAFIO TECNICO FRONTEND.pdf` (enunciado del desafío, no es un huérfano) — nada de esto se toca.

## Cambios propuestos

| Archivo/carpeta | Cambio | Motivo |
|---|---|---|
| `_tmp_21_09f8eb8f7fd9aac4842d7f3f445d73e6`, `_tmp_21_28b6bf1968e8836acee59e94d49df250`, `_tmp_21_42ccb06c6454a780e8ad565c82a5ee9b`, `_tmp_21_9089276677e6859aaf3b0fae83691827` | Borrar (working tree) + `git rm --cached` los que ya estén staged | No pertenecen al proyecto, 0 bytes, sin referencias |
| `__MACOSX/` | Borrar carpeta completa (working tree) + `git rm -r --cached` | Metadata de descompresión macOS, no es código ni se usa |
| `src/` (raíz) | Borrar carpeta vacía | No es un package del workspace; el código vive en `client/src` |
| `.gitignore` | Agregar `_tmp_*` y `__MACOSX/` | Prevenir que estos artefactos vuelvan a trackearse |
| `client/src/App.tsx` | Quitar `import { VehiclesTable } from './component-test/VehiclesTable'` y su render; dejar una vista principal mínima | Sacar el PoC de la vista principal sin borrar el componente |
| `client/src/component-test/README.md` | Crear (contenido abajo) | Documentar propósito real y cómo importarlo si se lo quiere ver |

### `client/src/App.tsx` — después del cambio

```tsx
function App(): JSX.Element {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Urbetrack</h1>
    </main>
  )
}

export default App
```

### `client/src/component-test/README.md` — contenido propuesto

```md
# component-test

Este directorio (`VehiclesTable`, `PlateCell`, `useVehiclesStore`, `useVehiclesQuery`, `data.ts`,
`plate.ts`, `types.ts` y sus tests) se creó **únicamente** para verificar que el stack instalado en
`client/` (Vite, React Query, Zustand, TanStack Table, Radix Themes, Zod, Vitest + RTL) funcionaba
correctamente de punta a punta, usando datos falsos locales (ver `docs/specs/component-test-vehicles-table.md`,
SPEC-002).

No es parte de ninguna feature real ni de la arquitectura definitiva del proyecto
(`docs/specs/architecture.md`) y no debe usarse como base para desarrollo nuevo.

## Ya no se ve en la vista principal

`App.tsx` dejó de renderizar `VehiclesTable`. Si en algún momento se quiere volver a verlo en
pantalla, importarlo manualmente (no commitear el cambio):

\```tsx
// client/src/App.tsx (temporal)
import { VehiclesTable } from './component-test/VehiclesTable'

function App(): JSX.Element {
  return (
    <main style={{ padding: '2rem' }}>
      <VehiclesTable />
    </main>
  )
}

export default App
\```

Con `pnpm dev:client` corriendo vas a ver la tabla de vehículos con datos fake (incluye un delay
simulado de carga).

## Tests

Los tests (`VehiclesTable.test.tsx`, `plate.test.ts`, `store.test.ts`) se conservan y siguen
corriendo con `pnpm test:client` — siguen sirviendo para validar que el entorno de testing
funciona.
```

## Verificación

1. `git status` no debe mostrar ninguno de los elementos listados arriba (ni como tracked ni como
   untracked).
2. Confirmar que `pnpm install`, `pnpm build`, `pnpm test` y `pnpm typecheck` siguen funcionando
   igual que antes del cleanup (ninguno de los elementos borrados era una dependencia real).
3. Prueba de regresión del `.gitignore`: crear un archivo dummy `_tmp_test` y una carpeta
   `__MACOSX/` de prueba y confirmar que `git status` los reporta como ignorados, no como untracked.
4. `client/src/component-test/` sigue existiendo completo (código + tests), y `pnpm test:client`
   sigue corriendo y pasando sus tests sin cambios.
5. La vista principal (`pnpm dev:client`) ya no muestra la tabla de vehículos fake.
6. `client/src/component-test/README.md` existe y su contenido coincide con lo definido en este
   spec.

## Estado de implementación

- ✅ Los 4 `_tmp_21_*` borrados del working tree; los 2 que estaban staged, destrackeados
  (`git rm --cached`).
- ✅ `__MACOSX/` borrada completa del working tree; destrackeada (`git rm -r --cached`).
- ✅ `.gitignore` — ya contenía `__MACOSX/` y `_tmp_*` (no hizo falta agregarlos).
- ✅ `client/src/App.tsx` — se sacó el import y el render de `VehiclesTable`; vista principal
  mínima (ver contenido arriba).
- ✅ `client/src/component-test/README.md` — creado con el contenido definido en este spec.
- ⚠️ `src/` (raíz, vacía) — **no se pudo borrar** desde este entorno: devuelve `Permission denied`
  incluso después de habilitar el borrado de archivos para la carpeta del proyecto (el mismo
  mecanismo sí funcionó para los `_tmp_21_*` y para `__MACOSX/`, pero no para este directorio
  vacío puntual). No afecta a git (no trackea carpetas vacías) ni al build/test. Pendiente:
  borrarlo a mano desde el explorador de Windows.
- ⚠️ Verificación con `pnpm typecheck` / `pnpm test:client` / `pnpm build` **no se pudo correr**
  desde este entorno: el sandbox de shell no tiene `pnpm` disponible y, al intentar invocarlo vía
  `corepack`, se detectó que la copia de `package.json` / `client/package.json` que ve el shell
  está truncada — mientras que el archivo real (visto con las herramientas de archivo) está
  completo y bien formado. Es un problema del entorno de este chat, no del contenido real del
  repo. Recomendado correr esos tres comandos localmente para terminar de confirmar que el
  cleanup no rompió nada.
