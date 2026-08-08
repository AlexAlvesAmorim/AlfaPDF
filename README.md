# 📄 ALFA PDF Reader 2.0

**Desktop PDF Reader profissional** — Electron + React + TypeScript

---

## 📌 Compare: 1.2 vs 2.0

| Feature | v1.2 | v2.0 |
|---------|------|------|
| **Auto Update** | ❌ Manual | ✅ Update automático via GitHub Releases |
| **Update Notifier** | ❌ | ✅ Notificação integrada com seleção de versão |
| **Botão Opções Avançadas** | Lateral na toolbar | ✅ No modal de impressão (organizado) |
| **Pipeline de Impressão** | Básico | ✅ Roto utilzando pdf-lib para filtragem de páginas |
| **UI/UX** | Responsivo | ✅ Dark theme, design system consistente |
| **CI/CD** | Básico | ✅ GitHub Actions com lint + typecheck + test |
| **Tipagem** | Parcial | ✅ TypeScript completo com tipos IPC |

---

## 🚀 Sobre

ALFA PDF Reader é um **software desktop** desenvolvido para uso profissional, com foco em:

- **Performance**: Carregamento rápido e renderização otimizada
- **Segurança**: Suporte total a PDFs protegidos por senha
- **Integração**: Fluxo de impressão nativo com controle avançado
- **Experiência**: Interface limpa, minimalista e sem perfis

---

## 🧠 Experiência de Uso

### 🖥️ Tela Inicial

- Interface minimalista com foco no CTA principal (abrir PDF)
- Identidade visual própria (logo, paleta vermelho, tipografia Space Grotesk)
- Estado limpo e responsivo ao iniciar

### 🔒 Segurança de Documentos

- Suporte completo a PDFs protegidos por senha
- Modal de autenticação dedicado antes da renderização
- Feedback claro para senha incorreta
- Senha propagada com segurança (visualização, impressão, exportação)

### 📄 Leitura e Navegação

- Renderização otimizada com PDF.js
- Scroll contínuo vertical estilo leitura natural
- Zoom dinâmico (50% - 300%)
- Suporte a múltiplas abas (trabalhe com vários documentos)
- Navegação por teclado (← → PageUp PageDown)

### 🖨️ Impressão Integrada

- Seleção de impressora com lista detectada do sistema
- Controle de cópias, cores, qualidade e intervalo de páginas
- **Novidade 2.0**: Botão "Opções avançadas" dentro do modal envia direto ao diálogo nativo do Windows
- Trabalha com impressoras físicas (EPSON L3150 testado) e "Microsoft Print to PDF"
- Pipeline próprio para contornar limitações de bibliotecas com PDFs protegidos

### 🔄 Auto Update

- Verificação automática de atualizações ao iniciar (após 3s)
- Interface de notificação no canto inferior direito
- Download em background
- Instalação automática ao fechar (ou manual via botão "Instalar agora")

---

## 🧩 Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Main (Node.js)               │
│  - Controle de janelas, impressão, gravação de arquivos │
│  - IPC para renderer (context isolation)                 │
│  - Auto-updater (electron-updater)                       │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Electron Renderer (React)              │
│  - Pagina Reader (canvas + PDF.js)                       │
│  - Toolbar (navegação, zoom, abrir PDF, imprimir)       │
│  - Modais: PasswordDialog, PrintDialog, WelcomeScreen   │
│  - Hooks: usePdfTabs, useToast, Print handlers          │
└─────────────────────────────────────────────────────────┘
```

### Tecnologias

- **Electron** 30 — Runtime desktop
- **React** 18 — Interface
- **TypeScript** 5.2 — Tipagem forte
- **Vite** 5 — Build and HMR
- **pdf-lib** — Filtragem de páginas para salvar como PDF
- **MUI** 7 — Componentes de interface
- **electron-updater** — Auto-update via GitHub Releases

---

## 🧪 Desenvolvimento

```bash
# Preparação
npm ci

# Scripts
npm run dev           # Desenvolvimento (Electron + Vite)
npm run typecheck     # Verificação TypeScript
npm run lint          # Lint ESLint
npm run test          # Testes Vitest
npm run build         # Build produção

# GitHub Actions
.yml config: npm ci → typecheck → lint → test
```

---

## 📦 Distribuição

- Build para Windows (`nsis` installer)
- App ID: `com.alex.pdfreader`
- Instalador: `AlfaPDF Setup.exe`

---

## 📊 Estatísticas

<div align="center">

<img height="180em" src="https://github-readme-stats.vercel.app/api?username=AlexAlvesAmorim&show_icons=true&theme=tokyonight&hide_border=true"/>
<img height="180em" src="https://github-readme-stats.vercel.app/api/top-langs/?username=AlexAlvesAmorim&layout=compact&theme=tokyonight&hide_border=true"/>

</div>

---

## 🔥 Contribuições

<div align="center">

<img src="https://streak-stats.demolab.com?user=AlexAlvesAmorim&theme=tokyonight&hide_border=true" />

</div>

---

## 🌐 Links

<div align="center">

<a href="https://github.com/AlexAlvesAmorim/AlexAlvesAmorim">
<img src="https://img.shields.io/badge/GitHub-AlexAlvesAmorim?style=for-the-badge&logo=github&logoColor=white"/>
</a>

</div>

---

## 📄 Changelog 2.0

### Novidades

- **Auto-updater integrado** via `electron-updater`
- **UpdateNotifier** — banner de notificação com progresso de download
- **Botão Opções Avançadas** agora dentro do modal de impressão (UX mais limpa)
- **Pipeline de impressão revisado** com `pdf-lib` para filtragem de páginas
- **Universalização de tipos** — todos os arquivos com tipagem completa
- **Design system** com cores, sombras e animações consistentes

---

## 🛠️ Desenvolvimento

> Trabalho em andamento. Sinta-se à vontade para abrir issues ou sugerir melhorias.

---

### Attribution

Desenvolvido por **Alex Alves Amorim** — [GitHub](https://github.com/AlexAlvesAmorim)
