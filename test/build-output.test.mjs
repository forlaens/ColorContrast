import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const distDir = 'dist';

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
  assert.match(index, /<style>/);
  assert.match(index, /<script src="\/js\/app\.bundle\.js" defer><\/script>/);
  assert.equal(index.includes('<link href="/css/style.css" rel="stylesheet">'), false);
  assert.match(index, /<link rel="manifest" href="\/manifest\.webmanifest">/);

  const rootEntries = await readdir('dist');
  assert.equal(rootEntries.includes('app'), false);
  assert.deepEqual((await readdir(join(distDir, 'js'))).sort(), ['app.bundle.js']);

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
  assert.match(htaccess, /ExpiresByType image\/webp "access plus 1 year"/);
  assert.match(htaccess, /Cache-Control "public, max-age=31536000, immutable"/);
  assert.match(htaccess, /<FilesMatch "\^\(index\\\.html\|sw\\\.js\)\$">/);
  assert.match(htaccess, /Cache-Control "no-cache, no-store, must-revalidate"/);
});

test('service worker cache changes with built content', async () => {
  const serviceWorker = await readFile(join(distDir, 'sw.js'), 'utf8');

  assert.match(serviceWorker, /const CACHE_NAME = 'colorcontrast-[a-f0-9]{12}';/);
  assert.doesNotMatch(serviceWorker, /colorcontrast-v3/);
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
  assert.match(index, /<a class="skip-link" href="#main-content" onclick="markSkipLinkTarget\(\);" data-i18n="skipLink">Skip to main content<\/a>/);
  assert.match(index, /<div class="app-shell">/);
  assert.match(index, /<header class="hero" aria-labelledby="app-title">/);
  assert.match(index, /<h1 id="app-title">/);
  assert.match(index, /<a class="home-title-link" href="\/" onclick="return showFrontView\(\);" data-i18n="title">Image contrast checker<\/a>/);
  assert.match(index, /<main id="main-content" class="app-main" tabindex="-1">/);
  assert.ok(index.indexOf('<header class="hero"') < index.indexOf('id="main-content"'));
});

test('document provides an accessible error region', async () => {
  const index = await readFile(join(distDir, 'index.html'), 'utf8');
  assert.match(index, /<div hidden id="app-error" class="error-panel" role="alert" tabindex="-1"><\/div>/);
});

test('document includes contact footer', async () => {
  const index = await readFile(join(distDir, 'index.html'), 'utf8');
  const i18n = await readFile(join(distDir, 'js/app.bundle.js'), 'utf8');

  assert.match(index, /<footer class="site-footer">/);
  assert.match(index, /<section hidden id="accessibility-statement" class="accessibility-page" aria-labelledby="accessibility-statement-title" tabindex="-1">/);
  assert.match(index, /<h2 id="accessibility-statement-title" data-i18n="accessibilityTitle">Accessibility statement<\/h2>/);
  assert.match(index, /<p class="accessibility-lede" data-i18n="accessibilityIntro">/);
  assert.match(index, /<h3 id="accessibility-status-title" data-i18n="accessibilityStatusTitle">Conformance status<\/h3>/);
  assert.match(index, /<h3 id="accessibility-scope-title" data-i18n="accessibilityScopeTitle">Scope<\/h3>/);
  assert.match(index, /<h3 id="accessibility-standard-title" data-i18n="accessibilityStandardTitle">Accessibility approach<\/h3>/);
  assert.match(index, /<h3 id="accessibility-measures-title" data-i18n="accessibilityMeasuresTitle">What the tool can and cannot do<\/h3>/);
  assert.match(index, /<h3 id="accessibility-testing-title" data-i18n="accessibilityTestingTitle">Testing<\/h3>/);
  assert.match(index, /<h3 id="accessibility-feedback-title" data-i18n="accessibilityFeedbackTitle">Feedback and contact<\/h3>/);
  assert.match(index, /<span data-i18n="accessibilityFeedbackCopy">If you find an accessibility problem, have trouble using the app, or have a suggestion, email<\/span>/);
  assert.doesNotMatch(index, /accessibility-limitations-title/);
  assert.doesNotMatch(index, /accessibilityLimitations/);
  assert.doesNotMatch(index, /language switching, theme switching, drag and drop, upload handling, empty-canvas handling, and contrast rendering/);
  assert.match(index, /<p class="accessibility-updated" data-i18n="accessibilityUpdated">Last updated: May 7, 2026\.<\/p>/);
  assert.match(index, /<a class="back-link" href="\/" data-i18n="accessibilityBack">Back to checker<\/a>/);
  assert.match(index, /<div class="footer-inner">/);
  assert.match(index, /<p class="footer-brand">/);
  assert.match(index, /<span data-i18n="footerCopyright">Copyright<\/span>/);
  assert.match(index, /<a href="https:\/\/forlaens\.com\/">Forlæns<\/a>/);
  assert.match(index, /<div class="footer-meta">/);
  assert.match(index, /<span data-i18n="footerContact">Contact, questions, or suggestions:<\/span>/);
  assert.match(index, /<a href="mailto:tobias@forlaens\.com">tobias@forlaens\.com<\/a>/);
  assert.match(index, /<span class="footer-separator" aria-hidden="true">\|<\/span>/);
  assert.match(index, /<a href="#accessibility-statement" data-i18n="accessibilityLink">Accessibility Statement<\/a>/);
  assert.match(i18n, /footerCopyright:/);
  assert.match(i18n, /footerContact:/);
  assert.match(i18n, /accessibilityTitle:/);
  assert.match(i18n, /accessibilityIntro:/);
  assert.match(i18n, /accessibilityStatusTitle:/);
  assert.match(i18n, /accessibilityScopeTitle:/);
  assert.match(i18n, /accessibilityStandardTitle:/);
  assert.match(i18n, /accessibilityMeasuresTitle:/);
  assert.match(i18n, /accessibilityTestingTitle:/);
  assert.doesNotMatch(i18n, /accessibilityLimitations/);
  assert.doesNotMatch(i18n, /language switching, theme switching, drag and drop, upload handling, empty-canvas handling, and contrast rendering/);
  assert.match(i18n, /manually tested with screen readers such as NVDA, JAWS, and VoiceOver/);
  assert.match(i18n, /accessibilityFeedbackTitle:/);
  assert.match(i18n, /accessibilityUpdated:/);
  assert.match(i18n, /accessibilityLink:/);
  assert.match(i18n, /accessibilityBack:/);
});

