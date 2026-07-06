import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { UseQueryResult } from '@tanstack/react-query'
import { AssetModal } from './AssetModal'
import { useAssetsStore } from '../store/useAssetsStore'
import { useAssetModalStore } from '../store/useAssetModalStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import type { Asset, Zone } from '../../../shared/types/domain.types'

vi.mock('../../../shared/services/useZonesQuery')

const mockedUseZonesQuery = vi.mocked(useZonesQuery)

const ASSET: Asset = {
  id: '1',
  type: 'BIN',
  status: 'DAMAGED',
  lat: -34.6037,
  lng: -58.3816,
  address: 'Av. Corrientes 1',
  zoneId: '1'
}

const ZONES: Zone[] = [{ id: '1', name: 'Microcentro' }]

function renderModal() {
  return render(
    <Theme>
      <AssetModal />
    </Theme>
  )
}

beforeEach(() => {
  useAssetsStore.setState({ assets: [ASSET] })
  useAssetModalStore.setState({ assetId: null, mode: null })
  mockedUseZonesQuery.mockReturnValue({ data: ZONES } as unknown as UseQueryResult<Zone[]>)
})

describe('AssetModal', () => {
  it('renders nothing when there is no asset selected', () => {
    renderModal()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes itself without rendering if the selected asset no longer exists', () => {
    useAssetModalStore.getState().open('missing', 'details')
    renderModal()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(useAssetModalStore.getState().assetId).toBeNull()
  })

  it('opens read-only with "Cerrar"/"Modificar" when mode is "details"', () => {
    useAssetModalStore.getState().open('1', 'details')
    renderModal()

    expect(screen.getByText('Cesto')).toBeInTheDocument()
    expect(screen.getByText('Microcentro')).toBeInTheDocument()
    expect(screen.getByText('Av. Corrientes 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Modificar' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument()
  })

  it('opens directly in edit mode with "Cancelar"/"Guardar" when mode is "edit"', () => {
    useAssetModalStore.getState().open('1', 'edit')
    renderModal()

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('"Modificar" switches the read-only view into the edit form', async () => {
    const user = userEvent.setup()
    useAssetModalStore.getState().open('1', 'details')
    renderModal()

    await user.click(screen.getByRole('button', { name: 'Modificar' }))

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('saves the selected status to the global store and closes the modal', async () => {
    const user = userEvent.setup()
    useAssetModalStore.getState().open('1', 'edit')
    renderModal()

    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(await screen.findByRole('option', { name: 'OK' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(useAssetsStore.getState().assets[0]).toEqual({ ...ASSET, status: 'OK' })
    expect(useAssetModalStore.getState().assetId).toBeNull()
  })

  it('"Cancelar" discards the draft and closes when opened directly in edit mode', async () => {
    const user = userEvent.setup()
    useAssetModalStore.getState().open('1', 'edit')
    renderModal()

    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(await screen.findByRole('option', { name: 'OK' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(useAssetsStore.getState().assets[0]).toEqual(ASSET)
    expect(useAssetModalStore.getState().assetId).toBeNull()
  })

  it('"Cancelar" returns to the read-only view (without closing) when opened from "details"', async () => {
    const user = userEvent.setup()
    useAssetModalStore.getState().open('1', 'details')
    renderModal()

    await user.click(screen.getByRole('button', { name: 'Modificar' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(useAssetModalStore.getState().assetId).toBe('1')
    expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument()
    expect(useAssetsStore.getState().assets[0]).toEqual(ASSET)
  })

  it('closes without saving when the overlay is dismissed (Escape)', async () => {
    const user = userEvent.setup()
    useAssetModalStore.getState().open('1', 'edit')
    renderModal()

    await user.keyboard('{Escape}')

    expect(useAssetModalStore.getState().assetId).toBeNull()
    expect(useAssetsStore.getState().assets[0]).toEqual(ASSET)
  })
})
