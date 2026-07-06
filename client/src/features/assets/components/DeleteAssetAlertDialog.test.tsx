import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteAssetAlertDialog } from './DeleteAssetAlertDialog'
import { useAssetsStore } from '../store/useAssetsStore'
import type { Asset } from '../../../shared/types/domain.types'

const ASSET: Asset = {
  id: '1',
  type: 'BIN',
  status: 'OK',
  lat: -34.6037,
  lng: -58.3816,
  address: 'Av. Corrientes 1',
  zoneId: '1'
}

function renderDialog(onOpenChange: (open: boolean) => void) {
  return render(
    <Theme>
      <DeleteAssetAlertDialog asset={ASSET} open onOpenChange={onOpenChange} />
    </Theme>
  )
}

beforeEach(() => {
  useAssetsStore.setState({ assets: [ASSET] })
})

describe('DeleteAssetAlertDialog', () => {
  it('shows a confirmation message referencing the asset', () => {
    renderDialog(vi.fn())

    expect(screen.getByText('¿Eliminar activo?')).toBeInTheDocument()
    expect(screen.getByText('Cesto')).toBeInTheDocument()
  })

  it('removes the asset from the store and closes when "Aceptar" is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDialog(onOpenChange)

    await user.click(screen.getByRole('button', { name: 'Aceptar' }))

    expect(useAssetsStore.getState().assets).toEqual([])
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not remove the asset when "No" is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDialog(onOpenChange)

    await user.click(screen.getByRole('button', { name: 'No' }))

    expect(useAssetsStore.getState().assets).toEqual([ASSET])
  })
})