test('document explains purpose and basic use without eyebrow labels', async () => {
  const index = await readFile(join(distDir, 'index.html'), 'utf8');
  const app = await readFile(join(distDir, 'js/app.bundle.js'), 'utf8');

  assert.match(index, /<section id="intro-panel" class="intro-panel" aria-labelledby="intro-title">/);
  assert.match(index, /<h2 id="intro-title" data-i18n="introTitle">How to use it<\/h2>/);
  assert.match(index, /<button id="intro-toggle" class="intro-toggle" type="button" aria-expanded="true" aria-controls="intro-steps" aria-labelledby="intro-title"><\/button>/);
  assert.match(index, /<h3 data-i18n="stepUploadTitle">Upload an image<\/h3>/);
  assert.match(index, /<h3 data-i18n="stepColorTitle">Choose the color to check<\/h3>/);
  assert.match(index, /<h3 data-i18n="stepRunTitle">Run the test<\/h3>/);
  assert.match(index, /<form id="step-1" class="step upload-panel"[^>]+aria-labelledby="upload-title"/);
  assert.match(index, /<h2 id="upload-title" class="upload-title" data-i18n="chooseImage">Choose an image<\/h2>/);
  assert.match(index, /<option value="3" data-i18n="nonText">Graphics \(3:1\)<\/option>/);
  assert.match(index, /<span id="zoom-label" data-i18n="zoomLabel">Zoom<\/span>/);
  assert.match(index, /<output id="zoom-output" for="image_preview" aria-live="polite">100%<\/output>/);
  assert.match(index, /<div class="zoom-controls" role="group" aria-labelledby="zoom-label">/);
  assert.match(index, /<div hidden id="pan-controls" class="pan-controls" role="group" aria-label="Pan image" data-i18n-aria-label="panControls">/);
  assert.match(index, /<button id="hand-tool" class="icon-button" type="button" aria-label="Drag image" data-i18n-aria-label="dragImage" aria-pressed="false" onclick="toggleHandTool\(this\);">/);
  assert.match(index, /<section id="preview-viewport" class="preview-viewport" tabindex="0" aria-label="Zoomable image preview" data-i18n-aria-label="previewViewport" aria-describedby="preview-help">/);
  assert.match(index, /Choose a color from the image, run the test/);
  assert.match(index, /can I still read it or see what I am supposed to see/);
  assert.match(index, /The file stays in your browser/);
  assert.ok(index.indexOf('id="step-1"') < index.indexOf('id="intro-title"'));
  assert.equal(index.includes('class="eyebrow"'), false);
  assert.match(app, /colorcontrast-intro-open/);
  assert.match(app, /click/);
  assert.match(app, /hashchange/);
  assert.match(app, /#accessibility-statement/);
  assert.match(app, /showFrontView/);
  assert.match(app, /initCheckerSettings/);
});

test('document includes language switcher support', async () => {
  const index = await readFile(join(distDir, 'index.html'), 'utf8');
  const i18n = await readFile(join(distDir, 'js/app.bundle.js'), 'utf8');

  assert.match(index, /<select id="language-switcher" name="language" autocomplete="off"><\/select>/);
  assert.match(index, /<div id="settings-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true"><\/div>/);
  assert.match(index, /<p id="checker-result" class="sr-only" role="status" aria-live="polite" aria-atomic="true"><\/p>/);
  assert.match(index, /<label for="image_file" class="file-picker-control">/);
  assert.match(index, /<span class="file-picker-button" data-i18n="chooseFile">Choose file<\/span>/);
  assert.match(index, /data-i18n-file-empty="noFileChosen"/);
  assert.match(index, /data-i18n-aria-label="checkerRegion"/);
  assert.match(index, /data-i18n-aria-label="settingsToolbar"/);
  assert.match(index, /<script src="\/js\/app\.bundle\.js" defer><\/script>/);
  assert.match(i18n, /code:"kl"/);
  assert.match(i18n, /code:"it"/);
  assert.match(i18n, /chooseFile:/);
  assert.match(i18n, /droppedFilePickerError:/);
  assert.match(i18n, /languageChanged:/);
  assert.match(i18n, /themeChanged:/);
  assert.match(i18n, /nonText:"Graphics/);
  assert.match(i18n, /panControls:/);
  assert.match(i18n, /dragImage:/);
  assert.match(i18n, /emptyCanvasStatus:/);
  assert.match(i18n, /imageLoadedStatus:/);
  assert.match(i18n, /colorSelectedStatus:/);
  assert.match(i18n, /testCompleteStatus:/);
  assert.match(i18n, /testCompleteNoIssuesStatus:/);
  assert.equal(i18n.includes('Non-text (3:1)'), false);
});

test('document includes dark mode support', async () => {
  const index = await readFile(join(distDir, 'index.html'), 'utf8');
  const styles = await readFile(join(distDir, 'css/style.css'), 'utf8');
  const app = await readFile(join(distDir, 'js/app.bundle.js'), 'utf8');

  assert.match(index, /<meta name="color-scheme" content="light dark">/);
  assert.match(index, /<label for="theme-toggle" data-i18n="themeLabel">Theme<\/label>/);
  assert.match(index, /<button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false" aria-label="Dark mode" data-i18n-aria-label="themeDark">/);
  assert.match(index, /<svg class="theme-icon" aria-hidden="true" focusable="false" viewBox="0 0 32 32">/);
  assert.match(styles, /prefers-color-scheme: dark/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /--focus-ring: #111827/);
  assert.match(styles, /--focus-ring: #ffffff/);
  assert.match(app, /colorcontrast-theme/);
  assert.match(app, /prefers-color-scheme: dark/);
});

test('document remembers checker settings', async () => {
  const app = await readFile(join(distDir, 'js/app.bundle.js'), 'utf8');

  assert.match(app, /colorcontrast-test-color/);
  assert.match(app, /colorcontrast-conformance-level/);
  assert.match(app, /function initCheckerSettings\(\)/);
  assert.match(app, /function restoreCheckerSettings\(\)/);
  assert.match(app, /function storeCheckerSettings\(\)/);
  assert.match(app, /function announceContrastResult\(/);
  assert.match(app, /function resetPreviewImage\(\)/);
});

test('document includes step illustrations', async () => {
  const index = await readFile(join(distDir, 'index.html'), 'utf8');
  const illustrations = [
    'step-1-upload.webp',
    'step-2-pick-color.webp',
    'step-3-result.webp'
  ];

  for (const fileName of illustrations) {
    assert.match(index, new RegExp(`/img/steps/${fileName}`));
    assert.equal((await stat(join(distDir, 'img/steps', fileName))).size > 0, true);
  }

  assert.match(index, /step-1-upload\.webp" width="807" height="715" alt="" fetchpriority="high" decoding="async"/);
  assert.equal(index.includes('step-1-upload.webp" width="807" height="715" alt="" loading="lazy"'), false);
});

test('build includes PWA files', async () => {
  const manifest = JSON.parse(await readFile(join(distDir, 'manifest.webmanifest'), 'utf8'));
  const serviceWorker = await readFile(join(distDir, 'sw.js'), 'utf8');

  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.icons.length >= 2, true);
  assert.match(serviceWorker, /colorcontrast-[a-f0-9]{12}/);
  assert.match(serviceWorker, /\/js\/app\.bundle\.js/);
  assert.match(serviceWorker, /fetch\(event\.request\)/);
  assert.match(serviceWorker, /caches\.match\(event\.request\)/);
});
