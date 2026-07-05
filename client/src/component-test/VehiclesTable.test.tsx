import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Theme } from '@radix-ui/themes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { VehiclesTable } from './VehiclesTable'
import { useVehiclesStore } from './useVehiclesStore'
import { FETCH_DELAY_MS } from './data'

function renderTable() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <Theme>
        <VehiclesTable />
      </Theme>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: [] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('VehiclesTable', () => {
  it('shows a skeleton per column before load, then real rows after the data resolves', async () => {
    vi.useFakeTimers()
    renderTable()

    expect(screen.getAllByTestId('skeleton-row')).toHaveLength(2)
    expect(screen.queryAllByTestId('vehicle-row')).toHaveLength(0)

    // Advance in small increments (flushing microtasks between each) rather
    // than a single jump: React Query's internal fetch/notify chain needs
    // several microtask hops to propagate the resolved data into state.
    for (let elapsed = 0; elapsed < FETCH_DELAY_MS + 500; elapsed += 50) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50)
      })
      if (screen.queryAllByTestId('vehicle-row').length > 0) break
    }

    expect(screen.getAllByTestId('vehicle-row')).toHaveLength(2)
    expect(screen.queryAllByTestId('skeleton-row')).toHaveLength(0)
  })

  it('renders the two vehicles with correct type, plate, status and zoneName', async () => {
    renderTable()

    const rows = await screen.findAllByTestId('vehicle-row', undefined, { timeout: 3000 })
    expect(rows).toHaveLength(2)

    expect(screen.getByDisplayValue('ABC123')).toBeInTheDocument()
    expect(screen.getByDisplayValue('DEF456')).toBeInTheDocument()
    expect(screen.getByText('TRUCK')).toBeInTheDocument()
    expect(screen.getByText('VAN')).toBeInTheDocument()
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
    expect(screen.getByText('MAINTENANCE')).toBeInTheDocument()
    expect(screen.getByText('Microcentro')).toBeInTheDocument()
    expect(screen.getByText('Palermo')).toBeInTheDocument()
  }, 10000)

  it('commits a valid plate edit to the store, and reverts an empty commit', async () => {
    const user = userEvent.setup()
    renderTable()

    await screen.findAllByTestId('vehicle-row', undefined, { timeout: 3000 })

    const input = screen.getByLabelText('Patente de 1') as HTMLInputElement

    await user.clear(input)
    await user.type(input, 'XYZ999')
    await user.tab()

    expect(useVehiclesStore.getState().vehicles.find((v) => v.id === '1')?.plate).toBe('XYZ999')

    await user.clear(input)
    await user.tab()

    expect(input.value).toBe('XYZ999')
    expect(useVehiclesStore.getState().vehicles.find((v) => v.id === '1')?.plate).toBe('XYZ999')
  }, 10000)
})
