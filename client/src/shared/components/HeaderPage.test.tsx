import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { Plus } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { HeaderPage } from './HeaderPage'

function renderHeader(props: Parameters<typeof HeaderPage>[0]) {
  return render(
    <Theme>
      <HeaderPage {...props} />
    </Theme>
  )
}

describe('HeaderPage', () => {
  it('renders only the title when subtitle and action are not provided', () => {
    renderHeader({ title: 'Vehículos' })

    expect(screen.getByRole('heading', { name: 'Vehículos' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders the subtitle when provided', () => {
    renderHeader({ title: 'Vehículos', subtitle: 'Disponibilidad de los vehículos en tiempo real' })

    expect(screen.getByText('Disponibilidad de los vehículos en tiempo real')).toBeInTheDocument()
  })

  it('renders the action button with its icon and label, and invokes onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    renderHeader({
      title: 'Vehículos',
      action: { label: 'Agregar Vehículo', icon: Plus, onClick }
    })

    const button = screen.getByRole('button', { name: 'Agregar Vehículo' })
    expect(button).toBeInTheDocument()

    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders the action button without an icon when action.icon is not provided', () => {
    renderHeader({
      title: 'Vehículos',
      action: { label: 'Agregar Vehículo', onClick: vi.fn() }
    })

    expect(screen.getByRole('button', { name: 'Agregar Vehículo' })).toBeInTheDocument()
  })
})
