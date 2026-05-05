import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test } from 'node:test';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { Refinement } from '@siteimprove/alfa-refinement';
import { Playwright } from '@siteimprove/alfa-playwright';
import { Audit, Outcomes, Rules } from '@siteimprove/alfa-test-utils';
import { Conformance, Criterion } from '@siteimprove/alfa-wcag';

const { and } = Refinement;

const renderedRoutes = [
  { name: 'home', path: '/' }
];

const supportedLanguages = ['en', 'da', 'no', 'sv', 'fi', 'kl', 'is', 'fo', 'es', 'de', 'fr', 'pt', 'it'];

const axeTags = [
  'wcag2a',
  'wcag2aa',
  'wcag2aaa',
  'wcag21a',
  'wcag21aa',
  'wcag21aaa',
  'wcag22a',
  'wcag22aa',
  'wcag22aaa',
  'best-practice'
];

const alfaAAAAndBestPracticeFilter = (rule) => {
  return rule.hasRequirement(and(Criterion.isCriterion, Conformance.isAAA()))
    || Rules.bestPracticesFilter(rule);
};

function buildApp() {
  const build = spawnSync('npm', ['run', 'build'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  assert.equal(build.status, 0, [build.stdout, build.stderr].join('\n'));
}

async function getFreePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  server.close();
  await once(server, 'close');
  return port;
}

async function startStaticServer() {
  const port = await getFreePort();
  const server = spawn('php', ['-S', `127.0.0.1:${port}`, '-t', 'dist/app'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out starting PHP server:\n${output}`));
    }, 5000);

    server.stderr.on('data', (chunk) => {
      if (chunk.toString().includes('Development Server')) {
        clearTimeout(timeout);
        resolve();
      }
    });

    server.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`PHP server exited with ${code}:\n${output}`));
    });
  });

  return {
    url: `http://127.0.0.1:${port}/`,
    async stop() {
      server.kill();
      await once(server, 'exit');
    }
  };
}

function formatAxeViolations(route, violations) {
  return violations.map((violation) => {
    const nodes = violation.nodes.map((node, index) => [
      `  ${index + 1}. ${node.target.join(', ')}`,
      node.failureSummary ? `     ${node.failureSummary.replaceAll('\n', '\n     ')}` : ''
    ].filter(Boolean).join('\n'));

    return [
      `${violation.id}: ${violation.help}`,
      `Route: ${route.path}`,
      `Impact: ${violation.impact ?? 'unknown'}`,
      `Tags: ${violation.tags.join(', ')}`,
      `Help: ${violation.helpUrl}`,
      `Elements:\n${nodes.join('\n')}`
    ].join('\n');
  }).join('\n\n');
}

async function writeAxeReport(route, results) {
  await mkdir('test-results/accessibility', { recursive: true });
  await writeFile(
    `test-results/accessibility/axe-${route.name}.json`,
    `${JSON.stringify(results, null, 2)}\n`
  );
}

test('built app passes Siteimprove Alfa WCAG AAA and best-practice checks', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(server.url, { waitUntil: 'networkidle' });

    const document = await page.evaluateHandle(() => window.document);
    const alfaPage = await Playwright.toPage(document);
    const audit = await Audit.run(alfaPage, {
      rules: { include: alfaAAAAndBestPracticeFilter },
      outcomes: { include: Outcomes.failedFilter }
    });

    const failed = audit.resultAggregates.reduce((total, result) => total + result.failed, 0);
    assert.equal(failed, 0, `Expected no Alfa WCAG AAA or best-practice failures, found ${failed}.`);
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('built app passes axe WCAG AAA and best-practice checks', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });

    for (const route of renderedRoutes) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      await page.goto(new URL(route.path, server.url).toString(), { waitUntil: 'networkidle' });

      const results = await new AxeBuilder({ page })
        .withTags(axeTags)
        .analyze();

      await writeAxeReport(route, results);

      assert.equal(
        results.violations.length,
        0,
        formatAxeViolations(route, results.violations)
      );

      await context.close();
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('built app supports every language in the switcher', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    const languages = await page.locator('#language-switcher option').evaluateAll((options) => {
      return options.map((option) => option.value);
    });

    assert.deepEqual(languages, supportedLanguages);

    for (const language of supportedLanguages) {
      await page.selectOption('#language-switcher', language);
      await page.waitForFunction((expected) => document.documentElement.lang === expected, language);

      const heading = await page.locator('#app-title').textContent();
      const fileLabel = await page.locator('#image_file').getAttribute('aria-label');
      const fileName = await page.locator('#selected-file-name').textContent();
      const checkerLabel = await page.locator('#preview_area').getAttribute('aria-label');
      const toolbarLabel = await page.locator('[role="toolbar"]').getAttribute('aria-label');
      assert.equal(await page.locator('#language-switcher').inputValue(), language);
      assert.equal(await documentLanguage(page), language);
      assert.equal((heading || '').trim().length > 0, true);
      assert.equal((fileLabel || '').trim().length > 0, true);
      assert.equal((fileName || '').trim().length > 0, true);
      assert.equal((checkerLabel || '').trim().length > 0, true);
      assert.equal((toolbarLabel || '').trim().length > 0, true);
    }

    await page.selectOption('#language-switcher', 'da');
    await page.waitForFunction(() => document.documentElement.lang === 'da');
    assert.equal(await page.locator('#image_file').getAttribute('aria-label'), 'Vælg fil');
    assert.equal(await page.locator('#selected-file-name').textContent(), 'Ingen fil valgt');
    assert.equal(await page.locator('#preview_area').getAttribute('aria-label'), 'Kontrasttjek');
    assert.equal(await page.locator('[role="toolbar"]').getAttribute('aria-label'), 'Indstillinger for tjek');

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('load image without a selected file opens an empty checker canvas', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('input[type="submit"][value="Load image"]').click();

    assert.equal(await page.locator('#step-2').isVisible(), true);
    assert.equal(await page.locator('#step-1').evaluate((element) => element.hidden), true);
    assert.equal(await page.locator('#step-1').isHidden(), true);
    assert.equal(await page.locator('#app-error').evaluate((element) => element.hidden), true);
    assert.equal(await page.locator('#image_preview').evaluate((canvas) => canvas.height), 320);

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('intro heading remains a heading when collapsed', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#intro-toggle').click();

    assert.equal(await page.locator('#intro-toggle').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#intro-steps').isHidden(), true);
    assert.equal(await page.getByRole('heading', { name: 'How to use it', level: 2 }).isVisible(), true);

    await page.locator('#intro-toggle').click();
    assert.equal(await page.getByRole('heading', { name: 'Upload an image', level: 3 }).isVisible(), true);
    assert.equal(await page.getByRole('heading', { name: 'Pick the foreground color', level: 3 }).isVisible(), true);
    assert.equal(await page.getByRole('heading', { name: 'Run the test', level: 3 }).isVisible(), true);

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('loading a selected image hides the image chooser in canvas view', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#image_file').setInputFiles(resolve('dist/app/img/social-card.png'));
    await page.locator('input[type="submit"][value="Load image"]').click();
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);

    assert.equal(await page.locator('#step-2').isVisible(), true);
    assert.equal(await page.locator('#step-1').evaluate((element) => element.hidden), true);
    assert.equal(await page.locator('#step-1').isHidden(), true);
    assert.equal(await page.locator('#step-1').getAttribute('aria-hidden'), 'true');
    assert.equal(await page.locator('#image_preview').evaluate((canvas) => canvas.height > 0), true);

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('image chooser previews selected and dropped images', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#image_file').setInputFiles(resolve('dist/app/img/social-card.png'));
    await page.locator('#image_file').dispatchEvent('change');
    assert.equal(await page.locator('#image-thumbnail').isVisible(), true);
    assert.match(await page.locator('#image-thumbnail').getAttribute('src'), /^blob:/);
    assert.equal(await page.locator('#selected-file-name').textContent(), 'social-card.png');

    const dragData = await createImageDataTransfer(page);
    await page.dispatchEvent('body', 'dragenter', { dataTransfer: dragData });
    assert.equal(await page.locator('body').evaluate((body) => body.classList.contains('is-dragging-image')), true);
    assert.equal(await page.locator('.upload-dropzone').evaluate((dropzone) => dropzone.classList.contains('is-drag-target')), true);
    await page.dispatchEvent('body', 'drop', { dataTransfer: dragData });

    assert.equal(await page.locator('#step-1').isVisible(), true);
    assert.equal(await page.locator('#image_file').evaluate((input) => input.files[0].name), 'dropped-social-card.png');
    assert.equal(await page.locator('#selected-file-name').textContent(), 'dropped-social-card.png');
    assert.equal(await page.locator('#image-thumbnail').isVisible(), true);

    await page.locator('input[type="submit"][value="Load image"]').click();
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);
    assert.equal(await page.locator('#step-2').isVisible(), true);

    const secondDragData = await createImageDataTransfer(page);
    await page.dispatchEvent('body', 'drop', { dataTransfer: secondDragData });
    assert.equal(await page.locator('#step-1').isVisible(), true);
    assert.equal(await page.locator('#step-2').isHidden(), true);

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('loaded image preview stays within the viewport on small screens and resize', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#image_file').setInputFiles(resolve('dist/app/img/social-card.png'));
    await page.locator('input[type="submit"][value="Load image"]').click();
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);

    async function assertNoHorizontalOverflow() {
      const dimensions = await page.evaluate(() => {
        const preview = document.querySelector('#preview_area');
        const canvas = document.querySelector('#image_preview');
        return {
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          previewWidth: Math.ceil(preview.getBoundingClientRect().width),
          canvasWidth: Math.ceil(canvas.getBoundingClientRect().width),
          canvasBufferWidth: canvas.width
        };
      });

      assert.equal(dimensions.documentWidth <= dimensions.viewportWidth, true);
      assert.equal(dimensions.previewWidth <= dimensions.viewportWidth, true);
      assert.equal(dimensions.canvasWidth <= dimensions.viewportWidth, true);
      assert.equal(dimensions.canvasBufferWidth <= dimensions.viewportWidth, true);
    }

    await assertNoHorizontalOverflow();
    await page.setViewportSize({ width: 320, height: 900 });
    await page.waitForTimeout(100);
    await assertNoHorizontalOverflow();

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('main focus outline is only shown from the skip link', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#main-content').focus();
    assert.equal(await page.locator('#main-content').evaluate((element) => {
      return window.getComputedStyle(element).outlineStyle;
    }), 'none');

    await page.goto(server.url, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('skip-link')), true);
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#main-content').evaluate((element) => {
      return window.getComputedStyle(element).outlineStyle;
    }), 'solid');

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('theme toggle remembers the user preference', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.localStorage.setItem('colorcontrast-theme', 'dark');
    });
    await page.goto(server.url, { waitUntil: 'networkidle' });

    assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'dark');
    assert.equal(await page.locator('#theme-toggle').getAttribute('aria-label'), 'Dark mode');
    assert.equal(await page.locator('#theme-toggle').getAttribute('aria-pressed'), 'true');

    await page.locator('#theme-toggle').click();
    assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'light');
    assert.equal(await page.evaluate(() => window.localStorage.getItem('colorcontrast-theme')), 'light');
    assert.equal(await page.locator('#theme-toggle').getAttribute('aria-label'), 'Dark mode');
    assert.equal(await page.locator('#theme-toggle').getAttribute('aria-pressed'), 'false');

    await page.locator('label[for="theme-toggle"]').click();
    assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'dark');
    assert.equal(await page.locator('#theme-toggle').getAttribute('aria-pressed'), 'true');

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

async function documentLanguage(page) {
  return page.evaluate(() => document.documentElement.lang);
}

async function createImageDataTransfer(page) {
  return page.evaluateHandle(async () => {
    const response = await fetch('/img/social-card.png');
    const bytes = await response.arrayBuffer();
    const file = new File([bytes], 'dropped-social-card.png', { type: 'image/png' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    return dataTransfer;
  });
}
