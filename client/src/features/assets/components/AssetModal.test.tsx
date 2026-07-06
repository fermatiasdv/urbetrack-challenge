import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

describe('AssetModal create mode', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('combobox', { name: 'Tipo' }))
    await user.click(await screen.findByRole('option', { name: 'Cesto' }))
    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(await screen.findByRole('option', { name: 'OK' }))
    await user.type(screen.getByLabelText('Dirección'), 'Av. Santa Fe 2')
    await user.click(screen.getByRole('combobox', { name: 'Zona' }))
    await user.click(await screen.findByRole('option', { name: 'Microcentro' }))
    await user.type(screen.getByLabelText('Latitud'), '-34.6')
    await user.type(screen.getByLabelText('Longitud'), '-58.4')
  }

  it('opens the "Agregar Activo" form with "Cancelar"/"Crear"', () => {
    useAssetModalStore.getState().openCreate()
    renderModal()

    expect(screen.getByText('Agregar Activo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument()
  })

  it('blocks "Crear" and shows a validation error for an empty address', async () => {
    const user = userEvent.setup()
    useAssetModalStore.getState().openCreate()
    renderModal()

    await user.click(screen.getByRole('button', { name: 'Crear' }))

    expect(await screen.findByText('La dirección es obligatoria')).toBeInTheDocument()
    expect(useAssetModalStore.getState().mode).toBe('create')
  })

  it('creates the asset via POST, adds it to the store and closes the modal', async () => {
    const user = userEvent.setup()
    const created: Asset = {
      id: '2',
      type: 'BIN',
      status: 'OK',
      address: 'Av. Santa Fe 2',
      zoneId: '1',
      lat: -34.6,
      lng: -58.4
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve(created)
      })
    )
    useAssetModalStore.getState().openCreate()
    renderModal()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    await waitFor(() => expect(useAssetModalStore.getState().mode).toBeNull())
    expect(useAssetsStore.getState().assets).toContainEqual(created)
  })

  it('shows an error and keeps the modal open when the POST fails', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve(null)
      })
    )
    useAssetModalStore.getState().openCreate()
    renderModal()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    expect(await screen.findByText('No fue posible crear el activo.')).toBeInTheDocument()
    expect(useAssetModalStore.getState().mode).toBe('create')
    expect(useAssetsStore.getState().assets).toEqual([ASSET])
  })

  it('"Cancelar" closes the create form without creating anything', async () => {
    const user = userEvent.setup()
    useAssetModalStore.getState().openCreate()
    renderModal()

    await user.type(screen.getByLabelText('Dirección'), 'Av. Santa Fe 2')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(useAssetModalStore.getState().mode).toBeNull()
    expect(useAssetsStore.getState().assets).toEqual([ASSET])
  })
})
