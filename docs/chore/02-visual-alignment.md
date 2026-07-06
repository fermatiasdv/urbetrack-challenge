# SPEC — Lineamiento visual y estilístico (design tokens)

**Estado:** Aprobado (pendiente de implementación)
**Fecha:** 2026-07-05
**Relacionado:** [architecture.md](../specs/architecture.md) (sección `app/`, carpeta `styles/`), `client/src/app/README.md`, `client/package.json` (`@radix-ui/themes` ya instalado)

## Objetivo

Guardar en `client/src/app/styles` un único archivo, fuertemente tipado, que contenga el lineamiento
visual y estilístico provisto por el usuario (paleta de colores, tipografía, radios de borde y
espaciado) para el sistema "Logistics & Asset Management System". Este archivo pasa a ser la fuente
única de verdad de design tokens que consumirán las features a medida que se implementen (mapa,
tablas, tabs, alertas, modales, etc.), evitando valores de estilo hardcodeados y dispersos.

Este chore **solo** define y deja aprobado el archivo de tokens. No aplica el tema a ningún
componente ni modifica `main.tsx`/`App.tsx` (ver "Fuera de alcance").

## Diagnóstico

- `client/src/app/styles/` existe pero está vacío (solo `.gitkeep`), consistente con
  `architecture.md`: *"Se puebla a medida que cada spec lo requiera; no se crea contenido
  especulativo"*.
- El proyecto usa `@radix-ui/themes` (`<Theme>` ya envuelve `<App />` en `main.tsx`) como única
  librería de UI/theming instalada. No hay Tailwind ni Material UI en `client/package.json`, pese a
  que el lineamiento recibido menciona Material Design y usa convenciones de nombres propias de
  Tailwind (`rounded.DEFAULT`, `spacing.base`, etc.). Se interpreta el lineamiento como **datos de
  diseño agnósticos de framework** (paleta Material Design 3 + escala tipográfica), no como una
  instrucción de instalar Tailwind o MUI.
- Hoy no existe ningún archivo de tokens; el único estilo en el código es inline
  (`App.tsx`: `style={{ padding: '2rem' }}`).
- **Gap detectado en la paleta recibida (resuelto):** el bloque `colors` (formato Material Design 3)
  no incluía un tono verde/"success" explícito, pese a que `docs/scope.md` exige verde para los
  estados `OK` (assets), `ACTIVE` (vehículos) y `RESOLVED` (incidentes), y la sección "Brand & Style"
  del lineamiento define un rol semántico **Success (Green)**. Se agrega un rol `success` nuevo,
  siguiendo el mismo patrón de 4 roles que ya usa `error` en la paleta original
  (`error` / `on-error` / `error-container` / `on-error-container`), con tonos elegidos para
  mantener la misma lógica Material Design 3 del resto de la paleta (tono principal saturado y
  oscuro con texto blanco encima, container claro/"minty" con texto muy oscuro encima):

  | Token | Valor | Rol |
  |---|---|---|
  | `success` | `#146c2e` | Color principal de éxito (fondo de botones/badges, texto sobre superficies claras) |
  | `on-success` | `#ffffff` | Texto/ícono sobre `success` |
  | `success-container` | `#a6f6ac` | Fondo tenue para chips/badges de estado |
  | `on-success-container` | `#002107` | Texto/ícono sobre `success-container` |

  Aprobado por el usuario: "Agrega el color verde vos. Segui el lineamiento que trae la
  documentación creada."

## Alcance de este chore

1. Crear `client/src/app/styles/tokens.ts` con:
   - Un objeto `designTokens` (`as const`) fiel al lineamiento recibido, tipado explícitamente.
   - Los nombres de propiedades kebab-case del lineamiento (`surface-dim`, `on-primary-container`,
     `headline-lg`, etc.) se convierten a camelCase (`surfaceDim`, `onPrimaryContainer`,
     `headlineLg`) para ser válidos y consistentes con el resto del código TS/React del proyecto.
     Tabla de mapeo completa en "Cambios propuestos".
2. No se crea `theme.ts` (wiring con `@radix-ui/themes`), ni `index.ts` barrel, ni se tocan
   componentes — eso es una feature/spec aparte una vez que exista una pantalla real que lo consuma
   (ver "Fuera de alcance").
