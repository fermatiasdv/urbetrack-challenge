# SPEC — Ignorar `client/.tsbuild-node/` en ESLint

**Estado:** Aprobado — implementado (ver "Estado de implementación")
**Fecha:** 2026-07-06
**Relacionado:** `docs/specs/geo-zone-derivation.md` (MAP-00, lint corrido tras esa implementación),
`client/eslint.config.js`

## Diagnóstico

`pnpm --filter client lint` reporta:

```text
client/.tsbuild-node/vite.config.d.ts
  1:25  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
```

`client/.tsbuild-node/` es un directorio de **salida generada** por el build de TypeScript para el
proyecto de referencia de `vite.config.ts` (`tsconfig.node.json`, ver `client/.tsbuild-node/
vite.config.js` y `.tsconfig.node.tsbuildinfo`), no código fuente. `vite.config.d.ts` es un
`.d.ts` autogenerado por `tsc` (`declare const _default: any`), fuera del control del equipo — el
mismo patrón que ya excluye `dist` en `client/eslint.config.js` (línea `{ ignores: ['dist'] }`), pero
ese `ignores` no cubre `.tsbuild-node`.

## Cambio propuesto

`client/eslint.config.js`, línea 6:

```diff
- { ignores: ['dist'] },
+ { ignores: ['dist', '.tsbuild-node'] },
```

No se toca ninguna otra regla ni archivo.

## Fuera de alcance

- Evaluar si `.tsbuild-node/` debería estar en `.gitignore` (chore aparte si se decide).
- Cualquier otro hallazgo de lint sobre código fuente real.

## Verificación post-implementación

1. `pnpm --filter client lint` ya no reporta errores sobre `client/.tsbuild-node/**`.
2. El resto de las reglas de lint sigue aplicándose sin cambios sobre `src/`.

## Estado de implementación

- ✅ `client/eslint.config.js` — se agrega `.tsbuild-node` a `ignores`.
