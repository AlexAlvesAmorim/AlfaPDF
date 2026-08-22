// Quick test: apply rcedit and check if it works
import { rcedit } from 'rcedit';
import { resolve } from 'path';

const exe = resolve('release/win-unpacked/ALFA PDF Reader.exe');
const ico = resolve('installer/assets/alfa.ico');

console.log('Applying rcedit to:', exe);
console.log('Icon:', ico);

try {
  await rcedit(exe, {
    'set-icon': ico,
    'set-version-string': {
      'ProductName': 'ALFA PDF Reader',
      'FileDescription': 'ALFA PDF Reader - Visualizador PDF Profissional',
      'CompanyName': 'Alex Alves Amorim',
      'LegalCopyright': 'Copyright (c) 2026 Alex Alves Amorim',
      'OriginalFilename': 'ALFA PDF Reader.exe',
      'InternalName': 'ALFA PDF Reader',
    },
    'set-file-version': '2.1.4',
    'set-product-version': '2.1.4',
  });
  console.log('✅ rcedit applied successfully!');
} catch (e) {
  console.error('❌ rcedit failed:', e.message);
  console.error(e.stack);
}
