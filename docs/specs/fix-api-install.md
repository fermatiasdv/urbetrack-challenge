# SPEC — Fix instalación de dependencias en `api` (`Cannot find module 'express'`)

**Estado:** Aprobado — implementado parcialmente (ver §"Estado de implementación")
**Fecha:** 2026-07-05
**Relacionado:** `docs/fix/01-api-install.md`, `docs/specs/component-test-vehicles-table.md` (SPEC-002, split a workspace)

## Objetivo

Resolver el error `Cannot find module 'express'` al correr `pnpm dev:api`, sin modificar el
comportamiento del servidor ni sus dependencias declaradas.

## Diagnóstico (resumen)

`express` está correctamente declarado en `api/package.json`, pero no está linkeado en
`api/node_modules` en la máquina donde se corre el comando. En un pnpm workspace,
`api/node_modules/express` debe ser un link (junction en Windows) hacia el store del root
(`node_modules/.pnpm/...`); si ese link no existe, `tsx` no puede resolver el módulo aunque la
dependencia esté listada.

Causas más probables, dado que el split a workspace (`api/` + `client/`) es de hoy (SPEC-002):

1. No se corrió `pnpm install` desde la raíz después del split.
2. Se corrió `npm install` (en vez de `pnpm install`) en algún punto, rompiendo el layout que
   pnpm espera.
3. Instalación parcial/interrumpida, o `api/node_modules` borrado sin reinstalar desde la raíz.
4. Mismatch de versión de pnpm: root fija `packageManager: pnpm@9.15.9`, `api/package.json` fija
   `pnpm@11.5.1`. Dos versiones de pnpm operando sobre el mismo workspace pueden producir un
   `node_modules` inconsistente.

Detalle completo en `docs/fix/01-api-install.md`.

## Alcance de este fix

1. **Reinstalación limpia de dependencias** desde la raíz (acción operativa, no cambia código):
   - Borrar `node_modules`, `api/node_modules`, `client/node_modules`.
   - Correr `pnpm install` desde `<root>`.
2. **Alinear versión de pnpm** entre root y `api`, para eliminar la causa #4:
   - `api/package.json` → `"packageManager": "pnpm@11.5.1"` → `"packageManager": "pnpm@9.15.9"`.

## Cambios propuestos

| Archivo | Cambio | Motivo |
|---|---|---|
| `api/package.json` | `packageManager`: `pnpm@11.5.1` → `pnpm@9.15.9` | Alinear con el root; evita instalaciones con dos versiones distintas de pnpm sobre el mismo workspace |

No se modifican dependencias (`dependencies`/`devDependencies` quedan iguales), ni código fuente,
ni `pnpm-workspace.yaml`.

## Fuera de alcance

- No se actualiza ninguna dependencia (`express`, `tsx`, etc. quedan en las versiones actuales).
- No se investigan causas ambientales adicionales (antivirus/OneDrive interfiriendo con
  junctions de Windows) salvo que la reinstalación no resuelva el problema — ver §5 de
  `docs/fix/01-api-install.md` si eso ocurre.

## Verificación post-implementación

1. `pnpm install` desde la raíz corre sin errores y sin warning de lockfile desactualizado.
2. `api\node_modules\express` existe.
3. `pnpm dev:api` levanta el servidor sin `MODULE_NOT_FOUND`.
4. `pnpm build:api` (`tsc`) sigue compilando en modo `strict` sin errores.

## Estado de implementación

- ✅ **Cambio de código aplicado:** `api/package.json` → `packageManager: pnpm@9.15.9`. Verificado
  intacto (root, `api/`, `client/` — los tres `package.json` están bien tras la limpieza manual
  de `node_modules`).
- ✅ `node_modules` (root, `api/`, `client/`) borrados por el usuario a mano (vía Explorer, porque
  `rmdir /s /q` no corre en PowerShell — ver detalle en `docs/fix/01-api-install.md` §6).
- ⚠️ `corepack enable` falló con `EPERM` al intentar escribir shims en
  `C:\Program Files\nodejs\yarnpkg` (permisos, requiere admin). **No es necesario para este fix**:
  el `pnpm` global ya funciona en esta máquina (se ve en el trace original del error, que llegó a
  invocar `tsx` correctamente), así que se puede omitir ese paso por completo. Detalle en
  `docs/fix/01-api-install.md` §6.3.
- ⏳ **Pendiente:** correr, en la máquina Windows real (PowerShell):
  ```
  pnpm install
  pnpm dev:api
  ```
  Luego validar contra la sección "Verificación post-implementación".
