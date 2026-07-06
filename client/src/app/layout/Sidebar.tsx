import { Link, useMatchRoute } from '@tanstack/react-router'
import { Box, Flex, Heading, Text, Button } from '@radix-ui/themes'
import { AlertTriangle, Map, Package, Truck, type LucideIcon } from 'lucide-react'
import {
  navItemActiveStyle,
  navItemInactiveStyle,
  navItemLabelStyle,
  sidebarContainerStyle,
  sidebarLogoBoxStyle,
  sidebarSubtitleStyle,
  sidebarTitleStyle
} from './sidebar.styles'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Mapas', to: '/', icon: Map },
  { label: 'Registro de Activos', to: '/activos', icon: Package },
  { label: 'Vehículos', to: '/vehiculos', icon: Truck },
  { label: 'Incidentes', to: '/incidentes', icon: AlertTriangle }
]

/**
 * Ancho fijo de la sidebar (mockup: `w-64` = 16rem). Exportado para que `AppLayout.tsx` reserve
 * el mismo ancho como `marginLeft` del contenido, ya que la sidebar es `position="fixed"` y sale
 * del flujo normal.
 */
export const SIDEBAR_WIDTH = '16rem'

export function Sidebar(): JSX.Element {
  const matchRoute = useMatchRoute()

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width={SIDEBAR_WIDTH}
      height="100vh"
      p="4"
      style={sidebarContainerStyle}
    >
      <Flex direction="column" height="100%">
        <Box mb="5" px="2">
          <Flex align="center" gap="2" mb="1">
            <Flex
              align="center"
              justify="center"
              width="32px"
              height="32px"
              style={sidebarLogoBoxStyle}
            >
              <Truck aria-hidden size={18} />
            </Flex>
            <Box>
              <Heading as="h1" size="3" style={sidebarTitleStyle}>
                Logistics Manager
              </Heading>
              <Text as="div" style={sidebarSubtitleStyle}>
                Operational Hub
              </Text>
            </Box>
          </Flex>
        </Box>

        <Box asChild flexGrow="1">
          <nav>
            <Flex direction="column" gap="3">
              {NAV_ITEMS.map((item) => {
                const isActive = matchRoute({ to: item.to })
                const Icon = item.icon
                return (
                  <Button
                    key={item.to}
                    asChild
                    variant="ghost"
                    radius="large"
                    style={isActive ? navItemActiveStyle : navItemInactiveStyle}
                  >
                    <Link to={item.to}>
                      <Icon aria-hidden size={18} />
                      <Text style={navItemLabelStyle}>{item.label}</Text>
                    </Link>
                  </Button>
                )
              })}
            </Flex>
          </nav>
        </Box>
      </Flex>
    </Box>
  )
}
