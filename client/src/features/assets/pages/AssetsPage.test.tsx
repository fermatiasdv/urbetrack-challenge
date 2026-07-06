import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { UseQueryResult } from '@tanstack/react-query'
import { AssetsPage } from './AssetsPage'
import { useAssetsQuery } from '../../../shared/services/assets/useAssetsQuery'
import { useAssetModalStore } from '../store/useAssetModalStore'
import type { Asset } from '../../../shared/types/domain.types'

vi.mock('../../../shared/services/assets/useAssetsQuery')

vi.mock('../components/AssetsFilterBar', () => ({
  AssetsFilterBar: () => <div data-testid="assets-filter-bar" />
}))

vi.mock('../components/AssetsTable', () => ({
  AssetsTable: () => <div data-testid="assets-table" />
}))

vi.mock('../components/AssetModal', () => ({
  AssetModal: () => <div data-testid="asset-modal" />
}))

const mockedUseAssetsQuery = vi.mocked(useAssetsQuery)

function renderPage() {
  return render(
    <Theme>
      <AssetsPage />
    </Theme>
  )
}

describe('AssetsPage', () => {
  it('renders the skeleton while the query is loading', () => {
    mockedUseAssetsQuery.mockReturnValue({
      isLoading: true
    } as unknown as UseQueryResult<Asset[]>)

    renderPage()

    expect(screen.getByText('Activos')).toBeInTheDocument()
    expect(screen.queryByTestId('assets-filter-bar')).not.toBeInTheDocument()
  })

  it('renders the asset status cards, filter bar and table once loading finishes', () => {
    mockedUseAssetsQuery.mockReturnValue({
      isLoading: false
    } as unknown as UseQueryResult<Asset[]>)

    renderPage()

    expect(screen.getByText('Total de Activos')).toBeInTheDocument()
    expect(screen.getByTestId('assets-filter-bar')).toBeInTheDocument()
    expect(screen.getByTestId('assets-table')).toBeInTheDocument()
  })

  it('opens the create modal when "Agregar Activo" is clicked', async () => {
    const user = userEvent.setup()
    useAssetModalStore.setState({ assetId: null, mode: null })

    mockedUseAssetsQuery.mockReturnValue({
      isLoading: false
    } as unknown as UseQueryResult<Asset[]>)

    renderPage()

    await user.click(screen.getByRole('button', { name: 'Agregar Activo' }))

    expect(useAssetModalStore.getState()).toMatchObject({ assetId: null, mode: 'create' })
  })
})
