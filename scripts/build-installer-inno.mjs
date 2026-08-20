#!/usr/bin/env node
// ============================================================================
// Build script para ALFA PDF Reader usando Inno Setup + GitHub Releases
// ============================================================================

import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const RELEASE_DIR = join(ROOT, 'release')
const INSTALLER_DIR = join(ROOT, 'installer')
const PACKAGE_JSON = join(ROOT, 'package.json')

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

async function main() {
  const version = getVersion()
  const versionTag = `v${version}`
  // O .iss usa MyAppSuite (2.0) no OutputBaseFilename, não a versão completa
  const suiteVersion = version.split('.').slice(0, 2).join('.') // "2.0"
  const installerName = `ALFA-PDF-Reader-${suiteVersion}-Setup-x64.exe`

  console.log(`\n🚀 Building ALFA PDF Reader ${version}\n`)

  // 1. Build Electron app (produz release/win-unpacked)
  console.log('\n📦 Building Electron app...')
  run('npm run build')

  // 2. Compilar Inno Setup
  console.log('\n🔨 Compiling Inno Setup installer...')
  const issPath = join(INSTALLER_DIR, 'ALFA-PDF-Reader.iss')
  if (!existsSync(issPath)) {
    throw new Error(`Inno Setup script not found: ${issPath}`)
  }

  // Atualiza versão no .iss se necessário
  let issContent = readFileSync(issPath, 'utf-8')
  issContent = issContent.replace(/#define MyAppVersion\s+".+"/, `#define MyAppVersion "${version}"`)
  issContent = issContent.replace(/#define MyAppSuite\s+".+"/, `#define MyAppSuite "${suiteVersion}"`)
  issContent = issContent.replace(
    /(OutputBaseFilename=ALFA-PDF-Reader-)\d+\.\d+(?=-Setup-x64)/,
    `$1${suiteVersion}`
  )
  writeFileSync(issPath, issContent)

  // Tenta encontrar ISCC.exe (Inno Setup Compiler)
  const isccPaths = [
    'C:\\Users\\Administrator\\AppData\\Local\\Programs\\Inno Setup 6\\ISCC.exe',
    'C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe',
    'C:\\Program Files\\Inno Setup 6\\ISCC.exe',
    'ISCC.exe', // se estiver no PATH
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