import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Check if rcedit actually applied the icon to the exe
const exePath = resolve('release/win-unpacked/ALFA PDF Reader.exe');

console.log('Checking exe:', exePath);
console.log('Exists:', existsSync(exePath));

// Check the version info embedded in the exe
try {
  const result = execSync(`powershell -Command "(Get-Item '${exePath}').VersionInfo | Format-List *"`, { encoding: 'utf-8' });
  console.log('\nVersion Info:');
  console.log(result);
} catch (e) {
  console.log('Error:', e.message);
}

// Check if default_app.asar exists (it shouldn't - it's the default Electron app)
const defaultAsar = resolve('release/win-unpacked/resources/default_app.asar');
console.log('\ndefault_app.asar exists:', existsSync(defaultAsar));
console.log('(This is the DEFAULT Electron app with the Electron icon!)');

// Check app directory
const appDir = resolve('release/win-unpacked/resources/app');
console.log('resources/app exists:', existsSync(appDir));
