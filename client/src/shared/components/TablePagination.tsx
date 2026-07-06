import type { JSX } from 'react'
import { Button, Flex, Text } from '@radix-ui/themes'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  tablePaginationContainerStyle,
  tablePaginationSummaryTextStyle
} from './tablePagination.styles'

export interface TablePaginationProps {
  /** 0-based current page index. */
  pageIndex: number
  /** Total number of pages, given the current filtered row count and `pageSize`. */
  pageCount: number
  /** Total row count after filtering (before slicing into the current page). */
  totalRows: number
  /** Fixed page size (see `shared/constants/tablePagination.ts`). */
  pageSize: number
  onPageChange: (pageIndex: number) => void
}

/**
 * Pagination footer shared by `VehiclesTable`/`AssetsTable`/`IncidentsTable`
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #1).
 * Purely presentational: it receives already-computed pagination state from
 * `@tanstack/react-table` (via each table's `useReactTable` instance) and only
 * renders the "Mostrando X–Y de Z" summary plus Anterior/Siguiente controls —
 * it doesn't know about vehicles, assets or incidents.
 */
export function TablePagination({
  pageIndex,
  pageCount,
  totalRows,
  pageSize,
  onPageChange
}: TablePaginationProps): JSX.Element | null {
  if (totalRows === 0) {
    return null
  }

  const firstRow = pageIndex * pageSize + 1
  const lastRow = Math.min(firstRow + pageSize - 1, totalRows)
  const canGoPrevious = pageIndex > 0
  const canGoNext = pageIndex < pageCount - 1

  return (
    <Flex justify="between" align="center" style={tablePaginationContainerStyle}>
      <Text as="span" style={tablePaginationSummaryTextStyle}>
        Mostrando {firstRow}–{lastRow} de {totalRows}
      </Text>
      <Flex align="center" gap="3">
        <Button
          variant="soft"
          color="gray"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(pageIndex - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} aria-hidden />
          Anterior
        </Button>
        <Text as="span" style={tablePaginationSummaryTextStyle}>
          Página {pageIndex + 1} de {pageCount}
        </Text>
        <Button
          variant="soft"
          color="gray"
          disabled={!canGoNext}
          onClick={() => onPageChange(pageIndex + 1)}
          aria-label="Página siguiente"
        >
          Siguiente
          <ChevronRight size={16} aria-hidden />
        </Button>
      </Flex>
    </Flex>
  )
}
