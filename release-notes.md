# ALFA PDF Reader 2.0.0 - Release

## 📦 Sobre

**ALFA PDF Reader 2.0.0** é um visualizador PDF profissional desenvolvido para Electron + React + TypeScript com foco em performance, segurança e experiência do usuário.

### ✨ Novidades em 2.0.0

- **Auto-update integrado** via `electron-updater` (atualização automática via GitHub Releases)
- **UpdateNotifier** - Banner de notificação com progresso de download
- **Botão Opções Avançadas** dentro do modal de impressão (UX mais limpa)
- **Pipeline de impressão revisado** com `pdf-lib` para filtragem de páginas
- **Universalização de tipos** - Todos os arquivos com tipagem completa
- **Design system** com cores, sombras e animações consistentes
- **Suporte a PDFs protegidos por senha** com autenticação segura

### 🚀 Recursos Principais

- **Performance**: Carregamento rápido e renderização otimizada com PDF.js
- **Segurança**: Suporte total a PDFs protegidos por senha
- **Auto Update**: Verificação automática de atualizações ao iniciar
- **Múltiplas abas**: Trabalhe com vários documentos simultaneamente
- **Zoom inteligente**: Ajuste de 50% a 300%
- **Impressão profissional**: Controle avançado de páginas, cores e cópias
- **Associação de arquivos .pdf**: Abra PDFs diretamente pelo clique

### 📁 Arquivos do Release

- `ALFA-PDF-Reader-2.0-Setup-x64.exe` - Instalador Inno Setup (~17 MB)
- `ALFA-PDF-Reader-Setup-2.0.0.exe` - Instalador NSIS alternativo
- `win-unpacked/` - Pasta com os arquivos do aplicativo (para referência)

### 🛠️ Tecnologias

- Electron 30 | React 18 | TypeScript 5.2 | Vite 5
- PDF.js para renderização
- pdf-lib para manipulação de arquivos
- MUI 7 para componentes
- electron-updater para auto-update

### 🔧 Instalação

1. Execute `ALFA-PDF-Reader-2.0-Setup-x64.exe` como administrador
2. Siga o assistente de instalação
3. O aplicativo instalará em `C:\Program Files\ALFA PDF Reader\`
4. Criará atalhos na Área de Trabalho e Menu Iniciar
5. Associará arquivos .pdf ao ALFA PDF Reader

### 📋 Requisitos

- Windows 10 ou superior (64-bit)
- ~17 MB de espaço em disco
- Conexão internet opcional (para auto-update)

### 🔐 Segurança

- O aplicativo processa PDFs localmente - nenhum dado é enviado a servidores externos
- Atualizações são verificadas apenas no repositório oficial do GitHub
- Suporte a PDFs protegidos por senha com criptografia

---

Desenvolvido por **Alex Alves Amorim** — [GitHub](https://github.com/AlexAlvesAmorim)

© 2026 Alex Alves Amorim. Todos os direitos reservados.