import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePdfTabs } from '../../shared/hooks/usePdfTabs'

function createFakeBlob(): Blob {
  return new Blob(['fake-pdf'], { type: 'application/pdf' })
}

describe('usePdfTabs', () => {
  it('starts with no tabs', () => {
    const { result } = renderHook(() => usePdfTabs())
    expect(result.current.tabs).toHaveLength(0)
    expect(result.current.activeTab).toBeNull()
  })

  it('opens a new tab and sets it active', () => {
    const { result } = renderHook(() => usePdfTabs())
    const blob = createFakeBlob()

    act(() => {
      result.current.openPdf(blob, 'test.pdf')
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeTab).not.toBeNull()
    expect(result.current.activeTab?.name).toBe('test.pdf')
  })

  it('closes tab and activates the next available', () => {
    const { result } = renderHook(() => usePdfTabs())
    const blob = createFakeBlob()

    act(() => {
      result.current.openPdf(blob, 'a.pdf')
    })
    act(() => {
      result.current.openPdf(blob, 'b.pdf')
    })
    act(() => {
      result.current.openPdf(blob, 'c.pdf')
    })

    const firstId = result.current.tabs[0].id

    act(() => {
      result.current.closeTab(firstId)
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.tabs.some((t) => t.id === firstId)).toBe(false)
  })

  it('switch tab changes activeTabId', () => {
    const { result } = renderHook(() => usePdfTabs())
    const blob = createFakeBlob()

    act(() => {
      result.current.openPdf(blob, 'first.pdf')
    })
    act(() => {
      result.current.openPdf(blob, 'second.pdf')
    })

    const firstId = result.current.tabs[0].id

    act(() => {
      result.current.switchTab(firstId)
    })

    expect(result.current.activeTabId).toBe(firstId)
  })

  it('updateTab modifies the target tab properties', () => {
    const { result } = renderHook(() => usePdfTabs())
    const blob = createFakeBlob()

    act(() => {
      result.current.openPdf(blob, 'doc.pdf')
    })

    const tabId = result.current.activeTabId!

    act(() => {
      result.current.updateTab(tabId, { currentPage: 5, zoom: 1.5 })
    })

    const updated = result.current.tabs.find((t) => t.id === tabId)
    expect(updated?.currentPage).toBe(5)
    expect(updated?.zoom).toBe(1.5)
  })

  it('tracks password when opening a tab', () => {
    const { result } = renderHook(() => usePdfTabs())
    const blob = createFakeBlob()

    act(() => {
      result.current.openPdf(blob, 'protected.pdf', 'secret123')
    })

    expect(result.current.activeTab?.password).toBe('secret123')
  })
})