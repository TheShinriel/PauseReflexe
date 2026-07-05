import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'src', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const outDir = join(root, 'dist');
const zipName = `pause-reflexe-${manifest.version}-chrome.zip`;
const zipPath = join(outDir, zipName);

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execFileSync(
  'zip',
  [
    '-r',
    zipPath,
    '.',
    '-x',
    '*.DS_Store',
    '-x',
    '__MACOSX/*',
    '-x',
    '*/__MACOSX/*',
  ],
  {
    cwd: join(root, 'src'),
    stdio: 'inherit',
  },
);

console.log(`Chrome package created: ${zipPath}`);
