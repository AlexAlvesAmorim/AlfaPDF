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
  
  // Footer
  titlePage.drawText("Copyright (c) 2026 Alex Alves Amorim", {
    x: 24, y: 24, size: 10, font
  });
  
  // Content page 1 - Mudancas
  const contentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  
  let y = 750;
  const lineHeight = 24;
  
  // Title
  contentPage.drawText("ALFA PDF Reader - Changelog v2.0.0", { x: 48, y: y, size: 18, font: fontBold });
  y -= lineHeight;
  
  // Subtitle
  contentPage.drawText("Desenvolvido por: Alex Alves Amorim", { x: 48, y: y, size: 12, font });
  y -= lineHeight * 1.5;
  
  // Section 1
  y -= 12;
  contentPage.drawText("1. BOTAO OPCOES AVANCADAS", { x: 48, y: y, size: 14, font: fontBold });
  y -= lineHeight;
  contentPage.drawText("Mudanca: Botao movido da toolbar para dentro do modal de impressao", { x: 80, y: y, size: 11, font });
  y -= lineHeight;
  contentPage.drawText("Beneficio: UX mais limpa, acoes agrupadas no fluxo correto", { x: 80, y: y, size: 11, font });
  
  // Footer
  contentPage.drawText("v2.0.0 | Build: " + new Date().toISOString().split('T')[0], 
    { x: pageWidth - 250, y: 24, size: 10, font });
  
  // Save
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('ALFA-PDF-Reader-CHANGELOG.pdf', pdfBytes);
  console.log('Changelog PDF criado!');
}

main().catch(console.error);