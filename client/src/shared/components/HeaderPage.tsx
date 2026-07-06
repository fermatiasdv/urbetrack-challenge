import type { JSX } from 'react'
import { Button, Flex, Heading, Text } from '@radix-ui/themes'
import type { LucideIcon } from 'lucide-react'
import { headerPageActionButtonStyle } from './headerPage.styles'

export interface HeaderPageAction {
  /** Leyenda del botón, ej. "Agregar Vehículo". */
  label: string
  /** Ícono opcional (`lucide-react`), renderizado antes del `label`. */
  icon?: LucideIcon
  onClick: () => void
}

export interface HeaderPageProps {
  /** Único subelemento obligatorio. */
  title: string
  /** Debajo del título, mismo bloque izquierdo. */
  subtitle?: string
  /** Botón contra el margen derecho. Sin `action`, no se renderiza ningún botón. */
  action?: HeaderPageAction
}

/**
 * Encabezado de pantalla reutilizable entre features (`shared/components`, excepción documentada
 * a "un módulo migra a shared recién cuando una segunda feature lo necesita" — pedido explícito
 * del usuario, ver docs/feature/05-vehicles-header.md, "Diagnóstico").
 *
 * Título a la izquierda (obligatorio), subtítulo opcional debajo, y un botón de acción opcional
 * contra el margen derecho.
 */
export function HeaderPage({ title, subtitle, action }: HeaderPageProps): JSX.Element {
  const ActionIcon = action?.icon

  return (
    <header>
      <Flex justify="between" align="center">
        <Flex direction="column">
          <Heading as="h1" size="6">
            {title}
          </Heading>
          {subtitle ? (
            <Text as="p" color="gray">
              {subtitle}
            </Text>
          ) : null}
        </Flex>
        {action ? (
          <Button
            variant="solid"
            size="3"
            style={headerPageActionButtonStyle}
            onClick={action.onClick}
          >
            {ActionIcon ? <ActionIcon size={16} aria-hidden /> : null}
            {action.label}
          </Button>
        ) : null}
      </Flex>
    </header>
  )
}
