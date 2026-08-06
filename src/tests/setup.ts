import '@testing-library/jest-dom/vitest'

let counter = 0

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => `00000000-0000-0000-0000-${String(counter++).padStart(12, '0')}`,
  },
  writable: true,
})