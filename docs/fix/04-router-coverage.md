# Fix — Coverage global por debajo del umbral tras el shell de navegación (SPEC-003)

- **ID:** FIX-004
- **Status:** Resuelto — ver `docs/specs/fix-router-coverage.md`
- **Related:** `docs/chore/03-navigation-shell-router.md` (SPEC-003, ya implementado),
  `docs/specs/architecture.md` (Quality Gates, Ruteo y navegación), `docs/specs/ci-cd-pipeline.md`
- **Date:** 2026-07-05

## 1. Síntoma

Tras implementar SPEC-003 (shell de navegación + TanStack Router), `pnpm coverage`
(`vitest run --coverage`) falla contra los umbrales globales definidos en
`docs/specs/architecture.md` → Quality Gates (80% en las cuatro métricas):

```
ERROR: Coverage for lines (42.06%) does not meet global threshold (80%)
ERROR: Coverage for functions (63.33%) does not meet global threshold (80%)
ERROR: Coverage for statements (42.06%) does not meet global threshold (80%)
ERROR: Coverage for branches (77.92%) does not meet global threshold (80%)
```

La funcionalidad en sí (navegación, sidebar persistente, pantallas placeholder) es correcta — el
problema es exclusivamente de cobertura de tests.

## 2. Causa raíz

Reproducido localmente con `pnpm --filter client coverage`. El reporte por archivo:

| Archivo | % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|---|
| `src/App.tsx` | 0 | 0 | 0 | 0 |
| `src/main.tsx` | 0 | 0 | 0 | 0 |
| `src/app/layout/AppLayout.tsx` | 0 | 0 | 0 | 0 |
| `src/app/layout/Sidebar.tsx` | 0 | 0 | 0 | 0 |
| `src/app/router/router.ts` | 0 | 0 | 0 | 0 |
| `src/app/router/routes.tsx` | 0 | 0 | 0 | 0 |
| `src/app/styles/tokens.ts` | 0 | 100 | 100 | 0 |
| `src/features/*/pages/*Page.tsx` (5 archivos) | 0 | 0 | 0 | 0 |
| `src/component-test/*` (código preexistente) | 94–100 | 77–100 | 100 | 94–100 |

Dos causas distintas, no una sola:

1. **Código nuevo de SPEC-003 sin ningún test** (el motivo directo del pedido): el router
   (`router.ts`, `routes.tsx`), el layout persistente (`AppLayout.tsx`, `Sidebar.tsx`) y las 5
   pantallas placeholder no tienen ningún archivo `.test` que los ejercite. Ninguno de los tests
   existentes (`component-test/*.test.ts(x)`) los importa, así que V8 los marca en 0% — el código
   nunca se ejecuta durante `vitest run`.
2. **Deuda de cobertura preexistente, agravada por este cambio.** `src/app/styles/tokens.ts` (spec
   de lineamiento visual, `docs/chore/02-visual-alignment.md`) ya estaba en 0% de líneas *antes* de
   este chore — es un objeto de constantes (~140 líneas) que ningún componente importa todavía (el
   wiring con `@radix-ui/themes` está explícitamente fuera de alcance de ese spec). Antes de
   SPEC-003 esto no rompía el gate porque el resto del proyecto (`component-test/*`) tenía
   suficiente cobertura para compensarlo. Al sumar ~150 líneas más sin cubrir (router + layout +
   pages), el promedio global cruzó el umbral. `src/App.tsx` tiene el mismo problema: además de no
   tener test propio, **quedó huérfano** — `main.tsx` ya no lo importa (ahora monta
   `RouterProvider`), así que es código muerto que solo resta al denominador.

En resumen: no alcanza con testear únicamente lo nuevo de SPEC-003; `tokens.ts` (y la limpieza de
`App.tsx`) también hay que resolverlos para volver a cruzar el 80% de forma estable.

## 3. Alcance del fix (a definir en el spec correspondiente)

### 3.1 Tests nuevos para el código de SPEC-003

