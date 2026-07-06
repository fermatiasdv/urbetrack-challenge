import { fireEvent, render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { describe, expect, it, vi } from 'vitest'
import { TablePagination } from './TablePagination'

describe('TablePagination', () => {
  it('renders nothing when there are no rows', () => {
    render(
      <Theme>
        <TablePagination
          pageIndex={0}
          pageCount={0}
          totalRows={0}
          pageSize={15}
          onPageChange={vi.fn()}
        />
      </Theme>
    )

    // `Theme` always renders its own wrapping element, so the empty-render
    // assertion checks that `TablePagination` itself contributed nothing
    // (no summary text, no buttons) instead of asserting the whole container
    // is empty.
    expect(screen.queryByLabelText('Página anterior')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Página siguiente')).not.toBeInTheDocument()
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument()
  })

  it('renders the row range and page summary', () => {
    render(
      <Theme>
        <TablePagination
          pageIndex={1}
          pageCount={3}
          totalRows={32}
          pageSize={15}
          onPageChange={vi.fn()}
        />
      </Theme>
    )

    expect(screen.getByText('Mostrando 16–30 de 32')).toBeInTheDocument()
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
  })

  it('disables "Anterior" on the first page and "Siguiente" on the last page', () => {
    const { rerender } = render(
      <Theme>
        <TablePagination
          pageIndex={0}
          pageCount={2}
          totalRows={20}
          pageSize={15}
          onPageChange={vi.fn()}
        />
      </Theme>
    )
    expect(screen.getByLabelText('Página anterior')).toBeDisabled()
    expect(screen.getByLabelText('Página siguiente')).not.toBeDisabled()

    rerender(
      <Theme>
        <TablePagination
          pageIndex={1}
          pageCount={2}
          totalRows={20}
          pageSize={15}
          onPageChange={vi.fn()}
        />
      </Theme>
    )
    expect(screen.getByLabelText('Página anterior')).not.toBeDisabled()
    expect(screen.getByLabelText('Página siguiente')).toBeDisabled()
  })

  it('calls onPageChange with the next/previous page index', () => {
    const onPageChange = vi.fn()
    render(
      <Theme>
        <TablePagination
          pageIndex={1}
          pageCount={3}
          totalRows={32}
          pageSize={15}
          onPageChange={onPageChange}
        />
      </Theme>
    )

    fireEvent.click(screen.getByLabelText('Página siguiente'))
    expect(onPageChange).toHaveBeenCalledWith(2)

    fireEvent.click(screen.getByLabelText('Página anterior'))
    expect(onPageChange).toHaveBeenCalledWith(0)
  })
})
