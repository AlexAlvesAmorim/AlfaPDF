import { useState } from 'react'

const MIN = 1
const MAX = 2.5

export function usePdfZoom() {
  const [scale, setScale] = useState(1.2)

  function zoomIn() {
    setScale(s => Math.min(s * 1.2, MAX))
  }

  function zoomOut() {
    setScale(s => Math.max(s / 1.2, MIN))
  }

  function resetZoom() {
    setScale(1.2)
  }

  return {
    scale,
    zoomIn,
    zoomOut,
    resetZoom
  }
}
