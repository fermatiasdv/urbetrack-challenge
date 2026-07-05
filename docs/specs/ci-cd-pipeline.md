# SPEC — CI/CD: pipeline de validación, convención de ramas y Branch Protection sobre `main`

**Estado:** Aprobado — implementado
**Fecha:** 2026-07-05
**Relacionado:** monorepo pnpm (`api` + `client`), `pnpm-workspace.yaml`

## Objetivo

Configurar CI/CD para el proyecto de forma que:

1. Quede prohibido el trabajo directo sobre `main`.
2. Todo cambio se realice en una rama con prefijo `feat/`, `fix/`, `chore/`, `docs/`, `test/` o `refactor/`.
3. El nombre de la rama se valide automáticamente en CI.
4. Todo merge a `main` se realice mediante Pull Request, con checks obligatorios en verde (ver nota sobre aprobaciones en la sección "Pull Request obligatorio + Branch Protection sobre `main`").
5. El pipeline de CI ejecute lint, formato, tipado, tests, cobertura (mínimo 80% en statements/functions/branches/lines) y build; si cualquier etapa falla, el pipeline se cancela y el merge queda bloqueado.

**Nota de alcance:** la descripción original menciona "CI/CD", pero el detalle provisto (pipeline, cobertura, branch protection) es exclusivamente de **CI** (validación previa al merge). No se define ningún paso de despliegue (CD real: build de artefacto de release, publish, deploy a un ambiente). Este spec cubre únicamente CI + protección de rama; si se requiere CD, debe ser objeto de un spec separado (ver [Fuera de alcance](#fuera-de-alcance)).

## Estado actual del repo (diagnóstico)

Verificado antes de proponer cambios:

- No existe `.github/workflows/` — no hay pipeline de CI configurado hoy.
- Root `package.json` sólo tiene scripts `dev:*`, `build:*`, `test:client`, `lint:client` (filtrados por paquete). No existen `lint`, `format:check`, `typecheck`, `test`, `coverage`, `build` a nivel root ni un script de cobertura en ningún paquete.
- `client/package.json` tiene `dev`, `build` (`tsc -b && vite build`), `preview`, `test` (`vitest run`), `test:watch`, `lint` (`eslint .`). Tiene `.prettierrc` pero **ningún script de Prettier** (`format` / `format:check`). No tiene `typecheck` propio (hoy el tipado ocurre como parte de `build`, vía `tsc -b`). No tiene `@vitest/coverage-v8` instalado ni configuración de cobertura en `vite.config.ts`.
- `api/package.json` (`urban-hygiene-api`) sólo tiene `dev`, `build` (`tsc`), `start`. **No tiene lint, tests, ni Prettier configurados.**
- No existe Husky ni Commitlint en el repo.

Esto implica que, para cumplir el pipeline pedido, hay que **agregar scripts nuevos**, no sólo un workflow. Las decisiones de alcance para cubrir este gap están en la sección siguiente.

## Convención de ramas

Prefijos permitidos: `feat/`, `fix/`, `chore/`, `docs/`, `test/`, `refactor/`, seguidos de un slug en minúsculas (`[a-z0-9._-]+`). Ejemplos válidos: `feat/heatmap-toggle`, `fix/vehicle-status-color`. Regex de validación:

```
^(feat|fix|chore|docs|test|refactor)\/[a-z0-9._-]+$
```

La validación corre como el primer job del workflow (`validate-branch-name`), tanto en `pull_request` (contra `github.head_ref`) como en `push` a cualquier rama que no sea `main` (contra `github.ref_name`), para dar feedback apenas se pushea, sin esperar a abrir el PR.

## Pipeline CI (`.github/workflows/ci.yml`)

Disparadores:

```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches-ignore: [main]
```

Jobs:

1. **`validate-branch-name`** — corre la regex de la sección anterior. Si no matchea, falla el job (y por dependencia, se cancela el resto).
2. **`ci`** (`needs: validate-branch-name`):
   - `actions/checkout@v4`
   - `pnpm/action-setup@v4` (pin de versión igual al `packageManager` del root, hoy `9.15.9`)
   - `actions/setup-node@v4` con `node-version: 22` y `cache: 'pnpm'` (cache de dependencias pnpm — cubre el punto opcional; requiere que pnpm ya esté instalado por el step anterior)
   - `pnpm install --frozen-lockfile`
   - `pnpm lint`
   - `pnpm format:check`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm coverage`
   - `pnpm build`

Cada step corre en orden; si uno falla, GitHub Actions no ejecuta los siguientes y marca el job (y el check) como fallido — esto ya satisface "cancelar el pipeline". Al configurar estos jobs como *required status checks* en Branch Protection (ver más abajo), un check fallido bloquea el merge del PR.

### Scripts nuevos a agregar

Para que `pnpm lint` / `format:check` / `typecheck` / `test` / `coverage` / `build` existan a nivel root y se puedan invocar desde CI sin conocer la estructura interna del monorepo:

**Decisión de alcance (confirmada):** `api` queda **completamente excluida de la validación de CI** — ni lint, ni format:check, ni typecheck, ni test, ni coverage, **ni build**. Motivo: `api` no fue construida por este equipo y no se va a modificar; el pipeline de CI valida únicamente `client`. El check `ci` pasa si y sólo si `client` pasa todas sus etapas; `api` no participa del pipeline en absoluto (no se agrega ningún script ni step que la toque).

Root `package.json` — nuevos scripts (todos apuntan sólo a `client`):

| Script | Comando |
|---|---|
| `lint` | `pnpm --filter client lint` |
| `format:check` | `pnpm --filter client format:check` |
| `typecheck` | `pnpm --filter client typecheck` |
| `test` | `pnpm --filter client test` |
| `coverage` | `pnpm --filter client coverage` |
| `build` | `pnpm --filter client build` |

(`build:api` / `build:client` / `test:client` / `lint:client` existentes quedan sin cambios, para no romper flujos locales ya usados. `build:api` sigue existiendo como script local pero **no se invoca desde CI**.)

`client/package.json` — nuevos scripts:

| Script | Comando | Nota |
|---|---|---|
| `format` | `prettier --write .` | usa el `.prettierrc` ya existente |
| `format:check` | `prettier --check .` | falla (exit ≠ 0) si hay archivos sin formatear |
| `typecheck` | `tsc -b` | reutiliza el mismo type-check que ya corre hoy como primer paso de `build` (el `tsconfig.json` de `client` ya tiene `noEmit: true`, por eso no genera output) |
| `coverage` | `vitest run --coverage` | requiere agregar `@vitest/coverage-v8` como devDependency |

`client/vite.config.ts` — agregar bloque de cobertura dentro de `test`:

```ts
test: {
  // ...config existente...
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html'],
    thresholds: {
      statements: 80,
      functions: 80,
      branches: 80,
      lines: 80,
    },
  },
}
```

Con `thresholds` configurado, `vitest run --coverage` termina con exit code ≠ 0 si algún porcentaje queda por debajo del mínimo — esto es lo que hace fallar la etapa "Cobertura mínima" del pipeline.

## Pull Request obligatorio + Branch Protection sobre `main`

Configuración a aplicar manualmente en GitHub. Se usa **Rulesets** (Settings → Rules → Rulesets →
New branch ruleset), no la clásica "Branch protection rules" — es la interfaz vigente de GitHub
para este tipo de reglas.

- **Ruleset name:** cualquier nombre descriptivo (ej. `main-protection`).
- **Enforcement status:** `Active` (si queda en `Disabled` el ruleset no bloquea nada).
- **Bypass list:** vacía. Nadie (ni admins) puede saltearse las reglas — ver excepción de
  aprobaciones más abajo, que es un tema aparte de bypass.
- **Target branches:** `Add target` → `Include default branch` (cubre `main`).
- **Branch rules:**
  - **Require a pull request before merging** — activado, con **Required approvals: 0**
    (ver "Nota sobre aprobaciones" abajo).
  - **Require status checks to pass before merging** — activado, agregando como checks
    requeridos `validate-branch-name` y `ci` (nombres de los jobs del workflow; sólo aparecen en
    el buscador una vez que el workflow corrió al menos una vez). Tildar también **Require
    branches to be up to date before merging**.
  - **Block force pushes** — activado.
  - **Restrict deletions** — activado.
  - El resto de las reglas disponibles (Restrict creations/updates, Require linear history,
    Require signed commits, code scanning/quality, restricciones de archivos) no se usan — no
    están pedidas por el objetivo de este spec.

Con esta configuración, push directo a `main` queda bloqueado (todo cambio requiere PR), y el PR
no puede mergearse si `validate-branch-name` o `ci` fallan.

### Nota sobre aprobaciones (0 en vez de 1)

El objetivo original pedía "al menos una aprobación". En la práctica, **GitHub no permite que el
autor de un PR apruebe su propio PR**, ni siquiera siendo owner/admin del repo. Con un solo
contribuidor (caso actual de este proyecto), exigir 1 aprobación deja todos los PRs
imposibles de mergear — ningún PR propio podría juntar esa aprobación.

Se evaluaron dos alternativas:

- **(A, elegida) Required approvals: 0.** Se sigue exigiendo PR + checks en verde, pero no una
  aprobación externa que hoy no existe. Simple, y correcta para un repo de un solo contribuidor.
- **(B, descartada por ahora) Required approvals: 1 + el propio usuario en el Bypass list** (modo
  "For pull requests only"). Mantendría el requisito de aprobación para futuros colaboradores
  que no estén en el bypass, a costa de un ruleset más difícil de razonar hoy sin necesidad.

Si en el futuro se suman colaboradores, esto debería revisarse (subir a 1 aprobación real, ya que
en ese caso sí hay quién pueda aprobar el PR de otra persona).

## Opcional (a confirmar si se incluye en esta iteración)

- **Cache de dependencias pnpm:** ya incluido por defecto en el diseño de arriba (`cache: 'pnpm'` en `setup-node`), no es un extra a decidir.
- **Conventional Commits + Commitlint:** requiere agregar `@commitlint/cli`, `@commitlint/config-conventional`, `commitlint.config.cjs`, Husky (`.husky/commit-msg` corriendo `commitlint --edit "$1"`) y, opcionalmente, un job extra en CI (`pnpm dlx commitlint --from origin/main --to HEAD`) que valide todos los commits de un PR. No se implementa en este spec salvo aprobación explícita — de aprobarse, se documenta como adenda a este mismo archivo antes de implementar.

## Verificación post-implementación

1. `pnpm install --frozen-lockfile` corre limpio en la raíz.
2. `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm coverage`, `pnpm build` corren en verde localmente.
3. Push a una rama con nombre inválido (ej. `random-branch`) → falla `validate-branch-name`.
4. Push/PR desde `feat/algo` → `validate-branch-name` pasa.
5. PR con `validate-branch-name` o `ci` en rojo → botón de merge deshabilitado en GitHub.
6. Intento de push directo a `main` → rechazado por GitHub.
7. Bajar deliberadamente la cobertura de un archivo por debajo del 80% → `pnpm coverage` falla y el check `ci` queda en rojo, bloqueando el merge.

## Fuera de alcance

- Pipeline de **CD** (build de release, publish de artefactos, deploy a un ambiente/hosting) — ver [cd-pipeline.md](./cd-pipeline.md).
- Cualquier validación (lint, format:check, typecheck, test, coverage o build) sobre el paquete `api` (mock backend). No se toca ni se modifica.
- Implementación de Commitlint/Conventional Commits (queda como opcional a confirmar).
- Automatización de Branch Protection vía Terraform o la app "Settings" de Probot — se documentan los pasos/comando `gh api`, pero se aplican manualmente.
- Plantilla de Pull Request (`.github/pull_request_template.md`) — no fue pedida; puede agregarse como mejora menor si se aprueba.

## Estado de implementación

- ✅ **`.github/workflows/ci.yml`** — creado, con jobs `validate-branch-name` y `ci` (`needs: validate-branch-name`), tal como se diseñó arriba.
- ✅ **Root `package.json`** — agregados los scripts `lint`, `format:check`, `typecheck`, `test`, `coverage`, `build`, todos apuntando a `client`. `api` no fue tocada.
- ✅ **`client/package.json`** — agregados los scripts `format`, `format:check`, `typecheck`, `coverage`, y la devDependency `@vitest/coverage-v8@^2.1.2`.
- ✅ **`client/vite.config.ts`** — agregado el bloque `test.coverage` (`provider: 'v8'`, `thresholds` 80/80/80/80).
- ✅ **`client/.prettierignore`** — creado (`dist`, `coverage`, `*.tsbuildinfo`), no existía.
- ✅ **`pnpm-lock.yaml`** — actualizado (`pnpm install`) para reflejar la nueva dependencia; necesario para que `pnpm install --frozen-lockfile` funcione en CI.
- ✅ **`.gitignore`** — se agregó `client/vite.config.js`. Motivo: `tsc -b` (usado por `build` y por el nuevo `typecheck`) compila `tsconfig.node.json` (que sólo incluye `vite.config.ts`) y emite `vite.config.js`/`vite.config.d.ts` como artefacto junto al fuente; no estaba ignorado y ensuciaba el working tree / `pnpm lint`. No cambia ningún comportamiento de build.
- ✅ **`client/src/component-test/VehiclesTable.tsx`** — se corrió `prettier --write` una vez (sólo re-wrap de un import largo a multilínea, sin cambios de lógica). Fue necesario para que `format:check` (recién agregado) pase sobre el código ya existente.

### Verificación ejecutada

Se corrieron los 6 comandos del pipeline (`lint`, `format:check`, `typecheck`, `test`, `coverage`, `build`) de punta a punta contra el código real del repo, en un entorno aislado con dependencias reinstaladas desde cero (simulando un checkout limpio de CI). Resultado:

| Etapa | Resultado |
|---|---|
| `pnpm lint` | ✅ sin errores |
| `pnpm format:check` | ✅ sin errores (tras el fix de formato mencionado arriba) |
| `pnpm typecheck` | ✅ sin errores |
| `pnpm test` | ✅ 11/11 tests, 3 archivos |
| `pnpm coverage` | ✅ 83.46% statements, 88.05% branches, 90% functions, 83.46% lines — todos ≥ 80% |
| `pnpm build` | ✅ build de Vite generado en `client/dist` |

No se validó en esta iteración la parte de GitHub (Branch Protection, `validate-branch-name` corriendo en un PR real) porque requiere el repo empujado a GitHub y permisos de admin — queda pendiente como paso operativo del usuario, documentado en la sección correspondiente de este spec.

- ✅ **Ruleset sobre `main`** — decidido y documentado: `Required approvals: 0` (en vez de 1), por
  ser repo de un solo contribuidor y GitHub no permitir auto-aprobación de PRs propios. Ver
  "Nota sobre aprobaciones" en la sección correspondiente. Pendiente que el usuario lo cree en
  GitHub (Rulesets, no Branch protection classic) siguiendo esa sección.
- ⏳ **Pendiente: activar "Require status checks to pass before merging" en el ruleset.** Al crear
  el ruleset, GitHub rechazó guardarlo con ese check tildado y la lista de status checks vacía
  (`Required status checks cannot be empty`) — `validate-branch-name`/`ci` todavía no aparecían
  como sugerencias porque el workflow no había corrido en el repo. Se guardó el ruleset sin esa
  regla (resto de las reglas sí activas: PR obligatorio, block force pushes, restrict deletions).
  Falta volver a editarlo y tildar "Require status checks to pass before merging" agregando
  `validate-branch-name` y `ci` (más "Require branches to be up to date before merging"), una vez
  que el workflow haya corrido al menos una vez en el repo.
