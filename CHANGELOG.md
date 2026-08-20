# 📋 CHANGELOG — ALFA PDF Reader

Todas as mudanças notáveis do ALFA PDF Reader.

---

## [2.1.1] — 2026-08-20

### 🛠️ Hotfix — instalador entregava versão errada

- **Causa**: a release v2.1.0 foi publicada empacotando o `release/win-unpacked` desatualizado (código e runtime da 2.0.0). Quem instalou viu o app reportar `2.0.0` e continuar oferecendo a própria atualização.
- **Correção**: o script de build (`scripts/build-installer-inno.mjs`) agora **regenera o `win-unpacked` do zero a cada release** a partir do build atual — copia o runtime do Electron instalado (43.4.1), renomeia o executável, aplica o ícone (`rcedit`), monta `resources/app` com o código compilado novo, dependências de produção e o manifesto `app-update.yml` do auto-updater.
- **Nova release 2.1.1** publicada com o instalador correto; a v2.1.0 quebrada foi removida do GitHub para evitar nova instalação do pacote errado.

---

## [2.1.0] — 2026-08-20

### ✅ Correções

- **Abertura de PDF por duplo clique no sistema** — o arquivo agora sempre abre junto com o programa. Corrigido o parsing dos argumentos de inicialização (caminhos com aspas, relativos e URLs `file://`) e o envio do PDF agora aguarda o renderer terminar de carregar antes de entregar o documento.
- **Persistência das configurações de impressão** — cor/P&B, cópias, intervalo de páginas, qualidade e impressora são memorizados em `userData/settings.json` e reutilizados no próximo print, até o usuário alterar.

### 🔒 Segurança e confiabilidade

- **Impressão 100% offline** — removido o CDN externo do pdf.js; a biblioteca agora é carregada localmente.
- **Janela de impressão endurecida** — `webSecurity` ativado; a janela temporária usa apenas arquivos locais gerados pelo próprio app.
- **Fim da injeção de conteúdo no HTML de impressão** — bytes, senha, páginas e escala são entregues via IPC seguro (`print-window-ready`/`print-window-payload`). Senhas com aspas não quebram mais o pipeline.
- **`parsePageRanges` deduplicado** em módulo compartilhado (`src/shared/utils/pageRanges.ts`).

### ✨ Novidades

- **Arquivos recentes** — lista dos últimos 10 documentos na tela inicial (com botão "Limpar") + integração com a Jump List do Windows.
- **Electron 43.4.1** — runtime atualizado (era Electron 30), Node 24.
- **Abertura via diálogo nativo** — "Abrir documento" agora usa o diálogo do Windows e registra o arquivo nos recentes.

### ⚠️ Observações

- **Save-as-PDF em arquivos protegidos por senha** continua bloqueado: o pdf-lib v1.17 não suporta decriptação com senha. Para esses casos, usar "Imprimir" → "Microsoft Print to PDF".

---

## [2.0.0] — 2026-08-10

- Auto-update integrado via `electron-updater` (GitHub Releases)
- UpdateNotifier — banner de notificação com progresso de download
- Botão "Opções Avançadas" dentro do modal de impressão
- Pipeline de impressão revisado com `pdf-lib` para filtragem de páginas
- Tipagem completa em todos os arquivos
- Design system (cores, sombras e animações consistentes)
- Suporte a PDFs protegidos por senha

---

Desenvolvido por **Alex Alves Amorim** — [GitHub](https://github.com/AlexAlvesAmorim)