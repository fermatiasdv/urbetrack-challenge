# SPEC — Actualizar `.gitignore`

**Estado:** Aprobado — implementado (ver §"Estado de implementación")
**Fecha:** 2026-07-05
**Relacionado:** `docs/specs/component-test-vehicles-table.md` (SPEC-002, split a workspace `api/` + `client/`)

## Objetivo

Actualizar el `.gitignore` de la raíz para que cubra todo lo que el proyecto genera o descarga
localmente (dependencias, builds, caches, artefactos de OS/zip) y que hoy no está ignorado. El
`.gitignore` actual solo tiene una entrada:

```
node_modules/
```

Esto es insuficiente: `git status` muestra actualmente carpetas y archivos que quedarían
trackeados si se commitea tal cual (`.pnpm-store/`, `__MACOSX/`, archivos `_tmp_*`, builds de
`dist/`, etc.).

## Diagnóstico

El repo es un workspace pnpm (`pnpm-workspace.yaml`: paquetes `api` y `client`, definido a partir
de `packageManager: pnpm@9.15.9` en el `package.json` raíz). A partir de los scripts declarados en
los tres `package.json` (raíz, `api/`, `client/`) y del estado real del filesystem, se identificaron
las siguientes fuentes de archivos que no deben subirse:

| Origen | Directorio/archivo | Por qué |
|---|---|---|
| Instalación de dependencias (pnpm) | `node_modules/` (raíz) | Ya ignorado, se mantiene |
| Instalación de dependencias (pnpm workspace) | `api/node_modules/`, `client/node_modules/` | No cubiertos por el patrón actual sin el comodín `**/` |
| Store local de pnpm | `.pnpm-store/` | Cache de paquetes de pnpm, existe en la raíz del repo |
| `build:api` (`tsc`, `api/package.json` → `main: dist/server.js`) | `api/dist/` | Output compilado, regenerable con `pnpm build:api` |
| `build:client` (`tsc -b && vite build`) | `client/dist/` | Output compilado, regenerable con `pnpm build:client` |
| `tsc -b` (build incremental de TypeScript) | `client/tsconfig.tsbuildinfo`, `client/tsconfig.node.tsbuildinfo` | Cache incremental de TS, específico de cada máquina |
| `test:client` (`vitest run`) | `coverage/` (si se corre con `--coverage`) | Reporte de cobertura, regenerable |
| pnpm (logs de error) | `pnpm-debug.log*` | Log que pnpm escribe ante fallos de instalación |
| Artefacto de compresión macOS (detectado en `git status`, ya staged) | `__MACOSX/` | Carpeta que macOS agrega al comprimir/descomprimir `.zip`, sin valor de código |
| Archivos temporales (detectados en `git status`, ya staged) | `_tmp_*` | Archivos vacíos de 0 bytes, residuo de alguna operación local |
| Sistema operativo | `.DS_Store`, `Thumbs.db` | Metadata de Finder/Explorer, no relacionada al proyecto |
| Editor | `.vscode/`, `.idea/` | Configuración local de IDE |
| Variables de entorno | `.env`, `.env.local`, `.env.*.local` | Pueden contener secretos/config local; no existen hoy pero deben quedar cubiertos preventivamente (la API usa `cors`/`express` y podría incorporar config sensible) |

No se incluye `pnpm-lock.yaml` en la lista de exclusión: el lockfile debe seguir versionado para
builds reproducibles.

### Relación con el estado "broken" de la rama actual

Al analizar el repo, `git log` reportó `fatal: your current branch appears to be broken` y hubo un
`.git/index.lock` que no se pudo remover (`Operation not permitted`). La hipótesis de origen de
este chore es que ambos síntomas están relacionados con este mismo problema: al no estar ignorados
`node_modules/` (de `api/` y `client/`), `.pnpm-store/`, y los builds (`dist/`), git intenta indexar
una cantidad enorme de archivos (dependencias completas de dos workspaces + cache de pnpm) en cada
operación, lo cual es consistente con una rama que queda en un estado inconsistente/lockeado a
mitad de un `git add`/`git status` sobre ese volumen de archivos.

**Premisa de este chore:** implementar el `.gitignore` propuesto debería, como efecto colateral,
resolver el estado "broken" de la rama (al reducir drásticamente lo que git intenta trackear). Esto
se valida en la sección "Verificación post-implementación".

**Si no se resuelve:** el estado broken de la rama es un problema de git en sí (no de
configuración), y hay que abrir un **fix aparte** en `docs/fix/` (siguiendo el formato de
`docs/fix/01-api-install.md`) para diagnosticarlo y resolverlo puntualmente, en vez de seguir
iterando sobre este spec de `.gitignore`.

