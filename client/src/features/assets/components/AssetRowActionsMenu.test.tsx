import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it } from 'vitest'
import { AssetRowActionsMenu } from './AssetRowActionsMenu'
import { useAssetModalStore } from '../store/useAssetModalStore'
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

function renderMenu() {
  return render(
    <Theme>
      <AssetRowActionsMenu asset={ASSET} />
    </Theme>
  )
}

beforeEach(() => {
  useAssetModalStore.setState({ assetId: null, mode: null })
  useAssetsStore.setState({ assets: [ASSET] })
})

describe('AssetRowActionsMenu', () => {
  it('opens the modal store in "details" mode when "Detalles" is selected', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: /acciones para el activo cesto/i }))
    await user.click(await screen.findByText('Detalles'))

    expect(useAssetModalStore.getState()).toMatchObject({ assetId: '1', mode: 'details' })
  })

  it('opens the modal store in "edit" mode when "Editar" is selected', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: /acciones para el activo cesto/i }))
    await user.click(await screen.findByText('Editar'))

    expect(useAssetModalStore.getState()).toMatchObject({ assetId: '1', mode: 'edit' })
  })

  it('opens the delete dialog when "Eliminar" is selected, without deleting', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: /acciones para el activo cesto/i }))
    await user.click(await screen.findByText('Eliminar'))

    expect(await screen.findByText('¿Eliminar activo?')).toBeInTheDocument()
    expect(useAssetsStore.getState().assets).toEqual([ASSET])
  })
})
