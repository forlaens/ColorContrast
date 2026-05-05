import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const distDir = 'dist/app';

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await listFiles(path));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

test('build creates a static release artifact', async () => {
  const result = spawnSync('npm', ['run', 'build'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  assert.equal(result.status, 0, [result.stdout, result.stderr].join('\n'));

  const index = await readFile(join(distDir, 'index.html'), 'utf8');
  assert.match(index, /<title>Image contrast checker<\/title>/);
  assert.match(index, /<meta property="og:image" content="https:\/\/example\.com\/img\/social-card\.png">/);
  assert.match(index, /<script src="\/js\/app\.js" defer><\/script>/);
  assert.match(index, /<link rel="manifest" href="\/manifest\.webmanifest">/);

  const files = await listFiles(distDir);
  assert.equal(files.some((file) => extname(file) === '.php'), false);
  assert.equal(files.some((file) => file.includes('/include/')), false);
});

test('build includes backup folder placeholder', async () => {
  const files = await readdir(join(distDir, 'backup'));
  assert.deepEqual(files, ['.gitkeep']);
});

test('release config forces HTTPS and removes www', async () => {
  const htaccess = await readFile(join(distDir, '.htaccess'), 'utf8');

  assert.match(htaccess, /RewriteEngine On/);
  assert.match(htaccess, /RewriteCond %\{HTTPS\} off \[OR\]/);
  assert.match(htaccess, /RewriteCond %\{HTTP_HOST\} \^www\\\. \[NC\]/);
  assert.match(htaccess, /RewriteRule \^ https:\/\/%1%\{REQUEST_URI\} \[L,NE,R=301\]/);
});

test('social card asset has expected dimensions', async () => {
  const file = await stat(join(distDir, 'img/social-card.png'));
  assert.equal(file.size > 0, true);

  const image = await readFile(join(distDir, 'img/social-card.png'));
  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);

  assert.equal(width, 1200);
  assert.equal(height, 630);
});

test('document avoids deprecated mobile app meta tags', async () => {
  const index = await readFile(join(distDir, 'index.html'), 'utf8');
  assert.equal(index.includes('apple-mobile-web-app-capable'), false);
  assert.match(index, /<meta name="mobile-web-app-capable" content="yes">/);
});

test('document provides a skip link to main content', async () => {
  const index = await readFile(join(distDir, 'index.html'), 'utf8');
  assert.match(index, /<a class="skip-link" href="#main-content" data-i18n="skipLink">Skip to main content<\/a>/);
  assert.match(index, /<main id="main-content" class="app-shell" tabindex="-1">/);
});

test('document provides an accessible error region', async () => {
  const index = await readFile(join(distDir, 'index.html'), 'utf8');
  assert.match(index, /<div hidden id="app-error" class="error-panel" role="alert" tabindex="-1"><\/div>/);
});

test('document explains purpose and basic use without eyebrow labels', async () => {
  const index = await readFile(join(distDir, 'index.html'), 'utf8');
  assert.match(index, /<h2 id="intro-title" data-i18n="introTitle">How to use it<\/h2>/);
  assert.match(index, /Check whether text or UI colors have enough contrast/);
  assert.match(index, /The file stays in your browser/);
  assert.ok(index.indexOf('id="step-1"') < index.indexOf('id="intro-title"'));
  assert.equal(index.includes('class="eyebrow"'), false);
});

test('document includes language switcher support', async () => {
  const index = await readFile(join(distDir, 'index.html'), 'utf8');
  const i18n = await readFile(join(distDir, 'js/i18n.js'), 'utf8');

  assert.match(index, /<select id="language-switcher" name="language" autocomplete="off"><\/select>/);
  assert.match(index, /<script src="\/js\/i18n\.js" defer><\/script>/);
  assert.match(i18n, /code: 'kl'/);
  assert.match(i18n, /code: 'it'/);
});

test('build includes PWA files', async () => {
  const manifest = JSON.parse(await readFile(join(distDir, 'manifest.webmanifest'), 'utf8'));
  const serviceWorker = await readFile(join(distDir, 'sw.js'), 'utf8');

  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.icons.length >= 2, true);
  assert.match(serviceWorker, /colorcontrast-v1/);
  assert.match(serviceWorker, /\/css\/style\.css/);
});
