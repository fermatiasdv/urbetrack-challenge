import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { UseQueryResult } from '@tanstack/react-query'
import { IncidentsPage } from './IncidentsPage'
import { useIncidentsQuery } from '../api/useIncidentsQuery'
import { useIncidentModalStore } from '../store/useIncidentModalStore'
import type { Incident } from '../../../shared/types/domain.types'

vi.mock('../api/useIncidentsQuery')

vi.mock('../components/IncidentsFilterBar', () => ({
  IncidentsFilterBar: () => <div data-testid="incidents-filter-bar" />
}))

vi.mock('../components/IncidentsTable', () => ({
  IncidentsTable: () => <div data-testid="incidents-table" />
}))

vi.mock('../components/IncidentModal', () => ({
  IncidentModal: () => <div data-testid="incident-modal" />
}))

const mockedUseIncidentsQuery = vi.mocked(useIncidentsQuery)

function renderPage() {
  return render(
    <Theme>
      <IncidentsPage />
    </Theme>
  )
}

describe('IncidentsPage', () => {
  it('renders the skeleton while the query is loading', () => {
    mockedUseIncidentsQuery.mockReturnValue({
      isLoading: true
    } as unknown as UseQueryResult<Incident[]>)

    renderPage()

    expect(screen.getByText('Incidentes')).toBeInTheDocument()
    expect(screen.queryByTestId('incidents-filter-bar')).not.toBeInTheDocument()
  })

  it('renders the status cards, filter bar and table once loading finishes', () => {
    mockedUseIncidentsQuery.mockReturnValue({
      isLoading: false
    } as unknown as UseQueryResult<Incident[]>)

    renderPage()

    expect(screen.getByText('Total de Incidentes')).toBeInTheDocument()
    expect(screen.getByTestId('incidents-filter-bar')).toBeInTheDocument()
    expect(screen.getByTestId('incidents-table')).toBeInTheDocument()
  })

  it('opens the create modal when "Agregar Incidente" is clicked', async () => {
    const user = userEvent.setup()
    useIncidentModalStore.setState({ incidentId: null, mode: null })

    mockedUseIncidentsQuery.mockReturnValue({
      isLoading: false
    } as unknown as UseQueryResult<Incident[]>)

    renderPage()

    await user.click(screen.getByRole('button', { name: 'Agregar Incidente' }))

    expect(useIncidentModalStore.getState()).toMatchObject({ incidentId: null, mode: 'create' })
  })
})
