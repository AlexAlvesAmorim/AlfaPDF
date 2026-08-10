import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib'
import * as fs from 'fs'
import * as path from 'path'

const RED = rgb(0.894, 0, 0.168)
const RED_DARK = rgb(0.698, 0, 0.133)
const BLACK = rgb(0.1, 0.1, 0.1)
const GRAY = rgb(0.4, 0.4, 0.4)
const LIGHT_GRAY = rgb(0.92, 0.92, 0.92)
const WHITE = rgb(1, 1, 1)

type Doc = {
  doc: PDFDocument
  font: PDFFont
  bold: PDFFont
  page: PDFPage
  y: number
  margin: number
  pageWidth: number
  pageHeight: number
  lineHeight: number
}

async function newDoc(title: string, subtitle: string): Promise<Doc> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  doc.setTitle(title)
  doc.setAuthor('Alex Alves Amorim')
  doc.setSubject(subtitle)
  doc.setCreator('ALFA PDF Reader Build Script')
  doc.setProducer('pdf-lib')
  doc.setCreationDate(new Date())

  const page = doc.addPage([595.28, 841.89]) // A4
  const { width, height } = page.getSize()

  // Header bar
  page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: RED })
  page.drawText('ALFA PDF Reader', {
    x: 40,
    y: height - 38,
    size: 22,
    font: bold,
    color: WHITE,
  })
  page.drawText(subtitle, {
    x: 40,
    y: height - 58,
    size: 10,
    font,
    color: WHITE,
  })

  return {
    doc,
    font,
    bold,
    page,
    y: height - 120,
    margin: 40,
    pageWidth: width,
    pageHeight: height,
    lineHeight: 18,
  }
}

function newPage(d: Doc): void {
  d.page = d.doc.addPage([d.pageWidth, d.pageHeight])
  d.y = d.pageHeight - 50
  // Footer bar
  d.page.drawRectangle({ x: 0, y: 0, width: d.pageWidth, height: 25, color: RED_DARK })
}

function checkSpace(d: Doc, needed: number): void {
  if (d.y - needed < 40) {
    newPage(d)
  }
}

function writeTitle(d: Doc, text: string, size = 16): void {
  checkSpace(d, size + 14)
  d.y -= size + 6
  d.page.drawText(text, { x: d.margin, y: d.y, size, font: d.bold, color: RED })
  d.y -= 4
  // underline
  d.page.drawLine({
    start: { x: d.margin, y: d.y },
    end: { x: d.pageWidth - d.margin, y: d.y },
    thickness: 1,
    color: RED,
  })
  d.y -= 10
}

function writeHeading(d: Doc, text: string): void {
  checkSpace(d, 24)
  d.y -= 14
  d.page.drawText(text, { x: d.margin, y: d.y, size: 12, font: d.bold, color: BLACK })
  d.y -= 4
}

function writeParagraph(d: Doc, text: string, size = 10): void {
  const maxWidth = d.pageWidth - d.margin * 2
  const words = text.split(' ')
  let line = ''
  const lines: string[] = []

  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (d.font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)

  for (const l of lines) {
    checkSpace(d, d.lineHeight)
    d.y -= d.lineHeight
    d.page.drawText(l, { x: d.margin, y: d.y, size, font: d.font, color: BLACK })
  }
}

function writeBullet(d: Doc, text: string, size = 10): void {
  const indent = 18
  const maxWidth = d.pageWidth - d.margin * 2 - indent
  const words = text.split(' ')
  let line = ''
  const lines: string[] = []

  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (d.font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)

  checkSpace(d, d.lineHeight)
  d.y -= d.lineHeight
  d.page.drawText('•', { x: d.margin, y: d.y, size, font: d.bold, color: RED })
  if (lines.length) {
    d.page.drawText(lines[0], { x: d.margin + indent, y: d.y, size, font: d.font, color: BLACK })
    for (let i = 1; i < lines.length; i++) {
      checkSpace(d, d.lineHeight)
      d.y -= d.lineHeight
      d.page.drawText(lines[i], { x: d.margin + indent, y: d.y, size, font: d.font, color: BLACK })
    }
  }
}

