import { useCallback } from 'react'

export function usePdfNavigation(
  totalPages: number,
  currentPage: number,
  onChange: (page: number) => void
) {
  const goToPage = useCallback((pageNum: number) => {
    const targetPage = Math.max(1, Math.min(pageNum, totalPages))
    onChange(targetPage)
  }, [totalPages, onChange])

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onChange(currentPage + 1)
    }
  }, [currentPage, totalPages, onChange])

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      onChange(currentPage - 1)
    }
  }, [currentPage, onChange])

  const goToFirstPage = useCallback(() => {
    onChange(1)
  }, [onChange])

  const goToLastPage = useCallback(() => {
    onChange(totalPages)
  }, [totalPages, onChange])

  return {
    currentPage,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage
  }
}