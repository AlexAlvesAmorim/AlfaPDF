# 🚀 MELHORIAS — ALFA PDF Reader

> Plano de evolução do projeto (atualizado em 20/08/2026)

---

## ✅ Corrigido em 20/08/2026

### 1. Abertura de PDF via clique no sistema
**Problema:** às vezes clicar num PDF só abria o programa sem carregar o arquivo.

**Causas:**
- `getPdfPathFromArgs` falhava quando o caminho vinha com aspas, era relativo, ou vinha como URL `file://`
- Se o app ainda estava carregando o renderer quando o PDF era enviado, a mensagem IPC se perdia (`webContents.send` antes do `did-finish-load`)

**Correção (`src/main/index.ts`):**
- Parsing robusto de argumentos: remove aspas, resolve caminhos relativos, decodifica `file://`
- `sendPdfToRenderer` aguarda `did-finish-load` antes de enviar o PDF ao renderer

### 2. Persistência das configurações de impressão
**Problema:** a cada PDF era preciso reconfigurar cor/P&B, cópias, qualidade e impressora.

**Correção:**
- Novo módulo `src/main/settings.ts` — armazena preferências em `userData/settings.json`
- Novos IPC: `get-print-settings` / `save-print-settings` (expostos no preload)
- `PrintDialog` carrega as configurações salvas ao abrir e salva ao imprimir, salvar PDF ou abrir "Opções avançadas"
- A configuração escolhida **persiste até o usuário mudar**

### 3. Hardening do pipeline de impressão (itens 1.1–1.6 da Fase 1)
- **1.1 — CDN removido:** pdf.js agora é carregado **localmente** (`pdfjs-dist` copiado para o diretório temporário ao lado do HTML). Imprimir não depende mais de internet
- **1.2 — Janela de impressão endurecida:** `webSecurity` voltou a `true`; janela usa apenas arquivos locais gerados pelo próprio app
- **1.3 — Fim da injeção de senha/base64 no HTML:** payload (bytes, senha, páginas, escala) é entregue via IPC (`print-window-ready`/`print-window-payload`). Senhas com aspas não quebram mais o HTML
- **1.4 — `parsePageRanges` deduplicado** em módulo compartilhado (`src/shared/utils/pageRanges.ts`), usado pelo main e pelo save-as-pdf
- **1.5 — Save-as-PDF em PDFs protegidos:** ⚠️ *bloqueado* — pdf-lib v1.17 não suporta decriptação com senha. Mantido o bloqueio com mensagem mais clara orientando a usar "Microsoft Print to PDF"
- **1.6 — Electron 30 → 43.4.1** (Node 24). Ajuste de compatibilidade: `PrinterInfo.isDefault` foi removido na API nova

### 4. Arquivos recentes (item 2.4 da Fase 2)
- Abertura via diálogo nativo agora registra o caminho do arquivo
- Lista de recentes persistida em `settings.json` + Jump List do Windows (`app.addRecentDocument`)
- Tela inicial exibe os 10 últimos arquivos com botão "Limpar"

### 5. Hotfix 2.1.1 — instalador publicava versão errada
**Problema:** a release v2.1.0 empacotou o `release/win-unpacked` **desatualizado** (código e runtime da 2.0.0). Quem instalou viu o app reportar `2.0.0` e continuar sugerindo a própria atualização.

**Correção (`scripts/build-installer-inno.mjs`):**
- O script agora **regenera o `win-unpacked` do zero a cada release**: copia o runtime do Electron instalado, renomeia o exe, aplica o ícone via `rcedit` (nova devDependency), monta `resources/app` (package.json com a versão atual, `out/` recém-compilado e apenas os arquivos de runtime do pdf.js) e recria o `app-update.yml`
- Node_modules podado: só `pdfjs-dist/build/pdf.mjs` + `pdf.worker.mjs` (o main é 100% bundled pelo electron-vite) — instalador caiu de ~227 MB para ~100 MB
- Release v2.1.0 quebrada removida do GitHub; **v2.1.1** publicada com o instalador correto

---

## 🔴 Fase 1 — Hardening

| # | Tarefa | Status |
|---|--------|--------|
| 1.1 | Remover CDN do pipeline de impressão | ✅ Feito |
| 1.2 | Endurecer janela de impressão | ✅ Feito |
| 1.3 | Corrigir injeção de senha no HTML de impressão | ✅ Feito |
| 1.4 | Deduplicar `parsePageRanges` | ✅ Feito |
| 1.5 | Permitir save-as-PDF em arquivos protegidos | ⚠️ Inviável com pdf-lib |
| 1.6 | Upgrade Electron 30 → 43.4.1 | ✅ Feito |

## 🟡 Fase 2 — Produtividade

| # | Tarefa | Status |
|---|--------|--------|
| 2.1 | Busca no documento (text layer do pdf.js + highlight + navegação) | ⬜ Pendente |
| 2.2 | Sidebar com miniaturas + sumário (outline) | ⬜ Pendente |
| 2.3 | Persistência de sessão (abas, zoom, página) | ⬜ Pendente |
| 2.4 | Arquivos recentes + jump list | ✅ Feito |
| 2.5 | Tema claro/escuro | ✅ Já persistia via localStorage |

## 🟢 Fase 3 — Confiabilidade & Distribuição

| # | Tarefa | Status |
|---|--------|--------|
| 3.1 | Release automática no CI (build + publish no GitHub Releases) | ⬜ Pendente |
| 3.2 | Assinatura de código | ⬜ Pendente |
| 3.3 | Testes do processo main (extrair lógica de impressão/pdf) | ⬜ Pendente |
| 3.4 | E2E com Playwright/Electron | ⬜ Pendente |
| 3.5 | Crash reporting (Sentry) opt-in + cobertura de testes | ⬜ Pendente |

## 🔵 Fase 4 — Features Premium

| # | Tarefa | Status |
|---|--------|--------|
| 4.1 | Anotações (highlight, notas, desenho) com pdf-lib | ⬜ Pendente |
| 4.2 | Preenchimento de formulários (AcroForms) | ⬜ Pendente |
| 4.3 | Ferramentas de edição (dividir, mesclar, rotacionar) | ⬜ Pendente |
| 4.4 | Comparação de documentos | ⬜ Pendente |
| 4.5 | Suporte macOS/Linux | ⬜ Pendente |

---

## 📌 Arquivos alterados em 20/08/2026

- `src/main/index.ts` — parsing de args, espera do renderer, pipeline de impressão local, IPC de settings e recentes
- `src/main/settings.ts` — **novo** armazenamento de preferências + recentes
- `src/shared/utils/pageRanges.ts` — **novo** utilitário compartilhado de ranges
- `src/preload/index.ts` — `getPrintSettings`/`savePrintSettings`/`getRecentDocuments`/`clearRecentDocuments`
- `src/shared/types/types.ts` — novo tipo `PrintSettings`
- `src/shared/types/electron.d.ts` — tipagem da API exposta (ajustado para Electron 43)
- `src/shared/components/PrintDialog.tsx` — carregar/salvar preferências
- `src/shared/components/WelcomeScreen.tsx` — lista de arquivos recentes
- `src/renderer/src/styles/components.css` — estilo do bloco de recentes
- `src/renderer/src/pages/ReaderPage.tsx` — abertura via diálogo nativo + reabrir recentes

---

Desenvolvido por **Alex Alves Amorim** — [GitHub](https://github.com/AlexAlvesAmorim)