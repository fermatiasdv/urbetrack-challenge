import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { AssetsFilterBar } from './AssetsFilterBar'
import { useAssetFiltersStore } from '../store/useAssetFiltersStore'
import { DEFAULT_ASSET_FILTERS } from '../utils/assetFilters'
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
  return render(<AssetsFilterBar />, { wrapper })
}

beforeEach(() => {
  useAssetFiltersStore.setState(DEFAULT_ASSET_FILTERS)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(ZONES)
    })
  )
})

describe('AssetsFilterBar', () => {
  it('updates the type filter when an option is selected', async () => {
    const user = userEvent.setup()
    renderFilterBar()

    await user.click(screen.getByRole('combobox', { name: 'Tipo' }))
    await user.click(await screen.findByRole('option', { name: 'Cesto' }))

    expect(useAssetFiltersStore.getState().type).toBe('BIN')
  })

  it('updates the status filter when an option is selected', async () => {
    const user = userEvent.setup()
    renderFilterBar()

    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(await screen.findByRole('option', { name: 'Dañado' }))

    expect(useAssetFiltersStore.getState().status).toBe('DAMAGED')
  })

  it('shows "Todas las zonas" when no zone is selected, and updates on selection', async () => {
    const user = userEvent.setup()
    renderFilterBar()

    expect(screen.getByRole('button', { name: 'Zona' })).toHaveTextContent('Todas las zonas')

    await user.click(screen.getByRole('button', { name: 'Zona' }))
    await user.click(await screen.findByText('Microcentro'))

    expect(useAssetFiltersStore.getState().zoneIds).toEqual(['1'])
  })

  it('resets every filter to its default when "Restablecer" is clicked', async () => {
    const user = userEvent.setup()
    renderFilterBar()
    useAssetFiltersStore.getState().setType('CONTAINER')

    await user.click(screen.getByRole('button', { name: 'Restablecer' }))

    expect(useAssetFiltersStore.getState()).toMatchObject(DEFAULT_ASSET_FILTERS)
  })
})
