import { useState, useCallback } from 'react'

export function usePdfNavigation(totalPages: number) {
  const [currentPage, setCurrentPage] = useState(1)

  const goToPage = useCallback((pageNum: number) => {
    const targetPage = Math.max(1, Math.min(pageNum, totalPages))
    setCurrentPage(targetPage)
  }, [totalPages])

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages)
  }, [totalPages])

  return {
    currentPage,
    setCurrentPage,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage
  }
}