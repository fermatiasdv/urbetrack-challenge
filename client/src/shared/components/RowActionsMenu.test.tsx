import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { describe, expect, it, vi } from 'vitest'
import { RowActionsMenu } from './RowActionsMenu'

describe('RowActionsMenu', () => {
  it('opens the menu and invokes onSelect for the clicked item', async () => {
    const user = userEvent.setup()
    const onSelectDetails = vi.fn()
    const onSelectDelete = vi.fn()

    render(
      <Theme>
        <RowActionsMenu
          triggerAriaLabel="Acciones"
          items={[
            { label: 'Detalles', onSelect: onSelectDetails },
            { label: 'Eliminar', color: 'red', onSelect: onSelectDelete }
          ]}
        />
      </Theme>
    )

    await user.click(screen.getByRole('button', { name: 'Acciones' }))
    await user.click(await screen.findByText('Detalles'))

    expect(onSelectDetails).toHaveBeenCalledTimes(1)
    expect(onSelectDelete).not.toHaveBeenCalled()
  })
})
