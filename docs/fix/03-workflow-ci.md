# Fix — CI falla en `format:check` por `client/vite.config.d.ts` committeado

- **ID:** FIX-003
- **Status:** Diagnosticado — pendiente de spec para aplicar el fix
- **Related:** `docs/specs/ci-cd-pipeline.md` (SPEC del workflow), `.github/workflows/ci.yml`
- **Date:** 2026-07-05

## 1. Síntoma

Al abrir el PR hacia `main` con el workflow de CI (`docs/specs/ci-cd-pipeline.md`), el job `ci` falla
en el step `Formato (Prettier)`:

```
Checking formatting...
[warn] vite.config.d.ts
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
/home/runner/work/urbetrack-challenge/urbetrack-challenge/client:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  client@0.1.0 format:check: `prettier --check .`
Exit status 1
 ELIFECYCLE  Command failed with exit code 1.
Error: Process completed with exit code 1.
```

## 2. Causa raíz

`client/tsconfig.node.json` tiene `"composite": true`. TypeScript **fuerza `declaration: true`** en
todo proyecto `composite` (es un requisito del sistema de project references, no algo opcional) —
por eso, al correr `tsc -b` (usado por `build` y por el nuevo `typecheck`), además del ya conocido
`client/vite.config.js` también se emite **`client/vite.config.d.ts`** como artefacto compilado al
lado de `client/vite.config.ts`.

Confirmado con `cat client/vite.config.d.ts`:

```ts
declare const _default: import("vite").UserConfig;
export default _default;
```

Al implementar `docs/specs/ci-cd-pipeline.md` se agregó `client/vite.config.js` a `.gitignore`
(sección "Estado de implementación" de ese spec) precisamente porque `tsc -b` lo genera, pero **se
pasó por alto el archivo `.d.ts` gemelo** — mismo origen, mismo problema, y no quedó ignorado.

Evidencia (`git fetch` + inspección del commit ya pusheado, `1b64c3b` en
`chore/cicd-implementation`):

```
$ git ls-tree -r origin/chore/cicd-implementation --name-only | grep vite.config
client/vite.config.d.ts
client/vite.config.ts

$ git show origin/chore/cicd-implementation:.gitignore
...
client/vite.config.js
...
```

`vite.config.d.ts` no aparece en `.gitignore`, por lo que quedó trackeado y se subió al pushear.
En CI, el `checkout` trae ese archivo ya presente (no se regenera ahí — nadie corrió `tsc -b`
todavía en ese job en el momento del fallo), y `prettier --check .` lo encuentra sin el formato de
`.prettierrc` del proyecto (viene con el estilo por defecto del compilador de TypeScript, no de
Prettier), así que el step falla.

## 3. Alcance del fix (a definir en el spec correspondiente)

Dos enfoques posibles, no excluyentes:

**Opción A — completar el gitignore + destrackear (mínimo, análogo a lo ya hecho):**
- Agregar `client/vite.config.d.ts` a `.gitignore`.
- `git rm --cached client/vite.config.d.ts` para destrackearlo (ya está commiteado, `.gitignore`
  solo previene *futuros* `git add`).

**Opción B — redirigir el output de `tsconfig.node.json` a una carpeta ignorada (más robusto):**
- Agregar `"outDir": "./.tsbuild-node"` (o similar) a `client/tsconfig.node.json`, e ignorar esa
  carpeta completa en `.gitignore` (patrón único, en vez de archivo por archivo).
- Evita que el problema se repita si en el futuro se agrega otro archivo a
  `tsconfig.node.json` → `include` (ej. si se separa `vitest.config.ts`) y alguien vuelve a olvidar
  el `.gitignore` puntual.

No se aplica ningún cambio todavía: según las instrucciones del proyecto, corresponde generar
(o actualizar) el spec antes de tocar código — ver seguimiento en `docs/specs/ci-cd-pipeline.md`.

## 4. Verificación pendiente (una vez aprobado y aplicado el fix)

1. `client/vite.config.d.ts` (y `client/vite.config.js`) no aparecen en `git status` después de
   correr `pnpm build` o `pnpm typecheck` localmente.
2. `pnpm format:check` pasa en limpio, sin warnings sobre archivos generados.
3. Re-disparar el job `ci` en el PR abierto (push vacío o nuevo commit) y confirmar que el step
   "Formato (Prettier)" pasa en verde.
