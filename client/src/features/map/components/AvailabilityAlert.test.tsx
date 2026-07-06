import { act, render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it } from 'vitest'
import { AvailabilityAlert } from './AvailabilityAlert'
import { useAssignmentStore } from '../assignment/useAssignmentStore'

function alertTextFor(zoneLabel: string): string {
  return `No hay vehículos disponibles para ${zoneLabel}`
}

function renderAlert() {
  return render(
    <Theme>
      <AvailabilityAlert />
    </Theme>
  )
}

beforeEach(() => {
  useAssignmentStore.setState({
    assignments: [],
    zoneAvailability: {
      MICROCENTRO: true,
      RECOLETA: true,
      PALERMO: true,
      BELGRANO: true,
      CABALLITO: true
    }
  })
})

describe('AvailabilityAlert', () => {
  it('renders nothing when every zone has an available vehicle (CA-01)', () => {
    renderAlert()

    expect(screen.queryByTestId('availability-alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders exactly one alert naming the affected zone for a single unavailable zone (CA-02)', () => {
    useAssignmentStore.setState({
      zoneAvailability: {
        MICROCENTRO: true,
        RECOLETA: true,
        PALERMO: false,
        BELGRANO: true,
        CABALLITO: true
      }
    })

    renderAlert()

    expect(screen.getAllByText(alertTextFor('Palermo'))).toHaveLength(1)
  })

  it('renders one alert per unavailable zone, each naming its own zone, in ZONES order (CA-03)', () => {
    useAssignmentStore.setState({
      zoneAvailability: {
        MICROCENTRO: false,
        RECOLETA: false,
        PALERMO: true,
        BELGRANO: false,
        CABALLITO: true
      }
    })

    renderAlert()

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(3)
    expect(alerts[0]).toHaveTextContent(alertTextFor('Microcentro'))
    expect(alerts[1]).toHaveTextContent(alertTextFor('Recoleta'))
    expect(alerts[2]).toHaveTextContent(alertTextFor('Belgrano'))
  })

  it('never renders a dismiss control (CA-04)', () => {
    useAssignmentStore.setState({
      zoneAvailability: {
        MICROCENTRO: false,
        RECOLETA: true,
        PALERMO: true,
        BELGRANO: true,
        CABALLITO: true
      }
    })

    renderAlert()

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders each alert at full width (CA-05)', () => {
    useAssignmentStore.setState({
      zoneAvailability: {
        MICROCENTRO: false,
        RECOLETA: true,
        PALERMO: true,
        BELGRANO: true,
        CABALLITO: true
      }
    })

    renderAlert()

    expect(screen.getByRole('alert')).toHaveStyle({ width: '100%' })
  })

  it('updates without remounting when zoneAvailability changes (CA-07)', () => {
    useAssignmentStore.setState({
      zoneAvailability: {
        MICROCENTRO: false,
        RECOLETA: true,
        PALERMO: true,
        BELGRANO: true,
        CABALLITO: true
      }
    })

    renderAlert()
    expect(screen.getAllByRole('alert')).toHaveLength(1)

    act(() => {
      useAssignmentStore.setState({
        zoneAvailability: {
          MICROCENTRO: true,
          RECOLETA: true,
          PALERMO: true,
          BELGRANO: true,
          CABALLITO: true
        }
      })
    })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
