const { PDFDocument, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function main() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 595;
  const pageHeight = 842;
  
  // Title page
  const titlePage = pdfDoc.addPage([pageWidth, pageHeight]);
  
  titlePage.drawText("ALFA PDF Reader v2.0", { 
    x: 120, y: 680, size: 28, font: fontBold 
  });
  
  titlePage.drawText("Mudancas e Melhorias", { 
    x: 180, y: 640, size: 18, font: font 
  });
  
  titlePage.drawText("Comparacao: v1.2 vs v2.0", { 
    x: 200, y: 610, size: 14, font: font 
  });
  
  // Content
  const contentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  
  let y = 720;
  const lineHeight = 28;
  
  // Header
  contentPage.drawText("ALFA PDF Reader - Changelog v2.0.0", { x: 48, y: y, size: 18, font: fontBold });
  y -= lineHeight;
  contentPage.drawText("Desenvolvido por: Alex Alves Amorim", { x: 48, y: y, size: 12, font: font });
  y -= lineHeight * 1.5;
  
  // Main changes
  const changes = [
    "BOTAO ' Opcoes Avancadas' MOVIDOS PARA MODAL DE IMPRESSAO",
    "  - Localizacao: Dentro do PrintDialog, ao lado dos botoes 'Salvar PDF' e 'Imprimir'",
    "  - Beneficio: UX mais limpa, menos opções dispersas na toolbar",
    "",
    "SISTEMA DE AUTO-ATUALIZACAO",
    "  - Novo componente: UpdateNotifier.tsx",
    "  - Verificacao automatica 3s após iniciar",
    "  - Download em background sem loop",
    "  - Instalacao automatica ao fechar (ou manual)",
    "",
    "PIPELINE DE IMPRESSAO REVISADO",
    "  - Novo: Botao 'Opcoes Avancadas' abre dialogo nativo do Windows",
    "  - Pacote com pdf-lib para filtragem de paginas",
    "  - Suporte a documentos protegidos por senha",
    "",
    "TYPESCRIPT COMPLETO",
    "  - Tipagem forte em toda a stack",
    "  - Contratos IPC definidos em electron.d.ts",
    "  - Menos erros em tempo de desenvolvimento",
    "",
    "CI/CD CONDICIONADO",
    "  - GitHub Actions com npm ci -> typecheck -> lint -> test",
    "  - All checks passing",
    "",
    "INSTALLER PROFISSIONAL",
    "  - Gerado com Inno Setup 6",
    "  - Branding personalizado (vermelho #e4002b)",
    "  - Suporte multi-idioma (ptBR, en)",
    "  - Atalhos desktop e menu iniciar"
  ];
  
  for (const line of changes) {
    if (line === "") {
      y -= 12;
      continue;
    }
    if (line.startsWith("  ")) {
      contentPage.drawText(line, { x: 80, y: y, size: 11, font: font });
    } else {
      contentPage.drawText(line, { x: 48, y: y, size: 14, font: fontBold });
    }
    y -= lineHeight;
  }
  
  // Footer
  contentPage.drawText(">© 2026 Alex Alves Amorim | Build: " + new Date().toISOString().split('T')[0], 
    { x: 48, y: 24, size: 10, font: font });
  
  // Save
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('ALFA-PDF-Reader-CHANGELOG-2.0.pdf', pdfBytes);
  console.log('Changelog PDF criado com sucesso!');
}

main().catch(console.error);