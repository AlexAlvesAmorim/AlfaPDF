// ============================================================================
//  build-installer.mjs
//  Orquestra o build do ALFA PDF Reader Pro v10 + geracao do instalador
//  Inno Setup profissional com a cara do projeto (dark + vermelho).
//
//  Uso:  npm run dist:installer
// ============================================================================
import { execSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

const log = (m) => console.log(`\n[ALFA] ${m}`)
const run = (cmd, opts = { stdio: 'inherit', cwd: ROOT }) => {
  log(`> ${cmd}`)
  execSync(cmd, opts)
}

// 1) Localiza o ISCC.exe (Inno Setup 6)
function findIscc() {
  const cands = [
    process.env.ALFAPDF_ISCC,
    'C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe',
    'C:\\Program Files\\Inno Setup 6\\ISCC.exe',
    `${process.env.LOCALAPPDATA}\\Programs\\Inno Setup 6\\ISCC.exe`,
  ].filter(Boolean)
  for (const c of cands) if (existsSync(c)) return c
  return null
}

async function main() {
  log('Iniciando geracao do instalador profissional ALFA PDF Reader Pro v10')

  // 2) Build do app (electron-vite + electron-builder -> win-unpacked)
  log('Compilando aplicacao (electron-vite + electron-builder)...')
  run('npm run dist')

  // 3) Garante que a pasta de saida existe
  const outDir = resolve(ROOT, 'release')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  // 4) Localiza ISCC
  const iscc = findIscc()
  if (!iscc) {
    console.error('\n[ALFA][ERRO] Inno Setup 6 nao encontrado.')
    console.error('Baixe em https://jrsoftware.org/isdl.php  e instale,')
    console.error('ou defina a var de ambiente ALFAPDF_ISCC apontando para ISCC.exe')
    process.exit(1)
  }
  log(`Inno Setup encontrado: ${iscc}`)

  // 5) Compila o instalador
  const iss = resolve(ROOT, 'installer', 'ALFA-PDF-Reader.iss')
  if (!existsSync(iss)) {
    console.error(`\n[ALFA][ERRO] Script nao encontrado: ${iss}`)
    process.exit(1)
  }
  log(`Compilando instalador: ${iss}`)
  const r = spawnSync(iscc, [`/Q`, iss], { stdio: 'inherit', cwd: ROOT })
  if (r.status !== 0) {
    console.error(`\n[ALFA][ERRO] ISCC falhou (exit ${r.status})`)
    process.exit(r.status ?? 1)
  }

  // 6) Sucesso
  const exe = resolve(outDir, 'ALFA-PDF-Reader-Pro-v10-Setup-x64.exe')
  log('=========================================')
  log('Instalador gerado com sucesso:')
  log(exe)
  log('=========================================')
}

main().catch((e) => {
  console.error('\n[ALFA][FALHA]', e)
  process.exit(1)
})
