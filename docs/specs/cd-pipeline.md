# SPEC — CD: despliegue automático de `client` a GitHub Pages

**Estado:** Aprobado (pendiente de implementación)
**Fecha:** 2026-07-05
**Relacionado:** [ci-cd-pipeline.md](./ci-cd-pipeline.md) (CI, branch protection), monorepo pnpm (`api` + `client`)

## Objetivo

Definir el pipeline de **CD** que el spec de CI dejó fuera de alcance: publicar automáticamente el build estático de `client` en GitHub Pages cada vez que se mergea a `main`, sin volver a validar lint/test/coverage (eso ya lo garantiza CI + branch protection antes del merge).

## Decisiones de alcance (confirmadas)

1. **Destino:** GitHub Pages, repo `fermatiasdv/urbetrack-challenge` → URL de tipo *project page* (`https://fermatiasdv.github.io/urbetrack-challenge/`), no dominio propio.
2. **Trigger:** push a `main` (o sea, cada PR mergeado). No hay deploy de preview por PR ni deploy manual.
3. **Ambientes:** uno solo (producción). No hay staging.
4. **Qué se publica:** únicamente el build de `client` (`client/dist`). `api` no participa del CD — no se publica ni se despliega (mismo criterio de exclusión que en CI: no se modifica ni se toca).

## Pre-requisito: `base` de Vite para GitHub Pages

Como es una *project page* (no `usuario.github.io` a secas), los assets se sirven bajo `/urbetrack-challenge/`, no en la raíz del dominio. Sin este cambio, el build funciona en `vite preview` local pero rompe en GitHub Pages (rutas de JS/CSS con 404).

`client/vite.config.ts` — agregar `base` condicionado a build de producción:

```ts
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/urbetrack-challenge/' : '/',
  plugins: [react()],
  // ...resto del config existente...
})
```

Se condiciona a `GITHUB_ACTIONS` (env var que setea Actions automáticamente) para no afectar `vite dev`/`vite preview` en local.

**Nota:** no hay router (`react-router` u otro) instalado hoy en `client`. Si se agrega en el futuro, va a requerir `basename="/urbetrack-challenge/"` en el router y un fallback de `404.html` (GitHub Pages no hace rewrite de rutas SPA nativamente). Fuera de alcance de este spec mientras no exista routing.

## Pipeline CD (`.github/workflows/cd.yml`)

Disparador:

```yaml
on:
  push:
    branches: [main]
```

Jobs:

1. **`build`**:
   - `actions/checkout@v4`
   - `pnpm/action-setup@v4` (mismo pin que CI, `9.15.9`)
   - `actions/setup-node@v4` (`node-version: 22`, `cache: 'pnpm'`)
   - `pnpm install --frozen-lockfile`
   - `pnpm build` (ya definido en CI: corre sólo `client`, vía filtro `--filter client`)
   - `actions/upload-pages-artifact@v3` apuntando a `client/dist`
2. **`deploy`** (`needs: build`, `environment: github-pages`):
   - `actions/deploy-pages@v4`

```yaml
permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: client/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

No se repite lint/test/coverage: para llegar a `main` el PR ya tuvo que pasar el check `ci` (branch protection, ver spec de CI). CD sólo reconstruye el artefacto de producción y lo publica.

## Configuración manual en GitHub (no versionable)

- **Settings → Pages → Source:** `GitHub Actions` (no "Deploy from a branch"). Sin este cambio, `actions/deploy-pages` falla porque Pages no está habilitado en modo Actions.
- **Settings → Environments → `github-pages`:** se crea automáticamente la primera vez que corre el job `deploy`; no requiere configuración adicional para este caso (un solo ambiente, sin protection rules extra).

## Verificación post-implementación

1. Mergear un PR a `main` → se dispara `cd.yml` automáticamente (visible en la pestaña Actions).
2. El job `build` sube el artefacto (`client/dist`) sin errores.
3. El job `deploy` publica y expone la URL en el summary del workflow y en Settings → Pages.
4. Abrir `https://fermatiasdv.github.io/urbetrack-challenge/` → la app carga sin 404 de assets (confirma que el `base` de Vite quedó bien seteado).
5. Un push directo a una rama que no sea `main` **no** dispara `cd.yml` (el trigger es sólo `push: branches: [main]`).

## Fuera de alcance

- Despliegue de `api` (mock backend) — no se toca, mismo criterio que CI.
- Ambiente de staging o preview por PR — sólo producción, confirmado.
- Rollback automatizado — GitHub Pages sirve el último deploy exitoso; un rollback manual implica re-ejecutar `cd.yml` sobre un commit anterior de `main` (`workflow_dispatch` con `ref`), no está implementado como paso automático.
- Dominio propio / DNS custom (`CNAME`) — no fue pedido; se usa el subdominio default de GitHub Pages.
- Soporte de rutas SPA (`404.html` fallback) — no aplica hoy porque no hay router; queda documentado como pendiente si se agrega routing.
