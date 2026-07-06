import { Link } from '@tanstack/react-router'
import { Truck } from 'lucide-react'

interface NavItem {
  label: string
  to: string
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', to: '/' },
  { label: 'Mapa', to: '/mapa' },
  { label: 'Activos', to: '/activos' },
  { label: 'Vehículos', to: '/vehiculos' },
  { label: 'Incidentes', to: '/incidentes' }
]

export function Sidebar(): JSX.Element {
  return (
    <nav
      style={{
        width: '220px',
        flexShrink: 0,
        borderRight: '1px solid #e2e8f0',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem'
        }}
      >
        <Truck aria-hidden size={24} />
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>URBETRACK</span>
      </div>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            textDecoration: 'none',
            color: 'inherit'
          }}
          activeProps={{
            style: { fontWeight: 700, backgroundColor: '#e2e8f0' }
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
