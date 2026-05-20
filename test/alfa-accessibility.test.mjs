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
  { name: 'home', path: '/' },
  { name: 'accessibility-statement', path: '/#accessibility-statement' }
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
  const server = spawn('php', ['-S', `127.0.0.1:${port}`, '-t', 'dist'], {
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

function formatAlfaFailures(route, audit) {
  const serialised = audit.toJSON();
  const failures = audit.resultAggregates
    .toArray()
    .filter(([, aggregate]) => aggregate.failed > 0)
    .map(([rule, aggregate]) => {
      const ruleName = rule.split('/').pop() ?? rule;
      return `${ruleName}: ${aggregate.failed} failure(s)`;
    });
  const failedOutcomes = serialised.outcomes
    .filter((outcome) => outcome.outcome === 'failed')
    .slice(0, 3)
    .map((outcome) => JSON.stringify(outcome, null, 2));

  return `Expected no Alfa WCAG AAA or best-practice failures on ${route.path}.\n${failures.join('\n')}\n${failedOutcomes.join('\n')}`;
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

    for (const route of renderedRoutes) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto(new URL(route.path, server.url).toString(), { waitUntil: 'networkidle' });

      const document = await page.evaluateHandle(() => window.document);
      const alfaPage = await Playwright.toPage(document);
      const audit = await Audit.run(alfaPage, {
        rules: { include: alfaAAAAndBestPracticeFilter },
        outcomes: { include: Outcomes.failedFilter }
      });

      const failed = audit.resultAggregates.reduce((total, result) => total + result.failed, 0);
      assert.equal(failed, 0, formatAlfaFailures(route, audit));
      await page.close();
    }
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
      const fileLabel = await page.locator('.file-picker-button').textContent();
      const fileName = await page.locator('#selected-file-name').textContent();
      const checkerLabel = await page.locator('#preview_area').getAttribute('aria-label');
      const toolbarLabel = await page.locator('[role="toolbar"]').getAttribute('aria-label');
      const accessibilityTitle = await page.locator('#accessibility-statement-title').textContent();
      assert.equal(await page.locator('#language-switcher').inputValue(), language);
      assert.equal(await documentLanguage(page), language);
      assert.equal((heading || '').trim().length > 0, true);
      assert.equal((fileLabel || '').trim().length > 0, true);
      assert.equal((fileName || '').trim().length > 0, true);
      assert.equal((checkerLabel || '').trim().length > 0, true);
      assert.equal((toolbarLabel || '').trim().length > 0, true);
      assert.equal((accessibilityTitle || '').trim().length > 0, true);
    }

    await page.selectOption('#language-switcher', 'da');
    await page.waitForFunction(() => document.documentElement.lang === 'da');
    await page.waitForFunction(() => document.querySelector('#settings-status').textContent === 'Sprog ændret til Dansk.');
    assert.equal(await page.locator('.file-picker-button').textContent(), 'Vælg fil');
    assert.equal(await page.locator('#selected-file-name').textContent(), 'Ingen fil valgt');
    assert.equal(await page.locator('#preview_area').getAttribute('aria-label'), 'Kontrasttjek');
    assert.equal(await page.locator('[role="toolbar"]').getAttribute('aria-label'), 'Indstillinger for tjek');
    assert.equal(await page.locator('#accessibility-statement-title').textContent(), 'Tilgængelighedserklæring');
    assert.equal(await page.locator('a[href="#accessibility-statement"]').textContent(), 'Tilgængelighedserklæring');
    assert.equal(await page.locator('#simple-contrast-result').getAttribute('aria-label'), 'Kontrastforhold: 17,73:1. Består AAA for almindelig tekst.');
    assert.equal(await page.locator('#simple-contrast-result .simple-contrast-ratio').textContent(), '17,73:1');
    assert.equal(await page.locator('#simple-contrast-result .simple-contrast-message').textContent(), 'Består AAA for almindelig tekst.');
    assert.deepEqual(await page.locator('#simple-contrast-result tbody tr').allTextContents(), [
      'Lille tekst✓Består≥ 4,5:1✓Består≥ 7:1',
      'Stor tekst✓Består≥ 3:1✓Består≥ 4,5:1',
      'Grafik✓Består≥ 3:1—'
    ]);

	    await page.locator('a[href="#accessibility-statement"]').click();
	    await page.waitForFunction(() => window.location.hash === '#accessibility-statement');
	    await page.waitForFunction(() => document.querySelector('#home-view').hidden && !document.querySelector('#accessibility-statement').hidden);
	    assert.equal(await page.locator('#home-view').evaluate((element) => element.hidden), true);
	    assert.equal(await page.locator('#accessibility-statement').evaluate((element) => element.hidden), false);
    assert.equal(await page.title(), 'Tilgængelighedserklæring - Kontrasttjek for farver');

    await page.locator('#accessibility-statement a[href="/"]').click();
    await page.waitForFunction(() => window.location.hash === '' && !document.querySelector('#home-view').hidden);
    assert.equal(await page.locator('#home-view').evaluate((element) => element.hidden), false);
    assert.equal(await page.locator('#accessibility-statement').evaluate((element) => element.hidden), true);

    await page.locator('a[href="#accessibility-statement"]').click();
    await page.waitForFunction(() => window.location.hash === '#accessibility-statement');
    await page.locator('#app-title a').click();
    await page.waitForFunction(() => window.location.hash === '' && !document.querySelector('#home-view').hidden);
    assert.equal(await page.locator('#home-view').evaluate((element) => element.hidden), false);
    assert.equal(await page.locator('#accessibility-statement').evaluate((element) => element.hidden), true);

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('live status text describes hex colors with approximate names', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    assert.deepEqual(await page.evaluate(() => ({
      black: formatColorForStatus('#000000'),
      white: formatColorForStatus('#ffffff'),
      lightRed: formatColorForStatus('#ff6666'),
      darkRed: formatColorForStatus('#660000'),
      rose: formatColorForStatus('#e11d48'),
      teal: formatColorForStatus('#14b8a6'),
      turquoise: formatColorForStatus('#00ced1'),
      silver: formatColorForStatus('#c0c0c0'),
      charcoal: formatColorForStatus('#1f2937'),
      slate: formatColorForStatus('#334155'),
      ivory: formatColorForStatus('#fffff0'),
      cream: formatColorForStatus('#f8ead8'),
      beige: formatColorForStatus('#f5deb3'),
      sand: formatColorForStatus('#e9dcc2'),
      tan: formatColorForStatus('#d8b08c'),
      peach: formatColorForStatus('#f1d2b6'),
      copper: formatColorForStatus('#b87333'),
      chocolate: formatColorForStatus('#381f13'),
      burgundy: formatColorForStatus('#800020'),
      maroon: formatColorForStatus('#5a1717'),
      wine: formatColorForStatus('#4b0f1e'),
      crimson: formatColorForStatus('#dc143c'),
      brown: formatColorForStatus('#8b5a2b'),
      salmon: formatColorForStatus('#e39a8b'),
      coral: formatColorForStatus('#ff7f50'),
      terracotta: formatColorForStatus('#cc451d'),
      rust: formatColorForStatus('#b72f14'),
      brick: formatColorForStatus('#c43a1a'),
      ochre: formatColorForStatus('#d4a017'),
      mustard: formatColorForStatus('#8a6f12'),
      olive: formatColorForStatus('#556b2f'),
      mint: formatColorForStatus('#a8e6cf'),
      forestGreen: formatColorForStatus('#0b3d0b'),
      seaGreen: formatColorForStatus('#2e8b57'),
      navy: formatColorForStatus('#001f3f'),
      lavender: formatColorForStatus('#c7b7ff'),
      lilac: formatColorForStatus('#d8bfd8'),
      mauve: formatColorForStatus('#b784a7'),
      plum: formatColorForStatus('#4b2142')
    })), {
      black: '#000000 (black)',
      white: '#ffffff (white)',
      lightRed: '#ff6666 (light red)',
      darkRed: '#660000 (dark red)',
      rose: '#e11d48 (rose)',
      teal: '#14b8a6 (teal)',
      turquoise: '#00ced1 (turquoise)',
      silver: '#c0c0c0 (silver)',
      charcoal: '#1f2937 (charcoal)',
      slate: '#334155 (slate)',
      ivory: '#fffff0 (ivory)',
      cream: '#f8ead8 (cream)',
      beige: '#f5deb3 (beige)',
      sand: '#e9dcc2 (sand)',
      tan: '#d8b08c (tan)',
      peach: '#f1d2b6 (peach)',
      copper: '#b87333 (copper)',
      chocolate: '#381f13 (chocolate)',
      burgundy: '#800020 (burgundy)',
      maroon: '#5a1717 (maroon)',
      wine: '#4b0f1e (wine)',
      crimson: '#dc143c (crimson)',
      brown: '#8b5a2b (brown)',
      salmon: '#e39a8b (salmon)',
      coral: '#ff7f50 (coral)',
      terracotta: '#cc451d (terracotta)',
      rust: '#b72f14 (rust)',
      brick: '#c43a1a (brick)',
      ochre: '#d4a017 (ochre)',
      mustard: '#8a6f12 (mustard)',
      olive: '#556b2f (olive)',
      mint: '#a8e6cf (mint)',
      forestGreen: '#0b3d0b (forest green)',
      seaGreen: '#2e8b57 (sea green)',
      navy: '#001f3f (navy)',
      lavender: '#c7b7ff (lavender)',
      lilac: '#d8bfd8 (lilac)',
      mauve: '#b784a7 (mauve)',
      plum: '#4b2142 (plum)'
    });

    await page.selectOption('#language-switcher', 'da');
    await page.waitForFunction(() => document.documentElement.lang === 'da');

    assert.deepEqual(await page.evaluate(() => ({
      lightRed: formatColorForStatus('#ff6666'),
      rose: formatColorForStatus('#e11d48'),
      silver: formatColorForStatus('#c0c0c0'),
      charcoal: formatColorForStatus('#1f2937'),
      ivory: formatColorForStatus('#fffff0'),
      peach: formatColorForStatus('#f1d2b6'),
      chocolate: formatColorForStatus('#381f13'),
      crimson: formatColorForStatus('#dc143c'),
      mustard: formatColorForStatus('#8a6f12'),
      mint: formatColorForStatus('#a8e6cf'),
      navy: formatColorForStatus('#001f3f'),
      plum: formatColorForStatus('#4b2142'),
      copper: formatColorForStatus('#b87333'),
      coral: formatColorForStatus('#ff7f50'),
      brick: formatColorForStatus('#c43a1a')
    })), {
      lightRed: '#ff6666 (lys rød)',
      rose: '#e11d48 (rosa)',
      silver: '#c0c0c0 (sølv)',
      charcoal: '#1f2937 (koksgrå)',
      ivory: '#fffff0 (elfenben)',
      peach: '#f1d2b6 (fersken)',
      chocolate: '#381f13 (chokoladebrun)',
      crimson: '#dc143c (karmosinrød)',
      mustard: '#8a6f12 (sennepsgul)',
      mint: '#a8e6cf (mintgrøn)',
      navy: '#001f3f (marineblå)',
      plum: '#4b2142 (blomme)',
      copper: '#b87333 (kobber)',
      coral: '#ff7f50 (koral)',
      brick: '#c43a1a (tegl)'
    });

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

    await page.getByRole('button', { name: 'Load image' }).click();

    assert.equal(await page.locator('#step-2').isVisible(), true);
    assert.equal(await page.locator('#step-1').evaluate((element) => element.hidden), false);
    assert.equal(await page.locator('#step-1').isVisible(), true);
    assert.equal(await page.locator('#intro-panel').isHidden(), true);
    assert.equal(await page.locator('#app-error').evaluate((element) => element.hidden), true);
    assert.equal(await page.locator('#image_preview').evaluate((canvas) => canvas.height), 320);
    await page.waitForFunction(() => document.querySelector('#settings-status').textContent.includes('empty canvas'));
    assert.equal(await page.locator('#settings-status').textContent(), 'Checker opened with an empty canvas. Choose or drop an image to test it.');

    await page.locator('#app-title a').click();
    await page.waitForFunction(() => !document.querySelector('#step-1').hidden && document.querySelector('#step-2').hidden);
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

test('intro heading remains a heading when collapsed', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    assert.equal(await page.locator('#intro-panel').isHidden(), true);
    await page.locator('#image_file').setInputFiles(resolve('dist/img/social-card.png'));
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden && !document.querySelector('#intro-panel').hidden);

    await page.locator('#intro-toggle').click();

    assert.equal(await page.locator('#intro-toggle').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#intro-steps').isHidden(), true);
    assert.equal(await page.getByRole('heading', { name: 'How to use it', level: 2 }).isVisible(), true);

    await page.locator('#intro-toggle').click();
    assert.equal(await page.getByRole('heading', { name: 'Upload an image', level: 3 }).isVisible(), true);
    assert.equal(await page.getByRole('heading', { name: 'Choose the color to check', level: 3 }).isVisible(), true);
    assert.equal(await page.getByRole('heading', { name: 'Run the test', level: 3 }).isVisible(), true);

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('choosing an image opens the checker and keeps the image chooser available', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('#selected-file-name').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(resolve('dist/img/social-card.png'));
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);

    assert.equal(await page.locator('#step-2').isVisible(), true);
    assert.equal(await page.locator('#step-1').evaluate((element) => element.hidden), false);
    assert.equal(await page.locator('#step-1').isVisible(), true);
    assert.equal(await page.locator('#step-1').getAttribute('aria-hidden'), null);
    assert.equal(await page.locator('#intro-panel').isVisible(), true);
    assert.equal(await page.locator('#step-2').evaluate((step2) => Boolean(step2.compareDocumentPosition(document.querySelector('#intro-panel')) & Node.DOCUMENT_POSITION_FOLLOWING)), true);
    assert.equal(await page.locator('#image_preview').evaluate((canvas) => canvas.height > 0), true);
    await page.waitForFunction(() => !document.querySelector('#palette-card').hidden);
    assert.equal(await page.locator('#palette-card').isVisible(), true);
    assert.equal(await page.locator('#step-2').evaluate((step2) => Boolean(step2.compareDocumentPosition(document.querySelector('#palette-card')) & Node.DOCUMENT_POSITION_FOLLOWING)), true);
    assert.equal(await page.locator('#palette-card').evaluate((palette) => Boolean(palette.compareDocumentPosition(document.querySelector('#intro-panel')) & Node.DOCUMENT_POSITION_FOLLOWING)), true);
    assert.equal(await page.locator('.palette-swatch').count() <= 6, true);
    assert.equal(await page.locator('.palette-swatch').count() >= 2, true);
    assert.equal(await page.locator('#palette-matrix table').isVisible(), true);
    assert.match(await page.locator('#palette-summary').textContent(), /^\d+ colors found$/);
    assert.match(await page.locator('#palette-matrix td').first().textContent(), /^(Pass|Fail) \d+(\.\d+)?:1$/);

    await page.locator('#language-switcher').selectOption('no');
    await page.waitForFunction(() => document.querySelector('#palette-summary').textContent.includes('farger funnet'));
    assert.match(await page.locator('#palette-summary').textContent(), /^\d+ farger funnet$/);
    assert.match(await page.locator('#palette-matrix td').first().textContent(), /^(Består|Feiler) \d+(,\d+)?:1$/);

    await page.waitForFunction(() => document.querySelector('#settings-status').textContent.includes('Språk endret'));
    assert.equal(await page.locator('#settings-status').textContent(), 'Språk endret til Norsk.');

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('image chooser loads selected, dropped, pasted, and URL images', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#image_file').setInputFiles(resolve('dist/img/social-card.png'));
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);
    assert.equal(await page.locator('#step-2').isVisible(), true);
    assert.equal(await page.locator('#step-1').isVisible(), true);
    assert.equal(await page.locator('#image-thumbnail').isVisible(), true);
    assert.match(await page.locator('#image-thumbnail').getAttribute('src'), /^blob:/);
    assert.equal(await page.locator('#selected-file-name').textContent(), 'social-card.png');
    assert.equal(await page.locator('#image_url').inputValue(), '');

    const dragData = await createImageDataTransfer(page);
    await page.dispatchEvent('body', 'dragenter', { dataTransfer: dragData });
    assert.equal(await page.locator('body').evaluate((body) => body.classList.contains('is-dragging-image')), true);
    assert.equal(await page.locator('.upload-dropzone').evaluate((dropzone) => dropzone.classList.contains('is-drag-target')), true);
    await page.dispatchEvent('body', 'drop', { dataTransfer: dragData });
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);

    assert.equal(await page.locator('#step-2').isVisible(), true);
    assert.equal(await page.locator('#step-1').isVisible(), true);
    assert.equal(await page.locator('#image_file').evaluate((input) => input.files[0].name), 'dropped-social-card.png');
    assert.equal(await page.locator('#selected-file-name').textContent(), 'dropped-social-card.png');
    assert.match(await page.locator('#image-thumbnail').getAttribute('src'), /^blob:/);
    assert.equal(await page.locator('#image_url').inputValue(), '');

    const secondDragData = await createImageDataTransfer(page);
    await page.dispatchEvent('body', 'drop', { dataTransfer: secondDragData });
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);
    assert.equal(await page.locator('#step-2').isVisible(), true);
    assert.equal(await page.locator('#step-1').isVisible(), true);

    await page.locator('#image_url').fill(`${server.url}/img/social-card.png`);
    await page.getByRole('button', { name: 'Load URL' }).click();
    await page.waitForFunction(() => document.querySelector('#selected-file-name').textContent === 'No file chosen');
    assert.equal(await page.locator('#step-2').isVisible(), true);
    assert.equal(await page.locator('#image_file').evaluate((input) => input.files.length), 0);
    assert.equal(await page.locator('#image-thumbnail').isHidden(), true);
    assert.equal(await page.locator('#image_url').inputValue(), `${server.url}/img/social-card.png`);

    await page.evaluate(async () => {
      const response = await fetch('/img/social-card.png');
      const bytes = await response.arrayBuffer();
      const file = new File([bytes], 'pasted-social-card.png', { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      document.body.dispatchEvent(new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer
      }));
    });
    await page.waitForFunction(() => document.querySelector('#selected-file-name').textContent === 'pasted-social-card.png');
    assert.equal(await page.locator('#step-2').isVisible(), true);
    assert.equal(await page.locator('#image_file').evaluate((input) => input.files[0].name), 'pasted-social-card.png');
    assert.match(await page.locator('#image-thumbnail').getAttribute('src'), /^blob:/);
    assert.equal(await page.locator('#image_url').inputValue(), '');

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('image chooser rejects non-image files with a useful error', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#image_file').setInputFiles({
      name: 'not-an-image.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is not an image.')
    });
    await page.locator('#image_file').dispatchEvent('change');

    assert.equal(await page.locator('#step-1').isVisible(), true);
    assert.equal(await page.locator('#app-error').isVisible(), true);
    assert.equal(await page.locator('#app-error').textContent(), 'Please choose an image file.');
    assert.equal(await page.locator('#image-thumbnail').isHidden(), true);

    await page.locator('#image_url').fill('ftp://example.com/image.png');
    await page.getByRole('button', { name: 'Load URL' }).click();
    assert.equal(await page.locator('#app-error').textContent(), 'Enter a full image URL that starts with http or https.');

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('color picker supports keyboard placement and selection', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#image_file').setInputFiles(resolve('dist/img/social-card.png'));
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);

    await page.locator('#colorpicker').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'image_preview');

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Shift+ArrowDown');
    await page.keyboard.press('Enter');

    const pickerState = await page.evaluate(() => {
      const crosshairs = document.querySelector('#crosshairs');
      const x = Number(crosshairs.getAttribute('data-posx'));
      const y = Number(crosshairs.getAttribute('data-posy'));

      return {
        pressed: document.querySelector('#colorpicker').getAttribute('aria-pressed'),
        x,
        y,
        expected: pixelToHex(getContext(), x, y),
        actual: document.querySelector('[name=color]').value
      };
    });

    assert.equal(pickerState.pressed, 'true');
    assert.deepEqual({ x: pickerState.x, y: pickerState.y }, { x: 21, y: 30 });
    assert.equal(pickerState.actual, pickerState.expected);
    await page.waitForFunction((color) => document.querySelector('#settings-status').textContent.includes(color), pickerState.actual);
    const escapedColor = pickerState.actual.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(await page.locator('#settings-status').textContent(), new RegExp(`^Selected color ${escapedColor} \\(.+\\)\\.$`));

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('checker remembers the last color and conformance level', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('[name=color]').evaluate((input) => {
      input.value = ' # A B C ';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    assert.equal(await page.locator('[name=color]').inputValue(), '#AABBCC');
    assert.equal(await page.locator('#test-color-native').inputValue(), '#aabbcc');

    await page.locator('#test-color-native').evaluate((input) => {
      input.value = '#abcdef';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    assert.equal(await page.locator('[name=color]').inputValue(), '#abcdef');

    await page.locator('[name=color]').evaluate((input) => {
      input.value = 'rgb(51, 102, 153)';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    assert.equal(await page.locator('[name=color]').inputValue(), '#336699');

    await page.locator('[name=color]').evaluate((input) => {
      input.value = 'rebeccapurple';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    assert.equal(await page.locator('[name=color]').inputValue(), '#663399');

    await page.locator('[name=color]').evaluate((input) => {
      input.value = 'NAVY';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    assert.equal(await page.locator('[name=color]').inputValue(), '#000080');

    await page.locator('[name=color]').evaluate((input) => {
      input.value = 'not a color';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    assert.equal(await page.locator('[name=color]').inputValue(), '#000000');
    assert.equal(await page.locator('#test-color-native').inputValue(), '#000000');

    await page.locator('[name=color]').evaluate((input) => {
      input.value = 'rgb(nope, 102, 153)';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    assert.equal(await page.locator('[name=color]').inputValue(), '#000000');

    await page.locator('[name=color]').evaluate((input) => {
      input.value = 'rgb(51, 102, 153)';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.locator('[name=contrast]').evaluate((select) => {
      select.selectedIndex = 4;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    assert.deepEqual(await page.evaluate(() => ({
      color: window.localStorage.getItem('colorcontrast-test-color'),
      level: window.localStorage.getItem('colorcontrast-conformance-level')
    })), {
      color: '#336699',
      level: '4'
    });

    await page.reload({ waitUntil: 'networkidle' });

    assert.deepEqual(await page.evaluate(() => ({
      color: document.querySelector('[name=color]').value,
      selectedIndex: document.querySelector('[name=contrast]').selectedIndex,
      selectedText: document.querySelector('[name=contrast]').selectedOptions[0].textContent.trim()
    })), {
      color: '#336699',
      selectedIndex: 4,
      selectedText: 'Small text (7:1)'
    });

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('contrast rendering changes the canvas and reset restores the source image', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#image_file').setInputFiles(resolve('dist/img/social-card.png'));
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);

    const originalCanvas = await page.locator('#image_preview').evaluate((canvas) => canvas.toDataURL());
    await page.locator('[name=color]').evaluate((input) => {
      input.value = '#ffffff';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('[name=contrast]').selectOption('7');
    await page.getByRole('button', { name: 'Run test' }).click();
    await page.waitForFunction(() => !document.querySelector('#reset-image').hidden);

    const highlightedCanvas = await page.locator('#image_preview').evaluate((canvas) => canvas.toDataURL());
    assert.notEqual(highlightedCanvas, originalCanvas);
    assert.equal(await page.locator('#reset-image').isVisible(), true);
    assert.match(await page.locator('#checker-result').textContent(), /^Test complete\. About [\d.]+ percent of the preview does not meet small text \(7:1\) for #ffffff \(white\)\. Those areas are highlighted with the selected color\./);
    assert.equal(await page.locator('#checker-result').textContent(), await page.locator('#settings-status').textContent());

    await page.locator('[name=contrast]').selectOption({ label: 'Large text (3:1)' });
    await page.getByRole('button', { name: 'Run test' }).click();
    await page.waitForFunction(() => document.querySelector('#checker-result').textContent.includes('large text (3:1)'));
    assert.match(await page.locator('#checker-result').textContent(), /does not meet large text \(3:1\) for #ffffff \(white\)\./);

    await page.locator('#reset-image').click();
    const resetCanvas = await page.locator('#image_preview').evaluate((canvas) => canvas.toDataURL());
    assert.equal(resetCanvas, originalCanvas);
    assert.equal(await page.locator('#reset-image').isHidden(), true);
    assert.equal(await page.locator('#checker-result').textContent(), '');
    await page.waitForFunction(() => document.querySelector('#settings-status').textContent.includes('Image reset'));
    assert.equal(await page.locator('#settings-status').textContent(), 'Image reset. Contrast highlights removed.');

    await page.getByRole('button', { name: 'Run test' }).click();
    await page.waitForFunction(() => !document.querySelector('#reset-image').hidden);
    assert.notEqual(await page.locator('#image_preview').evaluate((canvas) => canvas.toDataURL()), originalCanvas);

    const dragData = await createImageDataTransfer(page);
    await page.dispatchEvent('body', 'drop', { dataTransfer: dragData });
    await page.waitForFunction(() => document.querySelector('#settings-status').textContent.includes('Loaded dropped-social-card.png'));

    assert.equal(await page.locator('#step-2').isVisible(), true);
    assert.equal(await page.locator('#reset-image').isHidden(), true);
    assert.equal(await page.locator('#checker-result').textContent(), '');
    assert.equal(await page.locator('#image_preview').evaluate((canvas) => canvas.toDataURL()), originalCanvas);

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('image preview supports zoom and only shows pan controls when the image overflows', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 640, height: 720 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#image_file').setInputFiles(resolve('dist/img/social-card.png'));
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);

    const initialState = await page.evaluate(() => {
      const viewport = document.querySelector('#preview-viewport');
      const canvas = document.querySelector('#image_preview');

      return {
        panHidden: document.querySelector('#pan-controls').hidden,
        handPressed: document.querySelector('#hand-tool').getAttribute('aria-pressed'),
        handDisabled: document.querySelector('#hand-tool').disabled,
        handVisibility: getComputedStyle(document.querySelector('#hand-tool')).visibility,
        viewportName: viewport.getAttribute('aria-label'),
        describedBy: canvas.getAttribute('aria-describedby'),
        zoom: document.querySelector('#zoom-output').textContent.trim(),
        canvasWidth: canvas.width,
        canvasCssWidth: Math.round(canvas.getBoundingClientRect().width),
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth
      };
    });

    assert.equal(initialState.panHidden, true);
    assert.equal(initialState.handPressed, 'false');
    assert.equal(initialState.handDisabled, true);
    assert.equal(initialState.handVisibility, 'hidden');
    assert.equal(initialState.viewportName, 'Zoomable image preview');
    assert.equal(initialState.describedBy, 'preview-help');
    assert.match(initialState.zoom, /%$/);
    assert.equal(initialState.canvasWidth, initialState.canvasCssWidth);
    assert.equal(initialState.documentWidth <= initialState.viewportWidth, true);

    await page.getByRole('button', { name: 'Zoom in' }).click();

    const zoomedState = await page.evaluate(() => {
      const viewport = document.querySelector('#preview-viewport');
      const canvas = document.querySelector('#image_preview');

      return {
        panHidden: document.querySelector('#pan-controls').hidden,
        panLabel: document.querySelector('#pan-controls').getAttribute('aria-label'),
        handLabel: document.querySelector('#hand-tool').getAttribute('aria-label'),
        handPressed: document.querySelector('#hand-tool').getAttribute('aria-pressed'),
        handDisabled: document.querySelector('#hand-tool').disabled,
        handVisibility: getComputedStyle(document.querySelector('#hand-tool')).visibility,
        visiblePanDirections: Array.from(document.querySelectorAll('[data-pan-direction]'))
          .filter((button) => !button.hidden)
          .map((button) => button.getAttribute('data-pan-direction')),
        zoom: document.querySelector('#zoom-output').textContent.trim(),
        scrollWidth: viewport.scrollWidth,
        clientWidth: viewport.clientWidth,
        scrollHeight: viewport.scrollHeight,
        clientHeight: viewport.clientHeight,
        canvasWidth: canvas.width,
        canvasCssWidth: Math.round(canvas.getBoundingClientRect().width),
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth
      };
    });

    assert.equal(zoomedState.panHidden, false);
    assert.equal(zoomedState.panLabel, 'Pan image');
    assert.equal(zoomedState.handLabel, 'Drag image');
    assert.equal(zoomedState.handPressed, 'false');
    assert.equal(zoomedState.handDisabled, false);
    assert.equal(zoomedState.handVisibility, 'visible');
    assert.equal(zoomedState.visiblePanDirections.includes('right'), true);
    assert.equal(zoomedState.visiblePanDirections.includes('left'), false);
    assert.equal(zoomedState.visiblePanDirections.includes('up'), false);
    assert.notEqual(zoomedState.zoom, initialState.zoom);
    assert.equal(zoomedState.scrollWidth > zoomedState.clientWidth || zoomedState.scrollHeight > zoomedState.clientHeight, true);
    assert.equal(zoomedState.canvasWidth, zoomedState.canvasCssWidth);
    assert.equal(zoomedState.documentWidth <= zoomedState.viewportWidth, true);
    await page.waitForFunction(() => document.querySelector('#settings-status').textContent.includes('visible'));
    assert.match(await page.locator('#settings-status').textContent(), /^Zoom \d+%\. About \d+% visible\. Can scroll right\.$/);

    await page.getByRole('button', { name: 'Drag image' }).click();

    const initialHandState = await page.evaluate(() => ({
      handPressed: document.querySelector('#hand-tool').getAttribute('aria-pressed'),
      handMode: document.querySelector('#preview-viewport').classList.contains('is-hand-tool'),
      pickerPressed: document.querySelector('#colorpicker').getAttribute('aria-pressed')
    }));

    assert.equal(initialHandState.handPressed, 'true');
    assert.equal(initialHandState.handMode, true);
    assert.equal(initialHandState.pickerPressed, 'false');

    await page.getByRole('button', { name: 'Pick a color from the image' }).click();

    const pickerModeState = await page.evaluate(() => ({
      handPressed: document.querySelector('#hand-tool').getAttribute('aria-pressed'),
      handMode: document.querySelector('#preview-viewport').classList.contains('is-hand-tool'),
      pickerPressed: document.querySelector('#colorpicker').getAttribute('aria-pressed'),
      pickerMode: document.querySelector('#preview-viewport').classList.contains('is-color-picker')
    }));

    assert.equal(pickerModeState.handPressed, 'false');
    assert.equal(pickerModeState.handMode, false);
    assert.equal(pickerModeState.pickerPressed, 'true');
    assert.equal(pickerModeState.pickerMode, true);

    await page.getByRole('button', { name: 'Drag image' }).click();

    const pressedHandState = await page.evaluate(() => ({
      handPressed: document.querySelector('#hand-tool').getAttribute('aria-pressed'),
      handMode: document.querySelector('#preview-viewport').classList.contains('is-hand-tool')
    }));

    assert.equal(pressedHandState.handPressed, 'true');
    assert.equal(pressedHandState.handMode, true);

    const viewportBox = await page.locator('#preview-viewport').boundingBox();
    await page.mouse.move(viewportBox.x + viewportBox.width / 2, viewportBox.y + viewportBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(viewportBox.x + viewportBox.width / 2 - 140, viewportBox.y + viewportBox.height / 2);
    await page.mouse.up();
    await page.waitForFunction(() => document.querySelector('#preview-viewport').scrollLeft > 0);

    await page.evaluate(() => {
      document.querySelector('#preview-viewport').scrollLeft = 0;
    });

    await page.getByRole('button', { name: 'Pan right' }).click();
    await page.waitForFunction(() => document.querySelector('#preview-viewport').scrollLeft > 0);
    await page.waitForFunction(() => document.querySelector('#settings-status').textContent.startsWith('Moved image.'));
    assert.match(await page.locator('#settings-status').textContent(), /^Moved image\. Can scroll .+\.$/);

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('tall images fit the initial canvas viewport without scrolling', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 900, height: 720 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#image_file').setInputFiles({
      name: 'tall-preview.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="1600"><rect width="400" height="1600" fill="#ffffff"/><rect y="600" width="400" height="400" fill="#111111"/></svg>')
    });
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);

    const previewState = await page.evaluate(() => {
      const viewport = document.querySelector('#preview-viewport');
      const canvas = document.querySelector('#image_preview');
      const viewportRect = viewport.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();

      return {
        panHidden: document.querySelector('#pan-controls').hidden,
        scrollHeight: viewport.scrollHeight,
        clientHeight: viewport.clientHeight,
        scrollWidth: viewport.scrollWidth,
        clientWidth: viewport.clientWidth,
        canvasCssHeight: Math.round(canvas.getBoundingClientRect().height),
        viewportCssHeight: Math.round(viewport.getBoundingClientRect().height),
        canvasCenter: Math.round(canvasRect.left + (canvasRect.width / 2)),
        viewportCenter: Math.round(viewportRect.left + (viewportRect.width / 2))
      };
    });

    assert.equal(previewState.panHidden, true);
    assert.equal(previewState.scrollHeight <= previewState.clientHeight + 1, true);
    assert.equal(previewState.scrollWidth <= previewState.clientWidth + 1, true);
    assert.equal(previewState.canvasCssHeight <= previewState.viewportCssHeight + 1, true);
    assert.equal(Math.abs(previewState.canvasCenter - previewState.viewportCenter) <= 1, true);

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('zooming keeps active contrast highlights until the image is reset', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 640, height: 720 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#image_file').setInputFiles(resolve('dist/img/social-card.png'));
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);

    const originalCanvas = await page.locator('#image_preview').evaluate((canvas) => canvas.toDataURL());
    await page.locator('[name=color]').evaluate((input) => {
      input.value = '#ffffff';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('[name=contrast]').selectOption('7');
    await page.getByRole('button', { name: 'Run test' }).click();
    await page.waitForFunction(() => !document.querySelector('#reset-image').hidden);

    const resultBeforeZoom = await page.locator('#checker-result').textContent();
    const highlightedCanvas = await page.locator('#image_preview').evaluate((canvas) => canvas.toDataURL());
    assert.notEqual(highlightedCanvas, originalCanvas);

    await page.getByRole('button', { name: 'Zoom in' }).click();
    await page.waitForFunction(() => document.querySelector('#settings-status').textContent.includes('Zoom'));

    assert.equal(await page.locator('#reset-image').isVisible(), true);
    assert.equal(await page.locator('#checker-result').textContent(), resultBeforeZoom);
    assert.notEqual(await page.locator('#image_preview').evaluate((canvas) => canvas.toDataURL()), originalCanvas);

    await page.locator('#reset-image').click();
    assert.equal(await page.locator('#reset-image').isHidden(), true);
    assert.equal(await page.locator('#checker-result').textContent(), '');

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.stop();
  }
});

test('small images expand to the full preview width before zooming', async () => {
  buildApp();

  const server = await startStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 900, height: 720 } });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });

    await page.locator('#image_file').setInputFiles({
      name: 'small-preview.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><rect width="120" height="60" fill="#ffffff"/><circle cx="30" cy="30" r="20" fill="#222222"/></svg>')
    });
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);

    const previewState = await page.evaluate(() => {
      const stage = document.querySelector('#step-2');
      const stageStyles = window.getComputedStyle(stage);
      const stageContentWidth = Math.round(
        stage.getBoundingClientRect().width -
        parseFloat(stageStyles.paddingLeft) -
        parseFloat(stageStyles.paddingRight)
      );
      const checker = document.querySelector('#preview_area');
      const viewport = document.querySelector('#preview-viewport');
      const canvas = document.querySelector('#image_preview');

      return {
        stageContentWidth,
        checkerWidth: Math.round(checker.getBoundingClientRect().width),
        viewportWidth: viewport.clientWidth,
        canvasCssWidth: Math.round(canvas.getBoundingClientRect().width),
        canvasWidth: canvas.width,
        zoomPercent: parseInt(document.querySelector('#zoom-output').textContent, 10)
      };
    });

    assert.equal(Math.abs(previewState.checkerWidth - previewState.stageContentWidth) <= 2, true);
    assert.equal(previewState.canvasCssWidth, previewState.viewportWidth);
    assert.equal(previewState.canvasWidth, previewState.canvasCssWidth);
    assert.equal(previewState.zoomPercent > 100, true);

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

    await page.locator('#image_file').setInputFiles(resolve('dist/img/social-card.png'));
    await page.waitForFunction(() => !document.querySelector('#step-2').hidden);

    async function assertNoHorizontalOverflow() {
      const dimensions = await page.evaluate(() => {
        const preview = document.querySelector('#preview_area');
        const viewport = document.querySelector('#preview-viewport');
        const canvas = document.querySelector('#image_preview');
        return {
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          previewWidth: Math.ceil(preview.getBoundingClientRect().width),
          scrollViewportWidth: Math.ceil(viewport.getBoundingClientRect().width),
          canvasWidth: Math.ceil(canvas.getBoundingClientRect().width),
          canvasBufferWidth: canvas.width,
          panControlsHidden: document.querySelector('#pan-controls').hidden
        };
      });

      assert.equal(dimensions.documentWidth <= dimensions.viewportWidth, true);
      assert.equal(dimensions.previewWidth <= dimensions.viewportWidth, true);
      assert.equal(dimensions.scrollViewportWidth <= dimensions.viewportWidth, true);
      assert.equal(dimensions.canvasWidth <= dimensions.scrollViewportWidth, true);
      assert.equal(dimensions.canvasBufferWidth <= dimensions.scrollViewportWidth, true);
      assert.equal(dimensions.panControlsHidden, true);
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
    await page.locator('#simple-contrast').focus();
    assert.equal(await page.locator('#simple-contrast').evaluate((element) => {
      return window.getComputedStyle(element).outlineStyle;
    }), 'none');
    await page.goto(`${server.url}#accessibility-statement`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.activeElement.id === 'accessibility-statement');
    assert.equal(await page.locator('#accessibility-statement').evaluate((element) => {
      return window.getComputedStyle(element).outlineStyle;
    }), 'none');

    await page.goto(server.url, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('skip-link')), true);
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#main-content').evaluate((element) => {
      return window.getComputedStyle(element).outlineStyle;
    }), 'solid');
    await page.locator('#simple-foreground').focus();
    await page.locator('#main-content').focus();
    assert.equal(await page.locator('#main-content').evaluate((element) => {
      return window.getComputedStyle(element).outlineStyle;
    }), 'none');

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
    await page.waitForFunction(() => document.querySelector('#settings-status').textContent === 'Theme changed to Light mode.');

    await page.locator('label[for="theme-toggle"]').click();
    assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'dark');
    assert.equal(await page.locator('#theme-toggle').getAttribute('aria-pressed'), 'true');
    await page.waitForFunction(() => document.querySelector('#settings-status').textContent === 'Theme changed to Dark mode.');

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
