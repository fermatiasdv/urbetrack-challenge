import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HeatmapFilterGroup } from './HeatmapFilterGroup'

const OPTIONS: { value: string; label: string }[] = [
  { value: 'A', label: 'Opción A' },
  { value: 'B', label: 'Opción B' }
]

function renderGroup(selected: string[]) {
  const onChange = vi.fn()
  render(
    <Theme>
      <HeatmapFilterGroup
        label="Grupo"
        triggerAriaLabel="Filtro de prueba"
        options={OPTIONS}
        selected={selected}
        onChange={onChange}
      />
    </Theme>
  )
  return onChange
}

describe('HeatmapFilterGroup', () => {
  it('shows "Todos" on the trigger when everything is selected', () => {
    renderGroup(['A', 'B'])

    expect(screen.getByRole('button', { name: 'Filtro de prueba' })).toHaveTextContent('Todos')
  })

  it('shows "Ninguno" when nothing is selected', () => {
    renderGroup([])

    expect(screen.getByRole('button', { name: 'Filtro de prueba' })).toHaveTextContent('Ninguno')
  })

  it('shows the count when only a subset is selected', () => {
    renderGroup(['A'])

    expect(screen.getByRole('button', { name: 'Filtro de prueba' })).toHaveTextContent(
      '1 seleccionados'
    )
  })

  it('selects every option when "Todos" is checked', async () => {
    const user = userEvent.setup()
    const onChange = renderGroup([])

    await user.click(screen.getByRole('button', { name: 'Filtro de prueba' }))
    await user.click(await screen.findByRole('checkbox', { name: 'Todos' }))

    expect(onChange).toHaveBeenCalledWith(['A', 'B'])
  })

  it('calls onChange with the remaining values when an option is toggled off', async () => {
    const user = userEvent.setup()
    const onChange = renderGroup(['A', 'B'])

    await user.click(screen.getByRole('button', { name: 'Filtro de prueba' }))
    await user.click(await screen.findByText('Opción A'))

    expect(onChange).toHaveBeenCalledWith(['B'])
  })
})
