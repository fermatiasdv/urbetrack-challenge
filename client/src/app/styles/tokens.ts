/**
 * Design tokens — Logistics & Asset Management System
 *
 * Fuente única de verdad del lineamiento visual y estilístico de la app (paleta de colores,
 * tipografía, radios de borde y espaciado). Ver spec: docs/chore/02-visual-alignment.md.
 *
 * Este archivo solo define los tokens y su tipado. No aplica el tema a ningún componente ni a
 * `@radix-ui/themes` (fuera de alcance del spec, ver sección "Fuera de alcance").
 */

/**
 * Brand & Style
 *
 * La identidad visual está anclada en confiabilidad, precisión y eficiencia operativa, pensada
 * para entornos de información de alta densidad donde la claridad y la interpretación rápida de
 * datos son prioritarias.
 *
 * Sigue una estética Corporate/Modern, influenciada por la lógica estructurada de Material
 * Design. Prioriza la utilidad funcional por sobre lo decorativo, usando una paleta de color
 * restringida y una jerarquía visual clara para guiar al usuario a través de flujos de logística
 * complejos. La interfaz transmite estabilidad y confianza institucional, asegurando que alertas
 * críticas y puntos de datos permanezcan como foco principal.
 */

/**
 * Colors
 *
 * La paleta es estrictamente semántica para facilitar el reconocimiento cognitivo inmediato del
 * estado de los activos y la salud del sistema:
 * - Primary (azul profesional): acciones primarias, estados de navegación activos, identidad de
 *   marca.
 * - Success (verde): estados positivos — `OK`, `RESOLVED`, `ACTIVE`. Rol agregado en
 *   docs/chore/02-visual-alignment.md — no venía en el lineamiento M3 original recibido, que no
 *   incluía ningún tono verde pese a requerirlo docs/scope.md.
 * - Warning (naranja / `tertiary`): estados que requieren atención pero no fallo inmediato —
 *   `DAMAGED`, `FULL`, `IN_PROGRESS`, `MAINTENANCE`.
 * - Error (rojo): fallas críticas y urgencias — `OUT_OF_SERVICE`, `REPORTED`, "Invalid Plate".
 * - Neutral (slate grays): texto secundario, bordes y scaffolding de UI, para que los colores
 *   semánticos resalten sobre la interfaz.
 */
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
  /** Rol agregado en docs/chore/02-visual-alignment.md — no venía en el lineamiento M3 original. */
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

/**
 * Typography
 *
 * Se usa Inter en todos los niveles de la jerarquía. Su x-height alta y excelente legibilidad la
 * hacen ideal para grillas densas de datos y dashboards técnicos.
 * - Headlines: títulos de página y encabezados de sección principales.
 * - Titles: encabezados de card y títulos de modal.
 * - Body: el nivel más usado, para carga de datos e información general (`body-md` es el default
 *   para la mayoría del contenido del dashboard).
 * - Labels: encabezados de tabla, micro-copy e indicadores de estado; suelen ir en mayúsculas
 *   para separación visual en layouts densos.
 */
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

/**
 * Shapes
 *
 * Lenguaje de forma "Soft" (4px / 0.25rem por defecto). Un redondeo sutil que da un aire moderno
 * sin perder el aspecto profesional y estructurado, maximizando el espacio interno para texto y
 * datos dentro de los componentes.
 * - `sm`: usado en checkboxes y micro-indicadores.
 * - `DEFAULT`: usado en botones, inputs y cards.
 * - `lg`: usado en modales y widgets grandes de dashboard.
 */
export interface RoundedTokens {
  sm: string
  DEFAULT: string
  md: string
  lg: string
  xl: string
  full: string
}

/**
 * Layout & Spacing
 *
 * Grilla fluida de 12 columnas para maximizar el uso del espacio horizontal en desktop (target
 * principal para gestión logística). Ritmo vertical consistente sobre una baseline grid de
 * 8px/4px. Densidad "Compact" en tablas y listas para acomodar grandes volúmenes de datos.
 *
 * Responsive:
 * - Desktop (1200px+): 12 columnas, 24px de margen, 16px de gutter.
 * - Tablet (768px–1199px): 8 columnas, 16px de margen, 16px de gutter; los sidebars suelen
 *   colapsar a iconos.
 * - Mobile (<768px): 4 columnas, 16px de margen, 12px de gutter; las tablas de datos pasan a
 *   vistas de lista/card.
 */
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

/**
 * Elevation & Depth
 *
 * La jerarquía visual se establece con capas tonales y sombras ambientales sutiles:
 * 1. Canvas (base): fondo gris muy claro.
 * 2. Surface (cards/containers): superficies claras por sobre el canvas, con sombra de bajo
 *    blur/opacidad para indicar profundidad sin ruido visual.
 * 3. Overlay (modales/popovers): mayor elevación, sombras más marcadas y backdrop semitransparente
 *    con blur para mantener contexto mientras se enfoca la atención.
 *
 * Los bordes se usan con moderación, en gris de bajo contraste, sobre todo para delimitar tablas
 * de datos donde las sombras serían repetitivas.
 */

