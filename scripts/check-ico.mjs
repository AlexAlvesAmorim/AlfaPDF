import { readFileSync } from 'fs';

const buf = readFileSync('installer/assets/alfa.ico');
console.log('Size:', buf.length, 'bytes');
console.log('Magic bytes:', buf[0], buf[1]);
console.log('Type:', buf.readUInt16LE(2));
console.log('Image count:', buf.readUInt16LE(4));

if (buf[0] === 0 && buf[1] === 0 && buf.readUInt16LE(2) === 1) {
  console.log('✅ Valid ICO file');
  const count = buf.readUInt16LE(4);
  for (let i = 0; i < count; i++) {
    const offset = 6 + i * 16;
    const w = buf[offset] || 256;
    const h = buf[offset + 1] || 256;
    const bpp = buf.readUInt16LE(offset + 6);
    const size = buf.readUInt32LE(offset + 8);
    console.log(`  Image ${i}: ${w}x${h} @ ${bpp}bpp, size=${size}`);
  }
} else {
  console.log('❌ NOT a valid ICO file!');
}