function writeCode(d: Doc, text: string): void {
  const size = 9
  const padding = 8
  const lines = text.split('\n')
  const lineHeight = 13
  const blockHeight = lines.length * lineHeight + padding * 2

  checkSpace(d, blockHeight + 6)
  d.y -= 4
  const startY = d.y - blockHeight
  d.page.drawRectangle({
    x: d.margin,
    y: startY,
    width: d.pageWidth - d.margin * 2,
    height: blockHeight,
    color: LIGHT_GRAY,
  })
  let textY = d.y - padding
  for (const l of lines) {
    d.page.drawText(l, { x: d.margin + 8, y: textY, size, font: d.font, color: BLACK })
    textY -= lineHeight
  }
  d.y = startY - 4
}

function writeSpacer(d: Doc, amount = 10): void {
  d.y -= amount
}

async function buildChangelog(): Promise<void> {
  const d = await newDoc('ALFA PDF Reader - Changelog 2.0', 'Registro de mudancas e correcoes')

  writeTitle(d, 'Visao Geral', 18)
  writeParagraph(
    d,
    'Este documento descreve todas as mudancas, correcoes e novas funcionalidades implementadas na versao 2.0 do ALFA PDF Reader, incluindo a correcao critica do pipeline de build e a implementacao do sistema de auto-update online.'
  )
  writeSpacer(d)

  writeTitle(d, '1. Correcao do Pipeline de Build (dist)', 14)
  writeParagraph(
    d,
    'O principal problema corrigido nesta atualizacao foi a divergencia entre a versao de desenvolvimento (npm run dev) e a versao empacotada (npm run dist). Quando o usuario executava npm run dist, apenas o electron-builder era invocado, sem gerar uma nova build do projeto. Isso empacotava o conteudo antigo da pasta out/, fazendo com que a versao instalada nao tivesse as novas funcionalidades.'
  )
  writeParagraph(d, 'Solucao aplicada no package.json:')
  writeCode(d, '"dist": "electron-vite build && electron-builder"')
  writeParagraph(
    d,
    'Agora o script dist sempre executa o build completo do electron-vite antes de empacotar com electron-builder, garantindo que a versao instalada seja identica a versao de desenvolvimento.',
    10
  )
  writeSpacer(d)

  writeTitle(d, '2. Sistema de Auto-Update Online', 14)
  writeParagraph(
    d,
    'Implementado um sistema completo de atualizacao automatica via GitHub Releases. Ao publicar uma nova versao no GitHub, todos os usuarios do ALFA PDF Reader recebem a atualizacao automaticamente, sem precisar reinstalar manualmente.',
    10
  )
  writeSpacer(d, 6)

  writeHeading(d, '2.1 Dependencias e Configuracao')
  writeBullet(d, 'Instalado o pacote electron-updater como dependencia de producao.')
  writeBullet(d, 'Configurado provider github no campo build.publish do package.json.')
  writeBullet(d, 'Definido owner: AlexAlvesAmorim, repo: AlfaPDF, releaseType: release.')
  writeBullet(d, 'Ativado generateUpdatesFilesForAllChannels para gerar latest.yml automaticamente.')
  writeBullet(d, 'Ativado differentialPackage no NSIS para download incremental menor.')
  writeSpacer(d, 4)

  writeHeading(d, '2.2 Processo Principal (src/main/index.ts)')
  writeBullet(d, 'Importado autoUpdater e UpdateInfo do electron-updater.')
  writeBullet(d, 'Configurado autoUpdater.autoDownload = true (baixa automaticamente ao detectar).')
  writeBullet(d, 'Configurado autoUpdater.autoInstallOnAppQuit = true (instala ao fechar o app).')
  writeBullet(d, 'Implementada verificacao automatica 3 segundos apos abrir o app.')
  writeBullet(d, 'Criados 6 listeners de eventos: checking, available, not-available, progress, downloaded, error.')
  writeBullet(d, 'Implementados 4 ipcMain.handle: check-for-updates, quit-and-install, get-update-status, get-app-version.')
  writeBullet(d, 'Funcao notifyRenderer repassa eventos ao renderer via webContents.send().')
  writeSpacer(d, 4)

  writeHeading(d, '2.3 Preload (src/preload/index.ts)')
  writeBullet(d, 'Expostos 3 metodos invoke: checkForUpdates, quitAndInstall, getUpdateStatus.')
  writeBullet(d, 'Expostos 6 listeners de eventos de update via contextBridge.')
  writeBullet(d, 'Cada listener faz removeAllListeners antes de registrar (evita duplicacao).')
  writeSpacer(d, 4)

  writeHeading(d, '2.4 Tipos TypeScript (src/shared/types/electron.d.ts)')
  writeBullet(d, 'Adicionadas assinaturas de tipos para todos os metodos e listeners de update.')
  writeBullet(d, 'Compativel com o Optional Chaining usado no renderer (window.electronAPI?.).')
  writeSpacer(d, 4)

  writeHeading(d, '2.5 Interface de Usuario (UpdateNotifier)')
  writeBullet(d, 'Criado componente UpdateNotifier.tsx em src/shared/components/.')
  writeBullet(d, 'Notificacao fixada no canto inferior direito com z-index 99998.')
  writeBullet(d, 'Estados: checking, available, downloading, downloaded, error, idle.')
  writeBullet(d, 'Barra de progresso animada mostrando percentual do download.')
  writeBullet(d, 'Botao "Instalar agora" para instalar e reiniciar imediatamente.')
  writeBullet(d, 'Botao de fechar (dismiss) para dispensar a notificacao.')
  writeBullet(d, 'Estilos em components.css seguindo o design system vermelho ALFA.')

  const bytes = await d.doc.save()
  const outPath = path.resolve(__dirname, 'CHANGELOG-2.0.pdf')
  fs.writeFileSync(outPath, bytes)
  console.log('[ok] Gerado:', outPath)
}

