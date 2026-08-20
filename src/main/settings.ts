import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import type { PrintSettings } from '../shared/types/types'

export interface RecentFile {
  path: string
  name: string
  openedAt: number
}

export interface AppSettings {
  print: Partial<PrintSettings>
  recent: RecentFile[]
}

const MAX_RECENT = 10

const defaults: AppSettings = {
  print: {
    copies: 1,
    color: true,
    pageRange: 'all',
    printQuality: 'normal',
  },
  recent: [],
}

let cache: AppSettings | null = null

function settingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json')
}

export function loadSettings(): AppSettings {
  if (cache) return cache

  try {
    const raw = fs.readFileSync(settingsPath(), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    cache = {
      print: { ...defaults.print, ...(parsed.print ?? {}) },
      recent: Array.isArray(parsed.recent) ? parsed.recent.slice(0, MAX_RECENT) : [],
    }
  } catch {
    cache = structuredClone(defaults)
  }

  return cache
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const current = loadSettings()

  cache = {
    print: { ...current.print, ...(partial.print ?? {}) },
    recent: partial.recent ?? current.recent,
  }

  try {
    fs.writeFileSync(settingsPath(), JSON.stringify(cache, null, 2), 'utf-8')
  } catch (err) {
    console.error('[settings] Falha ao salvar configurações:', err)
  }

  return cache
}

export function addRecentFile(filePath: string): RecentFile[] {
  const current = loadSettings()
  const normalized = path.normalize(filePath)

  const next: RecentFile[] = [
    { path: normalized, name: path.basename(normalized), openedAt: Date.now() },
    ...current.recent.filter((r) => path.normalize(r.path) !== normalized),
  ].slice(0, MAX_RECENT)

  saveSettings({ recent: next })
  return next
}

export function getRecentFiles(): RecentFile[] {
  return loadSettings().recent
}

export function clearRecentFiles(): RecentFile[] {
  saveSettings({ recent: [] })
  return []
}