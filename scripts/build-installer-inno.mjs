#!/usr/bin/env node
// ============================================================================
// Build script para ALFA PDF Reader usando Inno Setup + GitHub Releases
// ============================================================================

import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, renameSync } from 'fs'
import { resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'
import { rcedit } from 'rcedit'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const RELEASE_DIR = join(ROOT, 'release')
const INSTALLER_DIR = join(ROOT, 'installer')
const PACKAGE_JSON = join(ROOT, 'package.json')
const APP_EXE_NAME = 'ALFA PDF Reader.exe'
const APP_UPDATE_YML = `owner: AlexAlvesAmorim
repo: AlfaPDF
provider: github
releaseType: release
updaterCacheDirName: alfa-pdf-reader-updater
`

function run(cmd, cwd = ROOT) {
  console.log(`$ ${cmd}`)
  // Use cmd /c on Windows to handle paths with spaces
  const isWindows = process.platform === 'win32'
  const fullCmd = isWindows ? `cmd /c "${cmd}"` : cmd
  execSync(fullCmd, { cwd, stdio: 'inherit' })
}

function getVersion() {
  const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf-8'))
  return pkg.version
}

// Regenera release/win-unpacked a partir do build atual, evitando artefatos
// antigos (o bug da v2.1.0 foi causado por win-unpacked desatualizado).
async function rebuildWinUnpacked() {
  const electronDist = join(ROOT, 'node_modules', 'electron', 'dist')
  const target = join(RELEASE_DIR, 'win-unpacked')

  console.log('\n🧹 Regenerando win-unpacked a partir do build atual...')
  rmSync(target, { recursive: true, force: true })
  mkdirSync(target, { recursive: true })

  // 1. Runtime do Electron (versão atual instalada)
  cpSync(electronDist, target, { recursive: true })

  // 2. Renomeia o executável
  renameSync(join(target, 'electron.exe'), join(target, APP_EXE_NAME))

  // 3. Aplica ícone + metadados no executável (rcedit)
  const icon = join(INSTALLER_DIR, 'assets', 'alfa.ico')
  if (existsSync(icon)) {
    console.log(`🖼️  Aplicando ícone ${icon} em ${APP_EXE_NAME}...`)
    await rcedit(join(target, APP_EXE_NAME), { 'set-icon': icon })
  }

  // 4. Cria resources/app com o app empacotado
  const appDir = join(target, 'resources', 'app')
  mkdirSync(appDir, { recursive: true })

  const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf-8'))
  const appPkg = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    main: 'out/main/index.js',
    dependencies: pkg.dependencies,
  }
  writeFileSync(join(appDir, 'package.json'), JSON.stringify(appPkg, null, 2))

  // 5. Código compilado (out/)
  cpSync(join(ROOT, 'out'), join(appDir, 'out'), { recursive: true })

  // 6. node_modules de produção — apenas os arquivos de runtime necessários.
  //    O main process é totalmente bundled (electron-vite); o único acesso por
  //    caminho é a cópia do pdf.js para a janela de impressão (copyPdfjsToTemp).
  const nmTarget = join(appDir, 'node_modules')
  const pdfjsBuild = join(ROOT, 'node_modules', 'pdfjs-dist', 'build')
  const nmPdfjs = join(nmTarget, 'pdfjs-dist', 'build')
  mkdirSync(nmPdfjs, { recursive: true })
  cpSync(join(pdfjsBuild, 'pdf.mjs'), join(nmPdfjs, 'pdf.mjs'))
  cpSync(join(pdfjsBuild, 'pdf.worker.mjs'), join(nmPdfjs, 'pdf.worker.mjs'))

  // 7. Manifesto do auto-updater (feed do GitHub)
  writeFileSync(join(target, 'resources', 'app-update.yml'), APP_UPDATE_YML)

  console.log(`✅ win-unpacked regenerado (versão ${pkg.version})`)
}

