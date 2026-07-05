# Fix — `pnpm dev:api` fails with `Cannot find module 'express'`

- **ID:** FIX-001
- **Status:** Diagnosed
- **Related:** `docs/specs/component-test-vehicles-table.md` (SPEC-002, monorepo split into `api/` + `client/`)
- **Date:** 2026-07-05

## 1. Symptom

Running `pnpm dev:api` from the repo root fails immediately:

```
> urbetrack-desafio@1.0.0 dev:api
> pnpm --filter urban-hygiene-api dev

> urban-hygiene-api@1.0.0 dev
> tsx watch src/server.ts

node:internal/modules/cjs/loader:1456
Error: Cannot find module 'express'
Require stack:
- ...\api\src\app.ts
- ...\api\src\server.ts
```

## 2. Root cause

`express` is declared correctly in `api/package.json` (`"express": "^4.19.2"`), so this is not a
missing/wrong dependency — it's a **missing or broken local install**. In a pnpm workspace,
`api/node_modules/express` must exist as a link (symlink on macOS/Linux, junction on Windows)
into the root's content-addressable store (`node_modules/.pnpm/...`). If that link is absent,
`tsx` can't resolve `express` from `api/src/app.ts` even though the dependency is listed.

The most likely triggers, in order of probability given this repo was just split into a pnpm
workspace (`api/` + `client/`) per SPEC-002:

1. **`pnpm install` was never (re-)run from the workspace root** after the split. Moving `api/`
   into the workspace changes how its dependencies are hoisted/linked; an install done before the
   split, or an install done only inside `api/`, won't produce the correct workspace links.
2. **`npm install` (or `yarn`) was run instead of `pnpm install`**, anywhere in the tree. This
   creates a conflicting, non-workspace-aware `node_modules` that can shadow or break pnpm's
   linked structure.
3. **Partial/interrupted install** — `node_modules` exists but is incomplete (e.g. install was
   cancelled, or `api/node_modules` was deleted manually without re-running install from root).
4. **pnpm version mismatch** between root and `api/`:
   - root `package.json` → `"packageManager": "pnpm@9.15.9"`
   - `api/package.json` → `"packageManager": "pnpm@11.5.1"`

   These should be aligned. Running installs with two different pnpm versions against the same
   workspace can produce inconsistent `node_modules` layouts.

## 3. Fix

Run all commands from the **repo root** (`<root>`), using `pnpm` only — never `npm`/`yarn` inside
`api/` or `client/`.

1. **Clean reinstall:**
   ```
   rmdir /s /q node_modules
   rmdir /s /q api\node_modules
   rmdir /s /q client\node_modules
   pnpm install
   ```
   (Keep `pnpm-lock.yaml` — do not delete it unless `pnpm install` itself reports it's out of sync.)

2. **Confirm pnpm version used matches the root pin:**
   ```
   corepack enable
   pnpm -v
   ```
   Expect `9.15.9` (root's `packageManager`). If a different version prints, run:
   ```
   corepack prepare pnpm@9.15.9 --activate
   ```

3. **Re-run:**
   ```
   pnpm dev:api
   ```

## 4. Verification

- `pnpm install` completes with no errors and no "lockfile out of date" warning.
- `api\node_modules\express` exists (junction into the root pnpm store).
- `pnpm dev:api` starts the server without `MODULE_NOT_FOUND`.

## 5. Follow-ups (not applied in this fix, need separate approval)

- If the clean reinstall doesn't resolve it on this machine, check for antivirus/OneDrive
  interference with pnpm's Windows junctions inside `node_modules` — a common cause of silently
  broken links when the repo lives inside a synced folder.

> Update: the `packageManager` alignment below was approved and applied — see
> `docs/specs/fix-api-install.md` and the execution log in §6.

## 6. Execution log (2026-07-05)

Real-world deviations from the plan above, kept here so the next person hitting this doesn't
repeat the same dead ends:

1. **`rmdir /s /q` "not recognized".** The user's shell is PowerShell, where `rmdir` is aliased
   to `Remove-Item` and doesn't accept cmd.exe flags (`/s`, `/q`). PowerShell equivalent:
   ```
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Recurse -Force api\node_modules
   Remove-Item -Recurse -Force client\node_modules
   ```

2. **`node_modules` folders removed by hand (Explorer)** instead of via shell, after the
   `rmdir` command failed. Functionally equivalent — no issue. (`package.json` files at root,
   `api/` and `client/` were checked afterward and are intact/unaffected.)

3. **`corepack enable` failed:**
   ```
   Internal Error: EPERM: operation not permitted, open 'C:\Program Files\nodejs\yarnpkg'
   ```
   `corepack enable` tries to write shim executables (`pnpm`, `pnpx`, `yarn`, `yarnpkg`, ...)
   inside the Node.js install directory (`C:\Program Files\nodejs`). A regular (non-admin)
   terminal doesn't have write access there → `EPERM`. This is a permissions issue, not a
   project/dependency issue.

   **Resolution: `corepack enable` is not required for this fix and can be skipped.** The
   original error trace already showed `pnpm --filter urban-hygiene-api dev` resolving the
   workspace and invoking `tsx` correctly — meaning a working global `pnpm` install already
   exists on this machine outside of corepack. The only thing that needed to change was the
   `packageManager` field in `api/package.json` (done, see the spec), so that both `package.json`
   files declare the same target version for consistency going forward; it doesn't require
   `corepack enable` to take effect for `pnpm install`/`pnpm dev:api` to work.

   If corepack-managed version pinning is wanted later, either run the terminal **as
   Administrator** and retry `corepack enable`, or use `corepack enable --install-directory <dir>`
   pointing at a directory the user account can write to and add it to `PATH`.

4. **Next step:** run `pnpm install` directly (no `corepack enable` needed), then `pnpm dev:api`,
   and check §4 Verification.
