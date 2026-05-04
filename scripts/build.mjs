import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
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
run('php', ['scripts/generate-social-card.php']);

const distDir = resolve('dist');
const distAppDir = resolve('dist/app');

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const path of ['backup', 'css', 'img', 'js', '.htaccess', 'manifest.webmanifest', 'sw.js']) {
  await cp(resolve('app', path), resolve(distAppDir, path), {
    recursive: true,
    verbatimSymlinks: true
  });
}

for (const file of await readdir(resolve(distAppDir, 'img/favicon'))) {
  const keep = [
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'apple-touch-icon.png',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon-48x48.png',
    'favicon-64x64.png'
  ].includes(file);

  if (!keep) {
    await rm(resolve(distAppDir, 'img/favicon', file), { force: true });
  }
}

const rendered = spawnSync('php', ['scripts/render-page.php'], {
  encoding: 'utf8',
  env: {
    ...process.env,
    SITE_URL: process.env.SITE_URL ?? 'https://example.com'
  }
});

if (rendered.error) {
  throw rendered.error;
}

if (rendered.status !== 0) {
  process.stderr.write(rendered.stderr);
  process.exit(rendered.status ?? 1);
}

await writeFile(resolve(distAppDir, 'index.html'), rendered.stdout);

console.log('Built static app into dist/app.');
