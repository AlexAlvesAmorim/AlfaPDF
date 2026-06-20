# 👨‍💻 Alex Alves Amorim

<div align="center">

Front-End Developer • React • TypeScript • Electron

</div>

---

## 🚀 Sobre mim

Desenvolvedor Front-End focado em aplicações desktop modernas com Electron, React e TypeScript.

Atuação prática com construção de interfaces profissionais, arquitetura de componentes, performance e UX aplicada a produtos reais.

Atualmente desenvolvendo softwares próprios com foco em experiência de produto, design system consistente e funcionalidades de nível comercial.

---

## 🛠️ Tecnologias

<div align="center">

<img src="https://skillicons.dev/icons?i=react,ts,js,electron,vite,tailwind,nodejs,git,github,vscode" />

</div>

---

## ⭐ Projeto Destaque

# 📄 ALFA PDF Reader

Desktop PDF Reader profissional desenvolvido com Electron + React + TypeScript.

Um aplicativo focado em experiência de leitura, abertura rápida de arquivos e fluxo de impressão integrado ao sistema operacional — já distribuído como instalador (`.exe`) e em uso real no dia a dia.

---

## 🧠 Experiência de Uso

O ALFA PDF Reader foi pensado como um software de uso real, com fluxo próximo de aplicações comerciais:

### 🖥️ Tela inicial

- Aplicação inicia em estado limpo e responsivo
- Interface minimalista com foco no CTA principal
- Botão de abertura de PDF destacado
- Identidade visual própria (logo, paleta e tipografia consistentes) reforçando a marca **Dev de Favela**

### 📂 Integração com sistema

- Detectado como aplicação padrão para arquivos PDF
- Suporte a abertura direta via Explorer do Windows
- Distribuído como instalador nativo do Windows (`AlfaPDF Setup`)

### 🔒 Segurança de documentos

- Suporte completo a PDFs protegidos por senha
- Modal de autenticação dedicado antes da renderização, com feedback de senha incorreta
- Senha validada via PDF.js e propagada de forma segura por toda a stack (visualização, impressão e exportação)

### 📄 Leitura e navegação

- Renderização otimizada de PDFs
- Scroll contínuo vertical estilo leitura natural, com detecção automática da página visível
- Zoom dinâmico e responsivo
- Suporte a múltiplas abas, permitindo trabalhar com vários documentos simultaneamente

### 🖨️ Impressão integrada

- Integração nativa com impressoras do sistema (testado com impressoras físicas, como EPSON L3150)
- Suporte completo a Microsoft Print to PDF e impressoras físicas
- Impressão silenciosa (sem diálogo nativo do Windows), com seleção de impressora, cópias, frente e verso, cor e intervalo de páginas direto na interface do app
- Fluxo de impressão funciona inclusive para documentos protegidos por senha, via pipeline próprio com PDF.js

---

## 🧩 Arquitetura técnica

- Electron para runtime desktop, com processo principal responsável por impressão silenciosa, diálogos nativos e geração de janelas auxiliares de renderização
- React para interface, com componentes separados por responsabilidade (visualizador, abas, toolbar, modais)
- TypeScript para tipagem forte em toda a aplicação, incluindo contratos de IPC entre processo principal e renderer
- Hooks customizados para:
  - carregamento de PDF (com tratamento de erros e senha)
  - gerenciamento de abas (`usePdfTabs`)
  - navegação de páginas e sincronização com scroll
  - controle de zoom
- Pipeline de impressão dedicado, usando PDF.js para descriptografar e renderizar páginas selecionadas em canvas antes de enviar para a impressora — contornando limitações de bibliotecas tradicionais com arquivos protegidos
- Design system próprio em CSS, com tokens centralizados (cores, espaçamentos, tipografia, sombras e glow), garantindo consistência visual em toda a aplicação

---

## 🎯 Conceito do produto

O ALFA PDF Reader não é apenas um leitor de PDF.

Ele foi estruturado como um **produto desktop real**, com foco em:

- UX limpa e direta
- Baixa fricção de uso
- Integração nativa com Windows
- Performance em arquivos grandes
- Fluxo de impressão real, incluindo documentos protegidos por senha
- Identidade visual e de marca própria, do instalador à interface

---

## 📊 Estatísticas

<div align="center">

<img height="180em" src="https://github-readme-stats.vercel.app/api?username=SEUUSUARIO&show_icons=true&theme=tokyonight&hide_border=true"/>
<img height="180em" src="https://github-readme-stats.vercel.app/api/top-langs/?username=SEUUSUARIO&layout=compact&theme=tokyonight&hide_border=true"/>

</div>

---

## 🔥 Sequência de contribuições

<div align="center">

<img src="https://streak-stats.demolab.com?user=SEUUSUARIO&theme=tokyonight&hide_border=true" />

</div>

---

## 🌐 Contato

<div align="center">

<a href="SEU_LINKEDIN">
<img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"/>
</a>
<a href="SEU_GITHUB">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/>
</a>

</div>
