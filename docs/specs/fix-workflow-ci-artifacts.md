# SPEC — Fix: artefactos de `tsc -b` (`vite.config.js` / `.d.ts`) rompiendo `format:check` en CI

**Estado:** Aprobado
**Fecha:** 2026-07-05
**Relacionado:** `docs/fix/03-workflow-ci.md` (FIX-003), `docs/specs/ci-cd-pipeline.md`, `.github/workflows/ci.yml`

## Objetivo

Eliminar la causa raíz por la que `tsc -b` genera artefactos compilados (`vite.config.js`,
`vite.config.d.ts`) al lado de `client/vite.config.ts`, de forma que:

1. Esos artefactos no vuelvan a colarse en un commit (uno ya se subió y rompió el job `ci` — ver
   `docs/fix/03-workflow-ci.md`).
2. El fix sea robusto a futuro: si se agrega otro archivo a `tsconfig.node.json` → `include`, no
   debe hacer falta acordarse de ignorar un artefacto más por nombre.

## Diagnóstico (resumen — detalle completo en `docs/fix/03-workflow-ci.md`)

`client/tsconfig.node.json` tiene `"composite": true`, lo que fuerza `declaration: true` en
TypeScript. Al correr `tsc -b` (parte de `build` y de `typecheck`), este sub-proyecto (que solo
incluye `vite.config.ts`) emite `vite.config.js` y `vite.config.d.ts` en el mismo directorio que el
fuente. `client/vite.config.js` ya estaba en `.gitignore` (agregado al implementar
`docs/specs/ci-cd-pipeline.md`), pero `vite.config.d.ts` no — quedó trackeado, se pusheó, y
`prettier --check .` falla en CI porque ese archivo no tiene el formato de `.prettierrc`.

## Enfoque elegido

**Opción B** de `docs/fix/03-workflow-ci.md`: redirigir el output de `tsconfig.node.json` a una
carpeta dedicada (`client/.tsbuild-node/`) en vez de emitir al lado del fuente, e ignorar esa
carpeta completa. Se prefiere sobre la Opción A (agregar el archivo puntual a `.gitignore`) porque
generaliza: cualquier artefacto futuro que `tsconfig.node.json` genere cae dentro de la misma
carpeta ignorada, sin depender de acordarse de cada nombre de archivo.

## Cambios

| Archivo | Cambio | Motivo |
|---|---|---|
| `client/tsconfig.node.json` | Agregar `"outDir": "./.tsbuild-node"` a `compilerOptions` | Saca el output de `tsc -b` del directorio de `client/`, a una carpeta dedicada |
| `.gitignore` | Reemplazar la línea `client/vite.config.js` por `client/.tsbuild-node/` | La carpeta cubre `vite.config.js` y `vite.config.d.ts` (y cualquier artefacto futuro) en un solo patrón |
| `client/vite.config.d.ts`, `client/vite.config.js` (si existe) | Borrar del working tree | Ya no se generan ahí; el próximo `pnpm build`/`typecheck` los regenera dentro de `.tsbuild-node/` |

No se modifica `tsconfig.json` (el del proyecto principal `src/`), ni el comportamiento de
`vite build` (que sigue leyendo `vite.config.ts` directamente vía Vite/esbuild, no vía el output de
`tsc -b`) ni la lógica de la app.

## Acción pendiente del usuario (git, en su máquina Windows)

`client/vite.config.d.ts` ya está **trackeado y pusheado** (commit `1b64c3b`,
`chore/cicd-implementation`). Borrarlo del working tree y ajustar `.gitignore` no alcanza para
sacarlo de git — hace falta destrackearlo explícitamente:

```powershell
git rm --cached client/vite.config.d.ts
git add .gitignore client/tsconfig.node.json
git commit -m "fix: redirigir artefactos de tsc -b a carpeta ignorada, destrackear vite.config.d.ts"
git push
```

(Esto no se ejecuta desde este entorno porque las operaciones de `git commit`/`push` las viene
haciendo el usuario directamente en su máquina — ver también la nota equivalente en
`docs/fix/02-broken-branch-index-lock.md` sobre por qué el git de este sandbox no es la fuente de
verdad para escribir commits.)

## Verificación post-implementación

1. Borrar `client/.tsbuild-node` (si existe) y correr `pnpm build` (o `pnpm typecheck`) desde cero:
   los artefactos deben aparecer en `client/.tsbuild-node/`, no en `client/` junto al fuente.
2. `git status` no debe mostrar `vite.config.js` ni `vite.config.d.ts` como untracked/modified.
3. `pnpm format:check` pasa sin warnings.
4. Después del `git rm --cached` + push del usuario, re-disparar el job `ci` del PR y confirmar que
   el step "Formato (Prettier)" pasa en verde.

## Estado de implementación

- ✅ `client/tsconfig.node.json` — agregado `outDir`.
- ✅ `.gitignore` — reemplazada la línea puntual por `client/.tsbuild-node/`.
- ✅ `client/vite.config.d.ts` (y `client/vite.config.js`, regenerado durante la verificación local)
  — borrados del working tree.
- ✅ Verificado localmente (entorno aislado, simulando checkout limpio): `pnpm typecheck` y
  `pnpm build` generan los artefactos dentro de `client/.tsbuild-node/` y ya no aparecen sueltos en
  `client/`; `pnpm format:check` pasa sin warnings.
- ⏳ **Pendiente del usuario:** `git rm --cached client/vite.config.d.ts` + commit + push (comandos
  arriba), para que el archivo salga del repo remoto y el job `ci` del PR pase.
