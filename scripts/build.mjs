import { cp, mkdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: 'inherit'
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(process.execPath, ['scripts/check.mjs']);

const distDir = resolve('dist');
const distAppDir = resolve('dist/app');

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(resolve('app'), distAppDir, {
  recursive: true,
  verbatimSymlinks: true
});

console.log('Built app into dist/app.');
