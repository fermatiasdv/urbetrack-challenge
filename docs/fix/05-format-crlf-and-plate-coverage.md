# Fix — `format:check` en rojo por CRLF preexistente + cobertura de `PlateCell`/`types.ts`

- **ID:** FIX-005
- **Status:** Resuelto
- **Related:** `docs/feature/01-modify-sidebar.md` (donde se detectó, corriendo `pnpm coverage` y
  `pnpm format:check` después de implementar la sidebar), `docs/specs/architecture.md` (Quality
  Gates), `client/.prettierrc`, `client/src/component-test/`
- **Date:** 2026-07-06

## 1. Síntoma

Después de implementar `docs/feature/01-modify-sidebar.md`, el usuario corrió los quality gates
localmente y reportó dos fallas **no relacionadas con los archivos de la sidebar**:

1. `pnpm format:check` (`prettier --check .`) marca 35 archivos con "Code style issues". Ninguno de
   los tres archivos nuevos/editados de la sidebar (`Sidebar.tsx`, `AppLayout.tsx`,
   `sidebar.styles.ts`) aparece en la lista — sí aparece `Sidebar.test.tsx` (corregido aparte, ver
   commit de esa spec).
2. `pnpm coverage` reporta dos archivos por debajo de umbral, ambos preexistentes y ajenos a la
   sidebar:
   | Archivo | % Stmts | % Branch | % Funcs | % Lines | Líneas sin cubrir |
   |---|---|---|---|---|---|
   | `src/component-test/PlateCell.tsx` | 82.43 | 77.77 | 100 | 82.43 | 36, 45-47, 75-77, 90-92, 95-97 |
   | `src/component-test/types.ts` | 100 | 50 | 100 | 100 | 29 |

## 2. Causa raíz

### 2.1 `format:check` — CRLF heredado del checkout en Windows

Confirmado con `file <archivo>` sobre el working tree: `src/main.tsx`, `package.json` y el resto de
los 35 archivos marcados tienen terminadores **CRLF**, mientras que los tres archivos nuevos de la
sidebar (escritos en esta sesión) están en **LF** y no aparecen en la lista de `prettier --check`.
`client/.prettierrc` no fija `endOfLine` (por default Prettier usa `"lf"`), así que cualquier
archivo del working tree con CRLF falla el check, sin importar si el resto del estilo (comillas,
punto y coma, ancho) es correcto. El repo no tiene `.gitattributes`, así que en un checkout en
Windows con `core.autocrlf` en su valor por defecto, git puede materializar CRLF localmente aunque
el blob commiteado esté en LF (o haya quedado en CRLF desde el commit original). Es un problema de
**line endings del entorno**, no de contenido — no hay nada mal escrito en esos 35 archivos.

### 2.2 Cobertura — ramas sin ejercitar, no bugs

- **`types.ts:29`** (`zoneNameFor`): `ZONES[zoneId] ?? zoneId`. El único consumidor indirecto hoy
  (`useVehiclesStore.ts` → `VehiclesTable.test.tsx`) siempre usa vehículos seed con `zoneId` `'1'`
  y `'2'`, ambos presentes en `ZONES`. La rama `?? zoneId` (zona sin mapeo) nunca se ejecuta →
  50% de ramas. No hay ningún test unitario dedicado a `types.ts`.
- **`PlateCell.tsx`**: `VehiclesTable.test.tsx` solo ejercita el *happy path* de edición (tab para
  confirmar, valor vacío para revertir). Nunca se prueba:
  - Línea 36: el callback del `setTimeout` de debounce (`isValidPlate(value) ? null :
    FULL_INVALID_MESSAGE`) — necesita fake timers y esperar `DEBOUNCE_MS`.
  - Líneas 45-47 y 90-92: la rama de `handleChange` cuando `!isAcceptablePrefix(next)` (mensaje de
    prompt) y su render condicional.
  - Líneas 75-77: `handleKeyDown` con `Enter` (commit + blur).
  - Líneas 95-97: el render condicional del error de debounce.
  Ninguno de estos casos está mal implementado; simplemente no había un test co-localizado
  (`PlateCell.test.tsx`) que aislara el componente para forzarlos.

## 3. Alcance del fix

### 3.1 CRLF — `.gitattributes` en la raíz del repo

Se agrega `.gitattributes` (nuevo archivo) forzando `eol=lf` para archivos de texto, para que
cualquier checkout futuro (en cualquier SO) normalice a LF y no vuelva a romper `format:check`:

```gitattributes
* text=auto eol=lf
```

**Paso manual que el usuario debe correr una vez** (no se ejecuta acá: requiere `git`/`pnpm` sobre
el working tree real, fuera del alcance de las herramientas de esta sesión):

```
pnpm --filter client format
```

Esto reescribe con Prettier (LF incluido) los 34 archivos preexistentes marcados. Combinado con el
`.gitattributes` nuevo, el próximo `git add`/commit deja todo en LF de forma estable.

### 3.2 Cobertura — tests nuevos, co-localizados

- **`client/src/component-test/types.test.ts`** (nuevo): dos casos para `zoneNameFor` — zona
  mapeada y zona sin mapeo (cubre la rama 29 que faltaba).
- **`client/src/component-test/PlateCell.test.tsx`** (nuevo): renderiza `PlateCell` aislado (sin
  pasar por `VehiclesTable`/React Query) y cubre:
  1. Prefijo inválido → aparece el mensaje de prompt y la tecla se bloquea (líneas 45-47, 90-92).
  2. Con fake timers, un valor incompleto/inválido dispara, tras `DEBOUNCE_MS`, el mensaje de error
     de formato completo (líneas 36, 95-97).
  3. `Enter` confirma el valor en el store y saca el foco del input (líneas 75-77).

No se modifica la lógica de `PlateCell.tsx` ni de `types.ts` — el fix es exclusivamente de tests
(las ramas ya se comportaban como se esperaba, solo faltaba ejercitarlas).

## 4. Resultado esperado

- `pnpm --filter client format:check` pasa una vez que el usuario corre `pnpm --filter client
  format` localmente (paso 3.1) — los archivos de la sidebar ya pasaban antes de este fix.
- `pnpm --filter client coverage`: `PlateCell.tsx` y `types.ts` llegan a ≥ 80% en las cuatro
  métricas (a confirmar corriendo el comando; ver "Verificación").
- `pnpm --filter client typecheck` y `lint` siguen en verde con los dos archivos de test nuevos.

## 5. Verificación

1. `pnpm --filter client format` (una vez, localmente) + `pnpm --filter client format:check` en
   verde.
2. `pnpm --filter client coverage`: `PlateCell.tsx` y `types.ts` sin líneas listadas en "Uncovered
   Line #s", ≥ 80% en las cuatro métricas.
3. `pnpm --filter client typecheck` y `pnpm --filter client lint` en verde sobre
   `PlateCell.test.tsx` y `types.test.ts`.
4. `pnpm --filter client test` sigue en verde (no se tocó ningún test existente).
