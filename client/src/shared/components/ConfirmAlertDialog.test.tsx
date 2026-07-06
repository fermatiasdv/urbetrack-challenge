import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmAlertDialog } from './ConfirmAlertDialog'

describe('ConfirmAlertDialog', () => {
  it('calls onAccept and closes when the accept button is clicked', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <Theme>
        <ConfirmAlertDialog
          open
          onOpenChange={onOpenChange}
          title="¿Confirmar?"
          description="Descripción"
          onAccept={onAccept}
        />
      </Theme>
    )

    await user.click(screen.getByRole('button', { name: 'Aceptar' }))

    expect(onAccept).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not call onAccept when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()

    render(
      <Theme>
        <ConfirmAlertDialog
          open
          onOpenChange={vi.fn()}
          title="¿Confirmar?"
          description="Descripción"
          onAccept={onAccept}
        />
      </Theme>
    )

    await user.click(screen.getByRole('button', { name: 'No' }))

    expect(onAccept).not.toHaveBeenCalled()
  })

  it('supports custom accept/cancel labels', () => {
    render(
      <Theme>
        <ConfirmAlertDialog
          open
          onOpenChange={vi.fn()}
          title="Título"
          description="Descripción"
          acceptLabel="Sí, continuar"
          cancelLabel="Volver"
          onAccept={vi.fn()}
        />
      </Theme>
    )

    expect(screen.getByRole('button', { name: 'Sí, continuar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument()
  })
})
