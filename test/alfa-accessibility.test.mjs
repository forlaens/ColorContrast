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
      assert.equal(await page.locator('#language-switcher').inputValue(), language);
      assert.equal(await documentLanguage(page), language);
      assert.equal((heading || '').trim().length > 0, true);
    }

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

async function documentLanguage(page) {
  return page.evaluate(() => document.documentElement.lang);
}