3. No se resuelve el gap del color "success" en este chore; se documenta como pendiente de decisión
   del usuario antes de implementar.

## Cambios propuestos

### Estructura

```text
client/src/app/styles/
  tokens.ts
  .gitkeep   (se elimina al agregar tokens.ts, la carpeta deja de estar vacía)
```

### Tipado (`client/src/app/styles/tokens.ts`)

```ts
export interface ColorTokens {
  surface: string
  surfaceDim: string
  surfaceBright: string
  surfaceContainerLowest: string
  surfaceContainerLow: string
  surfaceContainer: string
  surfaceContainerHigh: string
  surfaceContainerHighest: string
  onSurface: string
  onSurfaceVariant: string
  inverseSurface: string
  inverseOnSurface: string
  outline: string
  outlineVariant: string
  surfaceTint: string
  primary: string
  onPrimary: string
  primaryContainer: string
  onPrimaryContainer: string
  inversePrimary: string
  secondary: string
  onSecondary: string
  secondaryContainer: string
  onSecondaryContainer: string
  tertiary: string
  onTertiary: string
  tertiaryContainer: string
  onTertiaryContainer: string
  error: string
  onError: string
  errorContainer: string
  onErrorContainer: string
  /** Rol agregado en este chore — no venía en el lineamiento M3 original, ver "Diagnóstico". */
  success: string
  onSuccess: string
  successContainer: string
  onSuccessContainer: string
  primaryFixed: string
  primaryFixedDim: string
  onPrimaryFixed: string
  onPrimaryFixedVariant: string
  secondaryFixed: string
  secondaryFixedDim: string
  onSecondaryFixed: string
  onSecondaryFixedVariant: string
  tertiaryFixed: string
  tertiaryFixedDim: string
  onTertiaryFixed: string
  onTertiaryFixedVariant: string
  background: string
  onBackground: string
  surfaceVariant: string
}

export interface TypographyStyle {
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing?: string
}

export interface TypographyTokens {
  headlineLg: TypographyStyle
  headlineMd: TypographyStyle
  headlineSm: TypographyStyle
  titleLg: TypographyStyle
  titleMd: TypographyStyle
  bodyLg: TypographyStyle
  bodyMd: TypographyStyle
  labelMd: TypographyStyle
  labelSm: TypographyStyle
  headlineLgMobile: TypographyStyle
}

export interface RoundedTokens {
  sm: string
  DEFAULT: string
  md: string
  lg: string
  xl: string
  full: string
}

export interface SpacingTokens {
  base: string
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  gutter: string
  margin: string
}

export interface DesignTokens {
  name: string
  colors: ColorTokens
  typography: TypographyTokens
  rounded: RoundedTokens
  spacing: SpacingTokens
}

export const designTokens: DesignTokens = {
  name: 'Logistics & Asset Management System',
  colors: {
    /* ...resto de valores 1:1 del lineamiento recibido, ver tabla de mapeo... */
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
    // Rol agregado en este chore (ver "Diagnóstico" — no venía en el lineamiento M3 original)
    success: '#146c2e',
    onSuccess: '#ffffff',
    successContainer: '#a6f6ac',
    onSuccessContainer: '#002107',
  },
  typography: {
    /* ...valores 1:1 del lineamiento recibido, ver tabla de mapeo... */
  },
  rounded: {
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  spacing: {
    base: '4px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    gutter: '16px',
    margin: '24px',
  },
} as const
```

Cada bloque (`colors`, `typography`) lleva un comentario JSDoc arriba con el resumen funcional
correspondiente de la sección "Brand & Style" del lineamiento (semántica de color, uso de cada
nivel tipográfico), para que el archivo sea autodescriptivo sin tener que volver a este spec.

### Tabla de mapeo kebab-case → camelCase (colors)