async function main() {
  const version = getVersion()
  const versionTag = `v${version}`
  // Usa a versão completa no nome do instalador
  const installerName = `ALFA-PDF-Reader-${version}-Setup-x64.exe`

  console.log(`\n🚀 Building ALFA PDF Reader ${version}\n`)

// 1. Build Electron app (electron-vite -> out/)
  console.log('\ndY"� Building Electron app...')
  const electronVitePath = join(ROOT, 'node_modules', 'electron-vite', 'bin', 'electron-vite.js')
  run(`node "${electronVitePath}" build`)

  // 1.5 Regenerar win-unpacked a partir do build atual (evita artefatos antigos)
  await rebuildWinUnpacked()

  // 2. Compilar Inno Setup
  console.log('\n🔨 Compiling Inno Setup installer...')
  const issPath = join(INSTALLER_DIR, 'ALFA-PDF-Reader.iss')
  if (!existsSync(issPath)) {
    throw new Error(`Inno Setup script not found: ${issPath}`)
  }

  // Atualiza versão no .iss se necessário
  let issContent = readFileSync(issPath, 'utf-8')
  issContent = issContent.replace(/#define MyAppVersion\s+".+"/, `#define MyAppVersion "${version}"`)
  issContent = issContent.replace(/#define MyAppSuite\s+".+"/, `#define MyAppSuite "${version}"`)
  issContent = issContent.replace(
    /(OutputBaseFilename=ALFA-PDF-Reader-)\d+\.\d+(?=-Setup-x64)/,
    `$1${version}`
  )
  writeFileSync(issPath, issContent)

  // Tenta encontrar ISCC.exe (Inno Setup Compiler)
  const isccPaths = [
    'ISCC.exe', // PATH (chocolatey adiciona ao PATH)
    'C:\\ProgramData\\chocolatey\\bin\\ISCC.exe', // chocolatey
    'C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe',
    'C:\\Program Files\\Inno Setup 6\\ISCC.exe',
    'C:\\Users\\Administrator\\AppData\\Local\\Programs\\Inno Setup 6\\ISCC.exe',
  ]

  let iscc = null
  for (const p of isccPaths) {
    try {
      const isWindows = process.platform === 'win32'
      const testCmd = isWindows ? `cmd /c "${p}" /?` : `"${p}" /?`
      // ISCC.exe returns exit code 1 for /? (help), which is normal
      execSync(testCmd, { stdio: 'ignore' })
      iscc = p
      break
    } catch (e) {
      // Exit code 1 for /? is OK (help output), treat as success
      if (e.status === 1) {
        iscc = p
        break
      }
      continue
    }
  }

  if (!iscc) {
    throw new Error('ISCC.exe não encontrado. Instale Inno Setup 6 e adicione ao PATH.')
  }

  run(`"${iscc}" "${issPath}"`)

  // 3. Verifica se instalador foi gerado
  const installerPath = join(RELEASE_DIR, installerName)
  if (!existsSync(installerPath)) {
    throw new Error(`Instalador não gerado: ${installerPath}`)
  }

  console.log(`\n✅ Instalador criado: ${installerPath}`)

  // 3.5. Gerar latest.yml para electron-updater
  const latestYmlPath = join(RELEASE_DIR, 'latest.yml')
  const sha512 = createHash('sha512').update(readFileSync(installerPath)).digest('base64')
  const latestYmlContent = `version: ${version}
path: ${installerName}
sha512: ${sha512}
releaseDate: ${new Date().toISOString()}
files:
  - url: ${installerName}
    sha512: ${sha512}
    size: ${(readFileSync(installerPath)).length}
`
  writeFileSync(latestYmlPath, latestYmlContent)
  console.log(`\n📄 latest.yml gerado: ${latestYmlPath}`)

  // 4. Publicar no GitHub Releases (requer GH_TOKEN)
  if (process.env.GH_TOKEN) {
    console.log('\n📤 Publicando no GitHub Releases...')
    try {
      run(`gh release create ${versionTag} "${installerPath}" "${latestYmlPath}" --title "ALFA PDF Reader ${version}" --notes-file release-notes.md --repo AlexAlvesAmorim/AlfaPDF`)
      console.log('\n✅ Publicado com sucesso!')
    } catch (e) {
      console.error('\n❌ Falha ao publicar:', e.message)
      process.exit(1)
    }
  } else {
    console.log('\n⚠️  GH_TOKEN não definido. Pule a publicação manual:')
    console.log(`   gh release create ${versionTag} "${installerPath}" "${latestYmlPath}" --title "ALFA PDF Reader ${version}" --notes-file release-notes.md --repo AlexAlvesAmorim/AlfaPDF`)
  }

  console.log('\n🎉 Build completo!')
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message)
  process.exit(1)
})