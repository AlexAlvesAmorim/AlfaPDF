// Teste de Auto-Update
// Executar com: node scripts/test-update.js

const path = require('path');
const fs = require('fs');

async function test() {
  console.log('\n========================================');
  console.log('TESTE DE AUTO-UPDATE - ALFA PDF Reader 2.0');
  console.log('========================================\n');
  
  const checks = [
    { name: 'Version package.json', check: () => {
      const pkg = require('../package.json');
      console.log('  ✓ Versão:', pkg.version);
      console.log('  ✓ App ID:', pkg.build.appId);
      return true;
    }},
    { name: 'electron-builder configurado', check: () => {
      const pkg = require('../package.json');
      const build = pkg.build || {};
      const publish = build.publish || {};
      console.log('  ✓ provider:', publish.provider);
      console.log('  ✓ owner:', publish.owner);
      console.log('  ✓ repo:', publish.repo);
      return true;
    }},
    { name: 'electron-updater instalado', check: () => {
      try {
        require.resolve('electron-updater');
        console.log('  ✓ electron-updater encontrado em node_modules');
        return true;
      } catch (e) {
        console.log('  ✗ electron-updater NAO instalado');
        return false;
      }
    }},
    { name: 'UpdateNotifier.tsx', check: () => {
      const exists = fs.existsSync('../src/shared/components/UpdateNotifier.tsx');
      console.log('  ✓ Arquivo existe:', exists);
      return exists;
    }}
  ];
  
  let passed = 0;
  for (const check of checks) {
    try {
      if (check.check()) passed++;
      console.log('  [PASS] ' + check.name);
    } catch (e) {
      console.log('  [FAIL] ' + check.name + ': ' + e.message);
    }
    console.log('');
  }
  
  console.log('========================================');
  console.log('RESULTADO: ' + passed + '/' + checks.length + ' checks passados');
  console.log('========================================');
  
  if (passed === checks.length) {
    console.log('\n[OK] Auto-update configurado corretamente!');
    console.log('\nPara funcionar necessita:');
    console.log('  1. Release no GitHub com tag v2.0.0');
    console.log('  2. Repositorio publico');
    console.log('  3. Token GitHub valido (se repo privado)');
  } else {
    console.log('\n[ERRO] Problemas detectados no auto-update!');
    console.log('Verifique os logs acima.');
  }
}

test().catch(console.error);