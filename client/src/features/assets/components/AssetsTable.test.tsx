import { fireEvent, render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { UseQueryResult } from '@tanstack/react-query'
import { AssetsTable } from './AssetsTable'
import { useAssetsStore } from '../store/useAssetsStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import type { Asset, Zone } from '../../../shared/types/domain.types'

vi.mock('../../../shared/services/useZonesQuery')

const mockedUseZonesQuery = vi.mocked(useZonesQuery)

const FIRST_ASSET: Asset = {
  id: '1',
  type: 'BIN',
  status: 'OK',
  lat: -34.60371234,
  lng: -58.38161234,
  address: 'Av. Corrientes 1',
  zoneId: '1'
}

const SECOND_ASSET: Asset = {
  id: '2',
  type: 'CONTAINER',
  status: 'FULL',
  lat: -34.5875,
  lng: -58.4205,
  address: 'Av. Santa Fe 2',
  zoneId: '2'
}

const ASSETS: Asset[] = [FIRST_ASSET, SECOND_ASSET]

const ZONES: Zone[] = [
  { id: '1', name: 'Microcentro' },
  { id: '2', name: 'Palermo' }
]

function renderTable() {
  return render(
    <Theme>
      <AssetsTable />
    </Theme>
  )
}

beforeEach(() => {
  useAssetsStore.setState({ assets: [] })
  mockedUseZonesQuery.mockReturnValue({ data: ZONES } as unknown as UseQueryResult<Zone[]>)
})

describe('AssetsTable', () => {
  it('renders one row per asset with translated type, status, zone and rounded coordinates', () => {
    useAssetsStore.getState().setAssets(ASSETS)
    renderTable()

    expect(screen.getAllByTestId('asset-row')).toHaveLength(2)

    expect(screen.getByText('Cesto')).toBeInTheDocument()
    expect(screen.getByText('OK')).toBeInTheDocument()
    expect(screen.getByText('Microcentro')).toBeInTheDocument()
    expect(screen.getByText('Av. Corrientes 1')).toBeInTheDocument()
    expect(screen.getByText('-34.6037')).toBeInTheDocument()
    expect(screen.getByText('-58.3816')).toBeInTheDocument()

    expect(screen.getByText('Contenedor')).toBeInTheDocument()
    expect(screen.getByText('Completo')).toBeInTheDocument()
    expect(screen.getByText('Palermo')).toBeInTheDocument()
  })

  it('falls back to the raw zoneId while zones have not loaded yet', () => {
    mockedUseZonesQuery.mockReturnValue({ data: undefined } as unknown as UseQueryResult<Zone[]>)
    useAssetsStore.getState().setAssets([FIRST_ASSET])
    renderTable()

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders no rows when there are no assets', () => {
    renderTable()

    expect(screen.queryAllByTestId('asset-row')).toHaveLength(0)
  })

  it('paginates at 15 rows per page and navigates to the next page', () => {
    const manyAssets: Asset[] = Array.from({ length: 17 }, (_, index) => ({
      id: `${index + 1}`,
      type: 'BIN',
      status: 'OK',
      lat: -34.6,
      lng: -58.4,
      address: `Dirección ${index + 1}`,
      zoneId: '1'
    }))
    useAssetsStore.getState().setAssets(manyAssets)
    renderTable()

    expect(screen.getAllByTestId('asset-row')).toHaveLength(15)
    expect(screen.getByText('Mostrando 1–15 de 17')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Página siguiente'))

    expect(screen.getAllByTestId('asset-row')).toHaveLength(2)
    expect(screen.getByText('Mostrando 16–17 de 17')).toBeInTheDocument()
  })
})
