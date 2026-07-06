import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { IncidentsFilterBar } from './IncidentsFilterBar'
import { useIncidentFiltersStore } from '../store/useIncidentFiltersStore'
import { DEFAULT_INCIDENT_FILTERS } from '../utils/incidentFilters'
import type { Zone } from '../../../shared/types/domain.types'

const ZONES: Zone[] = [
  { id: '1', name: 'Microcentro' },
  { id: '2', name: 'Palermo' }
]

function renderFilterBar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <Theme>{children}</Theme>
      </QueryClientProvider>
    )
  }
  return render(<IncidentsFilterBar />, { wrapper })
}

beforeEach(() => {
  useIncidentFiltersStore.setState(DEFAULT_INCIDENT_FILTERS)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(ZONES)
    })
  )
})

describe('IncidentsFilterBar', () => {
  it('updates the type filter when an option is selected', async () => {
    const user = userEvent.setup()
    renderFilterBar()

    await user.click(screen.getByRole('combobox', { name: 'Tipo' }))
    await user.click(await screen.findByRole('option', { name: 'Basural' }))

    expect(useIncidentFiltersStore.getState().type).toBe('LITTERING')
  })

  it('updates the status filter when an option is selected', async () => {
    const user = userEvent.setup()
    renderFilterBar()

    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(await screen.findByRole('option', { name: 'Resuelto' }))

    expect(useIncidentFiltersStore.getState().status).toBe('RESOLVED')
  })

  it('shows "Todas las zonas" when no zone is selected, and updates on selection', async () => {
    const user = userEvent.setup()
    renderFilterBar()

    expect(screen.getByRole('button', { name: 'Zona' })).toHaveTextContent('Todas las zonas')

    await user.click(screen.getByRole('button', { name: 'Zona' }))
    await user.click(await screen.findByText('Microcentro'))

    expect(useIncidentFiltersStore.getState().zoneIds).toEqual(['1'])
  })

  it('resets every filter to its default when "Restablecer" is clicked', async () => {
    const user = userEvent.setup()
    renderFilterBar()
    useIncidentFiltersStore.getState().setType('DAMAGE')

    await user.click(screen.getByRole('button', { name: 'Restablecer' }))

    expect(useIncidentFiltersStore.getState()).toMatchObject(DEFAULT_INCIDENT_FILTERS)
  })
})
