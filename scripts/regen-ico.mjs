// Regenera o alfa.ico com PNG embutido (32bpp com alpha)
// O formato ICO moderno suporta PNG embutido para resoluções >= 48px

import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const LOGO_PNG = resolve('installer/assets/logo.png');
const ICO_OUT = resolve('installer/assets/alfa.ico');
const ICO_BACKUP = resolve('installer/assets/alfa-8bpp-backup.ico');

const SIZES = [16, 24, 32, 48, 64, 128, 256];

// Constrói ICO com PNGs embutidos (formato moderno do Windows Vista+)
function buildIcoFromPngs(pngBuffers, sizes) {
  const count = pngBuffers.length;
  // ICO header: 6 bytes
  // ICO directory entry: 16 bytes each
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset = headerSize + count * dirEntrySize;

  // Calculate total size
  let totalDataSize = 0;
  for (const buf of pngBuffers) {
    totalDataSize += buf.length;
  }

  const ico = Buffer.alloc(dataOffset + totalDataSize);

  // ICO header
  ico.writeUInt16LE(0, 0);      // Reserved
  ico.writeUInt16LE(1, 2);      // Type: 1 = ICO
  ico.writeUInt16LE(count, 4);  // Number of images

  let currentDataOffset = dataOffset;

  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const pngBuf = pngBuffers[i];
    const entryOffset = headerSize + i * dirEntrySize;

    // ICO directory entry
    ico.writeUInt8(size >= 256 ? 0 : size, entryOffset);      // Width (0 = 256)
    ico.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1);  // Height (0 = 256)
    ico.writeUInt8(0, entryOffset + 2);                         // Color palette (0 = no palette)
    ico.writeUInt8(0, entryOffset + 3);                         // Reserved
    ico.writeUInt16LE(1, entryOffset + 4);                      // Color planes
    ico.writeUInt16LE(32, entryOffset + 6);                     // Bits per pixel
    ico.writeUInt32LE(pngBuf.length, entryOffset + 8);          // Image data size
    ico.writeUInt32LE(currentDataOffset, entryOffset + 12);     // Image data offset

    // Copy PNG data
    pngBuf.copy(ico, currentDataOffset);
    currentDataOffset += pngBuf.length;
  }

  return ico;
}

async function main() {
  if (!existsSync(LOGO_PNG)) {
    console.error('❌ logo.png não encontrado em installer/assets/');
    process.exit(1);
  }

  console.log('📷 Lendo logo.png...');
  const logoPng = readFileSync(LOGO_PNG);
  const meta = await sharp(logoPng).metadata();
  console.log(`   Tamanho: ${meta.width}x${meta.height}, canais: ${meta.channels}, formato: ${meta.format}`);

  console.log('🔄 Gerando PNGs em múltiplas resoluções (32bpp com alpha)...');

  const pngBuffers = [];
  for (const size of SIZES) {
    const buf = await sharp(logoPng)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    pngBuffers.push(buf);
    console.log(`   ✅ ${size}x${size} - ${buf.length} bytes`);
  }

  console.log('📦 Codificando ICO com PNG embutido (32bpp)...');
  const icoBuffer = buildIcoFromPngs(pngBuffers, SIZES);
  writeFileSync(ICO_OUT, icoBuffer);

  // Verificar o resultado
  const result = readFileSync(ICO_OUT);
  const imageCount = result.readUInt16LE(4);
  console.log(`\n✅ alfa.ico gerado: ${result.length} bytes, ${imageCount} imagens`);

  for (let i = 0; i < imageCount; i++) {
    const offset = 6 + i * 16;
    const w = result[offset] || 256;
    const h = result[offset + 1] || 256;
    const bpp = result.readUInt16LE(offset + 6);
    const dataSize = result.readUInt32LE(offset + 8);
    console.log(`   Imagem ${i}: ${w}x${h} @ ${bpp}bpp, size=${dataSize} bytes (PNG embutido)`);
  }
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
