import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    entry: 'src/main/index.ts',
    vite: {
      build: {
        rollupOptions: {
          treeshake: {
            moduleSideEffects: true
          },
          external: ['electron']
        }
      }
    }
  },
  preload: {
    entry: 'src/preload/index.ts',
    vite: {
      build: {
        minify: false,
        rollupOptions: {
          external: ['electron'],
          output: {
            format: 'cjs',
            entryFileNames: 'index.js'
          }
        }
      }
    }
  },
  renderer: {
    plugins: [react()]
  }
})