async function buildRoadmap(): Promise<void> {
  const d = await newDoc('ALFA PDF Reader - Roadmap Profissional', 'Guia de melhorias e atualizacoes futuras')

  writeTitle(d, 'Introducao', 18)
  writeParagraph(
    d,
    'Este documento e um guia de melhorias profissionais para futuras atualizacoes do ALFA PDF Reader. Esta dividido em 4 niveis de prioridade (P0 a P3), ordenados por impacto e esforco. Use como roteiro de desenvolvimento para evoluir o app de um leitor de PDF basico para uma solucao profissional de nivel comercial.'
  )
  writeSpacer(d)

  writeTitle(d, 'P0 - Critico (Essencial para profissionalismo)', 14)

  writeHeading(d, '[P0-1] Code Signing do Instalador')
  writeParagraph(
    d,
    'Atualmente o instalador nao e assinado digitalmente, causando avisos do Windows SmartScreen ("Editor desconhecido"). Para um app profissional, isso destrui a confianca do usuario. Solucao: adquirir um certificado de codigo (OV ou EV) e configurar electron-builder.'
  )
  writeCode(d, '// package.json build\n"win": {\n  "certificateFile": "build/cert.pfx",\n  "certificatePassword": process.env.CERT_PASSWORD\n}')
  writeBullet(d, 'Custo aproximado: USD 100-300/ano (OV), USD 300-700/ano (EV).')
  writeBullet(d, 'EV removing o aviso do SmartScreen mais rapidamente.')
  writeBullet(d, 'Alternativa gratuita: SignPath Foundation oferece code signing gratuito para projetos open-source.')

  writeSpacer(d, 6)
  writeHeading(d, '[P0-2] Ativacao do ASAR')
  writeParagraph(
    d,
    'O build atual usa asar: false, expondo todo o codigo fonte em texto plano na pasta do app. Isso e inefficiente, inseguro e gera warnings do electron-builder. Ativar ASAR empacota o app em um arquivo unico, melhora performance de leitura e protege o codigo.'
  )
  writeCode(d, '"asar": true,\n"asarUnpack": [\n  "node_modules/pdfjs-dist/**",\n  "node_modules/react-pdf/**"\n]')
  writeBullet(d, 'asarUnpack necessario para modulos com workers/binarios externos.')
  writeBullet(d, 'Reduz tempo de inicializacao e protege propriedade intelectual.')

  writeSpacer(d, 6)
  writeHeading(d, '[P0-3] Tratamento Robusto de Erros')
  writeParagraph(
    d, 'O app precisa de tratamento de erros centralizado em tres frentes:'
  )
  writeBullet(d, 'Main: try/catch em todos os ipcMain.handle com log estruturado em arquivo.')
  writeBullet(d, 'Renderer: ErrorBoundary React para capturar erros de UI sem crashar o app.')
  writeBullet(d, 'Renderer: toast de erro amigavel em portugues para operacoes que falham.')
  writeBullet(d, 'Rotacao de logs (eleitos: logs em %APPDATA%/ALFA-PDF-Reader/logs/).')

  newPage(d)
  writeTitle(d, 'P1 - Alta Prioridade (Diferencial competitivo)', 14)

  writeHeading(d, '[P1-1] Historico de Arquivos Recentes')
  writeParagraph(
    d,
    'Memorizar os ultimos 10 PDFs abertos, persistir em arquivo JSON em app.getPath("userData") e mostrar na WelcomeScreen. Click rapido para reabrir.'
  )
  writeBullet(d, 'Adicionar hook useRecentFiles com electron-store ou fs manual.')
  writeBullet(d, 'Persistir: path, name, lastOpened (timestamp), thumbnail (opcional).')
  writeBullet(d, 'Limitar a 10 itens, remover se arquivo nao existir mais.')

  writeSpacer(d, 6)
  writeHeading(d, '[P1-2] Paginacao e Navegacao Avancada')
  writeBullet(d, 'Mini-mapa (thumbnails lateral) das paginas com scroll synchronized.')
  writeBullet(d, 'Indice/Navegacao por bookmarks (TOC) — pdfjs suporta getOutline().')
  writeBullet(d, 'Busca de texto em todas as paginas (pdfjs.getTextContent()).')
  writeBullet(d, 'Highlights persistentes (marcacoes em posicoes do texto).')
  writeBullet(d, 'Modo de leitura continua (scroll, nao paginado).')

  writeSpacer(d, 6)
  writeHeading(d, '[P1-3] Anotacoes e Marcacoes')
  writeBullet(d, 'Sublinhado e marca-texto em trechos de texto.')
  writeBullet(d, 'Notas adesivas (sticky notes) em posicoes do PDF.')
  writeBullet(d, 'Desenho livre (caneta) — util para assinaturas digitais.')
  writeBullet(d, 'Exportar PDF com anotacoes usando pdf-lib.')

  writeSpacer(d, 6)
  writeHeading(d, '[P1-4] Suporte a Multiplas Linguas (i18n)')
  writeBullet(d, 'Adicionar i18next + react-i18next.')
  writeBullet(d, 'Extrair todos os textos hard-coded em português para template JSON.')
  writeBullet(d, 'Suporte inicial: pt-BR (nativo) e en-US (internacionalizacao).')
  writeBullet(d, 'Detector automatico de idioma do sistema (app.getLocale()).')

  newPage(d)
  writeTitle(d, 'P2 - Media Prioridade (Refinamento profissional)', 14)

  writeHeading(d, '[P2-1] Temas Personalizados')
  writeBullet(d, 'Alm do dark/light atual, suporte a 3-4 temas preset (Crimson, Midnight, Sepia).')
  writeBullet(d, 'Temas ja tem infraestrutura (ThemeContext) — basta adicionar presets.')
  writeBullet(d, 'Configuracao persistida em userData.')

  writeSpacer(d, 6)
  writeHeading(d, '[P2-2] Atalhos de Teclado Padronizados')
  writeBullet(d, 'Implementar suporte completo a aceleradores globais.')
  writeBullet(d, 'Ctrl+O abrir, Ctrl+W fechar tab, Ctrl+P imprimir, Ctrl+S salvar.')
  writeBullet(d, 'Ctrl+Tab/Ctrl+Shift+Tab navegar entre tabs.')
  writeBullet(d, 'F11 tela cheia, Ctrl+= zoom in, Ctrl+- zoom out, Ctrl+0 reset.')
  writeBullet(d, 'Pagina anterior/proximo: PageUp/PageDown (ja existe parcial).')

  writeSpacer(d, 6)
  writeHeading(d, '[P2-3] Performance e Otimizacao de Memoria')
  writeBullet(d, 'Virtualizacao de paginas: renderizar so visiveis (react-virtual).')
  writeBullet(d, 'Cache de thumbnails em disco (nao reload toda vez).')
  writeBullet(d, 'Limitar PDFs simultaneos abertos (atualmente sem limite).')
  writeBullet(d, 'Lazy load do react-pdf e pdfjs só quando necessario.')
  writeBullet(d, 'Memoizacao agressiva de componentes com React.memo + useMemo.')

  writeSpacer(d, 6)
  writeHeading(d, '[P2-4] Drag-and-Drop')
  writeBullet(d, 'Arrastar PDFs do Explorer diretamente para dentro do app.')
  writeBullet(d, 'onDrop no container principal + pedir arquivo via IPC.')
  writeBullet(d, 'Feedback visual durante o hover (borda destacada).')

  newPage(d)
  writeTitle(d, 'P3 - Baixa Prioridade (Features de nicho)', 14)

  writeHeading(d, '[P3-1] Integracao com Cloud')
  writeBullet(d, 'Abrir PDFs diretamente de Google Drive, OneDrive, Dropbox.')
  writeBullet(d, 'OAuth flow com firebase/auth ou manual.')
  writeBullet(d, 'Suporte a URLs http(s):// para abrir PDFs remotos.')

  writeSpacer(d, 6)
  writeHeading(d, '[P3-2] Conversao de PDF')
  writeBullet(d, 'PDF para imagem (PNG/JPG) usando pdfjs + canvas.')
  writeBullet(d, 'PDF para texto puro (.txt).')
  writeBullet(d, 'Mesclar multiplos PDFs (pdf-lib ja esta no projeto).')
  writeBullet(d, 'Dividir PDF em paginas separadas.')
  writeBullet(d, 'Comprimir/reduzir tamanho do PDF.')

  writeSpacer(d, 6)
  writeHeading(d, '[P3-3] Telemetria Anonima (Opcional)')
  writeBullet(d, 'Coletar metricas de uso: paginas abertas, tempo de leitura, crashes.')
  writeBullet(d, 'USAR opt-in explicito do usuario (checkbox em settings).')
  writeBullet(d, 'Backend gratis: PostHogCloud ou Mixpanel free tier.')
  writeBullet(d, 'Nunca coletar conteudo do PDF, apenas metadata de uso.')

  writeSpacer(d, 6)
  writeHeading(d, '[P3-4] CI/CD Automation')
  writeBullet(d, 'GitHub Actions para build automatico em push/tag.')
  writeBullet(d, 'Build paralelo em Windows, macOS e Linux.')
  writeBullet(d, 'Auto-publicar release no GitHub quando tag v* e PUSHADA.')
  writeBullet(d, 'Executar typecheck + lint + testes em cada PR antes de merge.')

  newPage(d)
  writeTitle(d, 'Roadmap Sugerido (por versao)', 14)

  writeHeading(d, 'v2.1.0 - Estabilidade e Profissionalismo')
  writeParagraph(d, 'Foco: corrigir as pendencias tecnicas que impedem o app de ser considerado "serio". Recomendado antes de qualquer feature nova.')
  writeBullet(d, '[P0-1] Code Signing do instalador.')
  writeBullet(d, '[P0-2] Ativacao do ASAR.')
  writeBullet(d, '[P0-3] Tratamento robusto de erros + ErrorBoundary.')
  writeBullet(d, '[P1-4] Internacionalizacao (pt-BR + en-US).')
  writeBullet(d, '[P2-1] Temas personalizados (mais 2-3 presets).')

  writeSpacer(d, 8)
  writeHeading(d, 'v2.2.0 - Experiencia de Leitura')
  writeParagraph(d, 'Foco: transformar o app em um leitor de classe premium.')
  writeBullet(d, '[P1-1] Arquivos recentes.')
  writeBullet(d, '[P1-2] Indice ( bookmarks TOC).')
  writeBullet(d, '[P1-2] Busca de texto em todas as paginas.')
  writeBullet(d, '[P1-2] Mini-mapa lateral de thumbnails.')
  writeBullet(d, '[P2-3] Virtualizacao de paginas (performance).')
  writeBullet(d, '[P2-4] Drag-and-drop de arquivos.')

  writeSpacer(d, 8)
  writeHeading(d, 'v2.3.0 - Anotacoes')
  writeParagraph(d, 'Foco: ferramentas de marcacao, transformando em solucao de productividade.')
  writeBullet(d, '[P1-3] Marca-texto e sublinhado.')
  writeBullet(d, '[P1-3] Notas adesivas.')
  writeBullet(d, '[P1-3] Desenho livre (caneta).')
  writeBullet(d, '[P1-3] Exportar PDF com anotacoes.')
  writeBullet(d, '[P2-2] Atalhos de teclado completos.')

  writeSpacer(d, 8)
  writeHeading(d, 'v2.4.0 - Multiplataforma e Conversao')
  writeParagraph(d, 'Foco: alcancar mais usuarios e criar utilidades.')
  writeBullet(d, '[P3-4] CI/CD via GitHub Actions.')
  writeBullet(d, '[P3-2] Conversao PDF <-> imagem / texto.')
  writeBullet(d, '[P3-2] Mesclar/dividir PDFs.')
  writeBullet(d, '[P3-1] Abrir PDFs de URLs remotas.')

  writeSpacer(d, 8)
  writeHeading(d, 'v3.0.0 - Cloud e Premium')
  writeParagraph(d, 'Foco: expansao para servico, fans e telemetria.')
  writeBullet(d, '[P3-1] Integracao com Google Drive, OneDrive, Dropbox.')
  writeBullet(d, '[P3-3] Telemetria opt-in.')
  writeBullet(d, 'Sincronizacao de historico/anotacoes entre dispositivos.')
  writeBullet(d, 'Versao macOS nativa com notarizacao.')

  newPage(d)
  writeTitle(d, 'Checklist de Qualidade Antes de Cada Release', 14)
  writeParagraph(d, 'Antes de publicar qualquer versao, validar todos os pontos abaixo:')
  writeSpacer(d, 6)

  writeHeading(d, 'Build')
  writeBullet(d, 'npm run typecheck passou sem erros.')
  writeBullet(d, 'npm run lint passou sem warnings.')
  writeBullet(d, 'npm test passou todos os testes.')
  writeBullet(d, 'npm run build gerou pastas out/main, out/preload e out/renderer.')
  writeBullet(d, 'npm run dist gerou instalador em release/ sem erros.')
  writeBullet(d, 'latest.yml presente em release/.')

  writeSpacer(d, 6)
  writeHeading(d, 'Funcional')
  writeBullet(d, 'Teste manual: abrir PDF, navegar paginas, zoom in/out.')
  writeBullet(d, 'Teste manual: imprimir (silencioso e nativo).')
  writeBullet(d, 'Teste manual: salvar como PDF.')
  writeBullet(d, 'Teste manual: abrir PDF via duplo-clique no Explorer.')
  writeBullet(d, 'Teste manual: abrir PDF via WhatsApp / arquivo recebido.')
  writeBullet(d, 'Teste de auto-update: instalar v anterior e validar upgrade.')

  writeSpacer(d, 6)
  writeHeading(d, 'Versionamento')
  writeBullet(d, 'Atualizar "version" no package.json.')
  writeBullet(d, 'Atualizar "uninstallDisplayName" no nsis se mudou major.')
  writeBullet(d, 'Criar tag v*.*.* no git.')
  writeBullet(d, 'Criar GitHub Release correspondente e fazer upload de:')
  writeBullet(d, '  - ALFA PDF Reader Setup X.X.X.exe')
  writeBullet(d, '  - latest.yml')
  writeBullet(d, '  - latest.yml.sha256 (opcional).')

  writeSpacer(d, 8)
  d.y -= 10
  d.page.drawText('— Fim do Roadmap —', {
    x: d.pageWidth / 2 - 60,
    y: 40,
    size: 9,
    font: d.bold,
    color: RED,
  })

  const bytes = await d.doc.save()
  const outPath = path.resolve(__dirname, 'ROADMAP-PROFISSIONAL.pdf')
  fs.writeFileSync(outPath, bytes)
  console.log('[ok] Gerado:', outPath)
}

(async () => {
  try {
    await buildChangelog()
    await buildRoadmap()
    console.log('[done] Ambos os PDFs foram gerados.')
  } catch (err) {
    console.error('[error]', err)
    process.exit(1)
  }
})()
