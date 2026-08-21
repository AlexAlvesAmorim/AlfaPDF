const sharp = require('sharp')
const icoEndec = require('ico-endec')
const { resolve } = require('path')
const { writeFileSync } = require('fs')

const LOGO_PNG = resolve('src/renderer/assets/logo.png')
const OUTPUT_ICO = resolve('installer/assets/alfa.ico')

async function generateMultiResIcon() {
  console.log('🔨 Gerando ícone multi-resolução...')
  
  const sizes = [16, 24, 32, 48, 64, 128, 256]
  
  const buffers = await Promise.all(
    sizes.map(async size => {
      const buffer = await sharp(LOGO_PNG)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
      return buffer
    })
  )
  
  const encoder = new icoEndec.Encoder(buffers)
  const icoBuffer = encoder.encode()
  writeFileSync(OUTPUT_ICO, icoBuffer)
  
  console.log(`✅ Ícone gerado: ${OUTPUT_ICO}`)
  console.log(`   Tamanhos incluídos: ${sizes.join(', ')}`)
  console.log(`   Tamanho do arquivo: ${icoBuffer.length} bytes`)
}

generateMultiResIcon().catch(err => {
  console.error('❌ Erro:', err)
  process.exit(1)
})