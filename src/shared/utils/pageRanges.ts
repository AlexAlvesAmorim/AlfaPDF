export function parsePageRanges(input: string, totalPages: number): number[] {
  const pages = new Set<number>()

  for (const part of input.split(',')) {
    const trimmed = part.trim()

    if (!trimmed) continue

    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number)
      const from = Math.max(1, start || 1)
      const to = Math.min(end, totalPages)
      for (let i = from; i <= to; i++) {
        pages.add(i)
      }
    } else {
      const n = Number(trimmed)
      if (n >= 1 && n <= totalPages) pages.add(n)
    }
  }

  return Array.from(pages).sort((a, b) => a - b)
}