- **Test de integración del router** (`src/app/router/router.test.tsx`, co-localizado junto al
  router — ver "Estrategia de testing" de `architecture.md`): monta `<RouterProvider router={router} />`
  con un history en memoria, navega programáticamente (`router.navigate({ to })`) por las 5 rutas y
  verifica:
  - Cada pantalla renderiza únicamente su leyenda (`Dashboard`, `Mapa`, `Activos`, `Vehículos`,
    `Incidentes`) — cubre las 5 páginas y `routes.tsx`.
  - El nodo DOM de la `Sidebar` **persiste** (misma referencia) entre navegaciones — cubre
    `AppLayout.tsx` y ejercita `Sidebar.tsx`, y además verifica en código el criterio de aceptación
    26 de `docs/verified-scope.md` §11.6 ("la sidebar no se re-renderiza"), que hoy solo está
    verificado manualmente.
  - Un test puntual de `router.ts` (o cubierto por el mismo archivo): que `router` sea una instancia
    válida con las 5 rutas registradas (`router.routeTree.children` tiene longitud 5), sin depender
    de renderizar nada — cierra la única línea de `router.ts` que el test de integración no toque.
- **Test de Sidebar aislado** (`src/app/layout/Sidebar.test.tsx`): renderiza `Sidebar` sola (envuelta
  en un router de test) y verifica que aparecen los 5 enlaces con su texto y `href` esperado, y que
  el logo (`Truck`, vía `aria-hidden` + rol accesible del contenedor) está presente. Cubre las ramas
  de `activeProps` que el test de integración podría no ejercitar en ambos estados (activo/inactivo).

Con esto, `router.ts`, `routes.tsx`, `AppLayout.tsx`, `Sidebar.tsx` y las 5 páginas quedan en ~100%.

### 3.2 `src/app/styles/tokens.ts` (deuda preexistente)

Dos opciones, no excluyentes con lo de arriba:

- **Opción A (recomendada) — test mínimo de forma:** un test que solo importe `designTokens` y
  verifique un par de valores (`designTokens.colors.primary`, `designTokens.typography.bodyMd.fontFamily`,
  etc.). Como el archivo es un único objeto literal, con solo importarlo y tocar unas pocas
  propiedades V8 marca el módulo completo como ejecutado (~140 líneas) — barato y, a diferencia de
  excluirlo, dejaría un test real si en el futuro se detecta una regresión de valores.
- **Opción B — excluir de cobertura** vía `coverage.exclude` en `vite.config.ts`, hasta que un spec
  futuro (wiring con `@radix-ui/themes`) lo consuma desde un componente. Más simple, pero pospone el
  problema y oculta al archivo de la métrica en vez de resolverlo.

### 3.3 `src/main.tsx` (entry point)

No tiene lógica de negocio (crea el root de React y monta providers) — es el patrón estándar de
bootstrap. Se propone **excluirlo de cobertura** (`coverage.exclude` en `vite.config.ts`, sumado a
los excludes por defecto de Vitest), igual que se hace habitualmente con entry points. Alternativa
(no recomendada): un test con `jsdom` que verifique que `getElementById('root')` ausente lanza el
`Error` — cubre 3 líneas a cambio de mockear `createRoot`/DOM real, poco valor para el esfuerzo.

### 3.4 `src/App.tsx` (código huérfano)

Ya no lo importa nadie (`main.tsx` monta `RouterProvider`, no `<App />`). Se propone **eliminarlo**
del working tree en vez de escribirle un test — no tiene sentido mantener cobertura sobre un
componente que ningún punto de entrada renderiza. Si se elimina, deja de contar en el denominador de
cobertura y no hace falta decidir entre test o exclude para él.

## 4. Resultado esperado

Aplicando 3.1 + 3.2 (opción A) + 3.3 + 3.4: el código nuevo de SPEC-003 queda cubierto por tests
reales (no exclusiones), `tokens.ts` deja de estar en 0%, `main.tsx` sale del denominador por ser
bootstrap sin lógica, y `App.tsx` desaparece por no tener ya ningún consumidor. Con eso el promedio
global debería volver a cruzar cómodamente el 80% en las cuatro métricas — a confirmar corriendo
`pnpm coverage` una vez aprobado este fix e implementados los tests.

## 5. Verificación pendiente (una vez aprobado y aplicado el fix)

1. `pnpm --filter client coverage` pasa sin errores de umbral (statements/functions/branches/lines
   ≥ 80%).
2. El test de integración del router falla si se rompe el layout persistente (por ejemplo, si se
   quita el `Outlet` o se hace que `AppLayout` se remonte en cada navegación) — sirve como
   regresión del criterio de aceptación 26.
3. `pnpm --filter client typecheck` y `pnpm --filter client lint` siguen en verde (los tests nuevos
   deben respetar el mismo tipado estricto que el resto del proyecto).
4. `git status` no debe mostrar `App.tsx` si se opta por eliminarlo (3.4).