/**
 * Components
 *
 * - Data Tables: núcleo de la experiencia. Header fijo al scrollear, paginación local en el
 *   footer, toggle de densidad. Filas alternadas (zebra-stripe) o dividers de bajo contraste.
 * - Status Indicators: círculo de 8px + texto en `label-sm`. Verde = Active/OK/Resolved. Naranja =
 *   In Progress/Damaged/Maintenance. Rojo = Out of Service/Reported.
 * - Tabs: planas, con indicador de 2px en el borde inferior en `primary` para el estado activo.
 *   Texto en mayúsculas para navegación de primer nivel (basado en Material-UI).
 * - Persistent Alerts: notificaciones a nivel sistema (ej. "3 Vehicles Out of Service"). Fondo
 *   sólido, texto de alto contraste y borde de acento a la izquierda para asegurar visibilidad.
 * - Heatmap Legend: gradiente horizontal o escala escalonada de gris neutro a azul primario o rojo
 *   de error, según la métrica (densidad de activos vs. frecuencia de incidentes).
 * - Input Fields: estilo outlined, borde de 1px que pasa a 2px y a `primary` en focus. Labels
 *   flotantes o justo arriba del campo para claridad en formularios densos.
 */

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
    surface: '#f8f9ff',
    surfaceDim: '#ccdbf2',
    surfaceBright: '#f8f9ff',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#eef4ff',
    surfaceContainer: '#e5efff',
    surfaceContainerHigh: '#dbe9ff',
    surfaceContainerHighest: '#d4e4fa',
    onSurface: '#0d1c2d',
    onSurfaceVariant: '#414752',
    inverseSurface: '#233143',
    inverseOnSurface: '#e9f1ff',
    outline: '#717783',
    outlineVariant: '#c1c6d4',
    surfaceTint: '#005faf',
    primary: '#005dac',
    onPrimary: '#ffffff',
    primaryContainer: '#1976d2',
    onPrimaryContainer: '#fffdff',
    inversePrimary: '#a5c8ff',
    secondary: '#515f74',
    onSecondary: '#ffffff',
    secondaryContainer: '#d5e3fc',
    onSecondaryContainer: '#57657a',
    tertiary: '#944700',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ba5b00',
    onTertiaryContainer: '#fffeff',
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
    // Rol agregado en docs/chore/02-visual-alignment.md — no venía en el lineamiento M3 original.
    success: '#146c2e',
    onSuccess: '#ffffff',
    successContainer: '#a6f6ac',
    onSuccessContainer: '#002107',
    primaryFixed: '#d4e3ff',
    primaryFixedDim: '#a5c8ff',
    onPrimaryFixed: '#001c3a',
    onPrimaryFixedVariant: '#004786',
    secondaryFixed: '#d5e3fc',
    secondaryFixedDim: '#b9c7df',
    onSecondaryFixed: '#0d1c2e',
    onSecondaryFixedVariant: '#3a485b',
    tertiaryFixed: '#ffdbc7',
    tertiaryFixedDim: '#ffb688',
    onTertiaryFixed: '#311300',
    onTertiaryFixedVariant: '#733600',
    background: '#f8f9ff',
    onBackground: '#0d1c2d',
    surfaceVariant: '#d4e4fa'
  },
  typography: {
    headlineLg: {
      fontFamily: 'Inter',
      fontSize: '32px',
      fontWeight: '700',
      lineHeight: '40px',
      letterSpacing: '-0.02em'
    },
    headlineMd: {
      fontFamily: 'Inter',
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '32px',
      letterSpacing: '-0.01em'
    },
    headlineSm: {
      fontFamily: 'Inter',
      fontSize: '20px',
      fontWeight: '600',
      lineHeight: '28px'
    },
    titleLg: {
      fontFamily: 'Inter',
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '24px'
    },
    titleMd: {
      fontFamily: 'Inter',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '24px'
    },
    bodyLg: {
      fontFamily: 'Inter',
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px'
    },
    bodyMd: {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px'
    },
    labelMd: {
      fontFamily: 'Inter',
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: '16px',
      letterSpacing: '0.05em'
    },
    labelSm: {
      fontFamily: 'Inter',
      fontSize: '10px',
      fontWeight: '600',
      lineHeight: '14px',
      letterSpacing: '0.05em'
    },
    headlineLgMobile: {
      fontFamily: 'Inter',
      fontSize: '24px',
      fontWeight: '700',
      lineHeight: '32px'
    }
  },
  rounded: {
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  spacing: {
    base: '4px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    gutter: '16px',
    margin: '24px'
  }
}
