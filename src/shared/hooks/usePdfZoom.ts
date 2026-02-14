const MIN = 0.5
const MAX = 3.0
const DEFAULT = 1.0

export function usePdfZoom(
  scale: number,
  onChange: (scale: number) => void
) {
  function zoomIn() {
    onChange(Math.min(scale * 1.2, MAX))
  }

  function zoomOut() {
    onChange(Math.max(scale / 1.2, MIN))
  }

  function resetZoom() {
    onChange(DEFAULT)
  }

  const zoomPercentage = Math.round(scale * 100)

  return {
    zoomPercentage,
    zoomIn,
    zoomOut,
    resetZoom
  }
}