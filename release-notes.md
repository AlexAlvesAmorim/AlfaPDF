# ALFA PDF Reader 2.1.0 - Release

## 📦 Sobre

**ALFA PDF Reader 2.1.0** é um visualizador PDF profissional desenvolvido para Electron + React + TypeScript com foco em performance, segurança e experiência do usuário.

### ✨ Novidades em 2.1.0

- **Correção: abertura de PDF por duplo clique no sistema** — o arquivo agora sempre abre junto com o programa (tratamento de caminhos com aspas, relativos e `file://`, e aguardo do renderer carregar antes de enviar o documento)
- **Persistência das configurações de impressão** — cor/P&B, cópias, páginas, qualidade e impressora são memorizados e reutilizados no próximo print, até o usuário alterar
- **Impressão 100% offline** — pdf.js agora é carregado localmente (removido o CDN externo) e a janela de impressão foi endurecida (segurança reforçada)
- **Senhas sem injeção de HTML** — o payload do PDF (bytes, senha, páginas, escala) é entregue por IPC seguro, sem interpolar conteúdo no HTML
- **Arquivos recentes** — lista dos últimos 10 documentos na tela inicial + integração com a Jump List do Windows
- **Electron 43.4.1** — runtime atualizado (anteriormente Electron 30) com Node 24

### 🚀 Recursos Principais

- **Performance**: Carregamento rápido e renderização otimizada com PDF.js
- **Segurança**: Suporte total a PDFs protegidos por senha
- **Auto Update**: Verificação automática de atualizações ao iniciar
- **Múltiplas abas**: Trabalhe com vários documentos simultaneamente
- **Zoom inteligente**: Ajuste de 50% a 300%
- **Impressão profissional**: Controle avançado de páginas, cores, cópias e qualidade
- **Associação de arquivos .pdf**: Abra PDFs diretamente pelo clique

### 📁 Arquivos do Release

- `ALFA-PDF-Reader-2.1-Setup-x64.exe` - Instalador Inno Setup (~17 MB)
- `latest.yml` - Manifesto de atualização automática (electron-updater)

### 🛠️ Tecnologias

- Electron 43.4.1 | React 18 | TypeScript 5.2 | Vite 5
- PDF.js para renderização
- pdf-lib para manipulação de arquivos
- MUI 7 para componentes
- electron-updater para auto-update

### 🔧 Instalação

1. Execute `ALFA-PDF-Reader-2.1-Setup-x64.exe` como administrador
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