| Lineamiento | Propiedad TS |
|---|---|
| `surface` | `surface` |
| `surface-dim` | `surfaceDim` |
| `surface-bright` | `surfaceBright` |
| `surface-container-lowest` | `surfaceContainerLowest` |
| `surface-container-low` | `surfaceContainerLow` |
| `surface-container` | `surfaceContainer` |
| `surface-container-high` | `surfaceContainerHigh` |
| `surface-container-highest` | `surfaceContainerHighest` |
| `on-surface` | `onSurface` |
| `on-surface-variant` | `onSurfaceVariant` |
| `inverse-surface` | `inverseSurface` |
| `inverse-on-surface` | `inverseOnSurface` |
| `outline` | `outline` |
| `outline-variant` | `outlineVariant` |
| `surface-tint` | `surfaceTint` |
| `primary` / `on-primary` / `primary-container` / `on-primary-container` / `inverse-primary` | `primary` / `onPrimary` / `primaryContainer` / `onPrimaryContainer` / `inversePrimary` |
| `secondary` / `on-secondary` / `secondary-container` / `on-secondary-container` | `secondary` / `onSecondary` / `secondaryContainer` / `onSecondaryContainer` |
| `tertiary` / `on-tertiary` / `tertiary-container` / `on-tertiary-container` | `tertiary` / `onTertiary` / `tertiaryContainer` / `onTertiaryContainer` |
| `error` / `on-error` / `error-container` / `on-error-container` | `error` / `onError` / `errorContainer` / `onErrorContainer` |
| `success` / `on-success` / `success-container` / `on-success-container` *(agregado en este chore)* | `success` / `onSuccess` / `successContainer` / `onSuccessContainer` |
| `*-fixed` / `*-fixed-dim` / `on-*-fixed` / `on-*-fixed-variant` (primary/secondary/tertiary) | equivalentes en camelCase |
| `background` / `on-background` | `background` / `onBackground` |
| `surface-variant` | `surfaceVariant` |

Tabla de mapeo análoga para `typography` (`headline-lg` → `headlineLg`, `headline-lg-mobile` →
`headlineLgMobile`, etc.). `rounded` y `spacing` no requieren mapeo: sus claves ya son válidas en TS
(`DEFAULT` incluida).

## Fuera de alcance

- Wiring del archivo de tokens con `@radix-ui/themes` (mapear `colors.primary` a `accentColor`,
  `rounded` a la prop `radius` del `<Theme>`, etc.). Se hace en un spec/feature aparte cuando exista
  una pantalla real que lo requiera, para no anticipar decisiones de theming sin un consumidor
  concreto. Primer consumidor real: [docs/feature/01-modify-sidebar.md](../feature/01-modify-sidebar.md)
  — usa componentes de `@radix-ui/themes` con `designTokens` a nivel de componente individual
  (props + objetos de estilos puntuales), sin tocar el `<Theme>` global ni este archivo de tokens.
- Migrar el estilo inline existente en `App.tsx` a los nuevos tokens.
- Instalar Tailwind, Material UI o cualquier otra librería de estilos: los nombres del lineamiento
  (`rounded`, `spacing.base`) se toman como datos, no como una decisión de stack.

## Decisiones tomadas (usuario, 2026-07-05)

1. **Color "success" faltante:** resuelto — se agrega el rol `success` con los valores definidos en
   "Diagnóstico". Aprobado por el usuario: *"Agrega el color verde vos. Segui el lineamiento que
   trae la documentación creada."*
2. **Alcance del archivo:** confirmado — un único archivo `client/src/app/styles/tokens.ts`. Las
   secciones narrativas del lineamiento (Brand & Style, Componentes, Elevación, etc.) se documentan
   como comentarios dentro de ese mismo archivo, no como `.md` separado. Aprobado por el usuario:
   *"Es tal cual lo decís. Van como comentarios dentro de tokens.ts"*.

## Verificación post-implementación

1. `pnpm typecheck` (client) compila sin errores con `designTokens` tipado.
2. `pnpm lint` / `pnpm format:check` pasan sobre el nuevo archivo.
3. Confirmar visualmente que todos los valores de `tokens.ts` coinciden 1:1 con el lineamiento
   recibido (colores, tipografía, rounded, spacing), incluyendo el rol `success` agregado en este
   chore.
4. `client/src/app/styles/.gitkeep` removido una vez que la carpeta tiene contenido real.
