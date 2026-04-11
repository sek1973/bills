import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function collectSpecs(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) results.push(...collectSpecs(full));
    else if (e.isFile() && full.endsWith('.spec.ts')) results.push(full);
  }
  return results;
}

const lib = process.argv[2];
if (!lib) {
  console.error('Usage: node run-vitest.mjs <lib-name>');
  process.exit(2);
}

const base = path.resolve(process.cwd(), 'projects', lib, 'src');
const specs = collectSpecs(base);
if (!specs.length) {
  console.error(`No spec files found for project: ${lib}`);
  process.exit(1);
}

const args = ['vitest', '--run', ...specs];
const res = spawnSync('npx', args, { stdio: 'inherit', shell: false });
process.exit(res.status ?? 1);
