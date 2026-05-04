import { readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const sourceDirs = ['app', 'scripts', 'test'];
const jsFiles = [];
const phpFiles = [];

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      await collectFiles(path);
      continue;
    }

    if (entry.isFile() && extname(entry.name) === '.js') {
      jsFiles.push(path);
    }

    if (entry.isFile() && extname(entry.name) === '.php') {
      phpFiles.push(path);
    }
  }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  if (result.error?.code === 'ENOENT') {
    return { missing: true };
  }

  return result;
}

function assertSuccess(command, args, label) {
  const result = run(command, args);

  if (result.missing) {
    throw new Error(`${command} is required to check ${label}.`);
  }

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`${label} failed:\n${output}`);
  }
}

for (const dir of sourceDirs) {
  await collectFiles(dir);
}

for (const file of jsFiles) {
  assertSuccess(process.execPath, ['--check', file], relative('.', file));
}

for (const file of phpFiles) {
  assertSuccess('php', ['-l', file], relative('.', file));
}

console.log(`Checked ${jsFiles.length} JavaScript files and ${phpFiles.length} PHP files.`);