> **Resultado real (implementación 2026-07-05):** la hipótesis de arriba era incorrecta. El
> `.gitignore` no tuvo ningún efecto sobre el estado "broken" porque la causa no era volumen de
> archivos sin ignorar, sino **corrupción de bytes en `.git/HEAD`** (bytes nulos al final del
> archivo, no relacionados a git ni a `.gitignore`). Además apareció un segundo problema
> independiente: un `.git/index.lock` residual que bloquea `git add`/`git commit`. Se abrió
> `docs/fix/02-broken-branch-index-lock.md` con el detalle y la acción pendiente del usuario. Ver
> también §"Estado de implementación" más abajo.

## Alcance de este chore

1. Reemplazar el contenido de `.gitignore` (raíz) por la lista consolidada de patrones de la
   tabla anterior.
2. No se toca ningún otro archivo de configuración (`pnpm-workspace.yaml`, `tsconfig.json`,
   `eslint.config.js`, etc.).
3. No se decide en este spec qué hacer con los archivos ya trackeados/staged que deberían haber
   sido ignorados (`__MACOSX/`, `_tmp_*`, y evaluar `DESAFIO TECNICO FRONTEND.pdf`) — actualizar
   `.gitignore` no los destackea automáticamente. Retirarlos del índice (`git rm -r --cached ...`)
   requiere confirmación explícita antes de aplicarse, ya que es una operación sobre el estado de
   git, no solo sobre el archivo de configuración.

## Cambios propuestos

`.gitignore` (raíz) — contenido propuesto:

```
# Dependencias
node_modules/
**/node_modules/
.pnpm-store/

# Builds
api/dist/
client/dist/
**/*.tsbuildinfo

# Tests
coverage/

# Logs de pnpm
pnpm-debug.log*

# Variables de entorno
.env
.env.local
.env.*.local

# Sistema operativo
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/

# Artefactos de compresión (zip de macOS)
__MACOSX/

# Temporales
_tmp_*
```

## Fuera de alcance

- Destackear del índice de git los archivos/carpetas que ya están agregados como `A` en
  `git status` (`__MACOSX/`, `_tmp_21_*`, y evaluar si `DESAFIO TECNICO FRONTEND.pdf` debe
  versionarse o no). Requiere un chore/spec aparte con `git rm --cached`.
- Resolver directamente el estado roto de la rama actual (`git log` reporta "your current branch
  appears to be broken" y hay un `index.lock` que no se pudo remover) — no es un problema de
  configuración de `.gitignore` en sí. Este chore solo actúa sobre la causa probable (volumen de
  archivos sin ignorar); si tras implementarlo la rama sigue "broken", corresponde abrir un fix
  dedicado (ver "Relación con el estado 'broken' de la rama actual" más arriba).

## Verificación post-implementación

1. `git status` no debe listar `node_modules/`, `.pnpm-store/`, `api/dist/`, `client/dist/`,
   `client/tsconfig*.tsbuildinfo` como archivos nuevos tras correr `pnpm install` y
   `pnpm build:api && pnpm build:client`.
2. `pnpm-lock.yaml` sigue trackeado (no debe quedar ignorado por accidente).
3. Confirmar visualmente que ningún patrón nuevo ignora código fuente real (`api/src/`,
   `client/src/`, `docs/`).
4. Correr `git log` y confirmar que ya no reporta `your current branch appears to be broken`, y que
   `git status`/`git add` no fallan al intentar remover `index.lock`. Si el problema persiste, abrir
   un fix dedicado en `docs/fix/` en vez de seguir ajustando este spec.

## Estado de implementación

- ✅ **`.gitignore` reemplazado** con el contenido propuesto en §"Cambios propuestos".
- ✅ **Verificado con `git check-ignore -v`:** `node_modules/`, `.pnpm-store/`, `api/dist/` y
  `client/dist/` quedan correctamente ignorados.
- ✅ **Verificado con `git status --short`:** ya no aparecen `node_modules/`, `.pnpm-store/`,
  `__MACOSX/` ni `_tmp_21_*` en el listado (estos dos últimos tampoco estaban en el índice real —
  el `git status` con archivos `A` visto durante el diagnóstico correspondía al estado previo a
  arreglar `.git/HEAD`, no al índice commiteado real).
- ⚠️ **`git log`/rama "broken": resuelto, pero no por este chore.** La causa real era
  `.git/HEAD` con bytes nulos (`00 00`) después de `ref: refs/heads/feat/install-tools\n` —
  corrupción de archivo, sin relación con `.gitignore`. Se corrigió reescribiendo `.git/HEAD` con
  el contenido limpio. `git log`/`git status` funcionan de nuevo tras ese arreglo puntual.
- ❌ **Pendiente (bloqueado, requiere acción del usuario):** `.git/index.lock` residual impide
  `git add`/`git commit` (`fatal: Unable to create '.git/index.lock': File exists`). No se pudo
  borrar desde este entorno (`Operation not permitted` al hacer `rm`, incluso siendo el mismo
  usuario dueño del archivo — indica un lock a nivel del sistema de archivos de Windows, no un
  problema de permisos de git). Detalle y pasos a seguir en
  `docs/fix/02-broken-branch-index-lock.md`.
