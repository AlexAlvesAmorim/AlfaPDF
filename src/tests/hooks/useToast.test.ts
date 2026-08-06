import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useToast } from '../../shared/hooks/useToast'

describe('useToast', () => {
  it('starts with empty toast list', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toasts).toHaveLength(0)
  })

  it('shows a toast with default type info', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Hello world')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Hello world')
    expect(result.current.toasts[0].type).toBe('info')
  })

  it('shows different toast types', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Success!', 'success')
    })

    expect(result.current.toasts[0].type).toBe('success')
  })

  it('removes a toast by id', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('First')
    })
    act(() => {
      result.current.showToast('Second')
    })

    const firstId = result.current.toasts[0].id

    act(() => {
      result.current.removeToast(firstId)
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Second')
  })

  it('accepts custom duration', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('With duration', 'info', 8000)
    })

    expect(result.current.toasts[0].duration).toBe(8000)
  })
})