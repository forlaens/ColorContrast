import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { build as esbuild } from 'esbuild';

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
const scriptFiles = [
  'util.js',
  'i18n.js',
  'app.js',
  'canvas.js',
  'toolbar.js',
  'image.js',
  'contrast.js',
  'color.js',
  'pwa.js'
];

// Production deploys are static. The build renders PHP once, inlines CSS,
// bundles the small plain-JS modules, and leaves deployable assets in dist/.
async function inlineStyles(html) {
  const css = await readFile(resolve('app/css/style.css'), 'utf8');

  return html.replace(
    '<link href="/css/style.css" rel="stylesheet">',
    `<style>\n${css}\n\t</style>`
  );
}

async function bundleScripts(html) {
  const bundle = await Promise.all(scriptFiles.map(async (file) => {
    const code = await readFile(resolve('app/js', file), 'utf8');
    return `/* ${file} */\n${code.trim()}\n`;
  }));

  const bundledSource = bundle.join('\n');

  const result = await esbuild({
    stdin: {
      contents: bundledSource,
      resolveDir: resolve('app/js'),
      sourcefile: 'app.bundle.js',
      loader: 'js'
    },
    bundle: false,
    minify: true,
    sourcemap: true,
    metafile: true,
    outfile: resolve(distDir, 'js/app.bundle.js')
  });

  await writeFile(resolve(distDir, 'js/app.bundle.meta.json'), JSON.stringify(result.metafile, null, 2));

  return html.replace(
    /(?:\n\t<script src="\/js\/[^"]+" defer><\/script>)+/,
    '\n\t<script src="/js/app.bundle.js" defer></script>'
  );
}

async function optimizeServiceWorker() {
  const serviceWorkerPath = resolve(distDir, 'sw.js');
  const serviceWorker = await readFile(serviceWorkerPath, 'utf8');
  const optimized = serviceWorker
    .replace('/css/style.css', '/js/app.bundle.js')
    .replace(/,\n\t'\/js\/(?:app|canvas|color|contrast|i18n|image|pwa|toolbar|util)\.js'/g, '');

  await writeFile(serviceWorkerPath, optimized);
}

async function removeUnbundledScripts() {
  const jsDir = resolve(distDir, 'js');
  const files = await readdir(jsDir);

  await Promise.all(files
    .filter((file) => file.endsWith('.js') && file !== 'app.bundle.js')
    .map((file) => rm(resolve(jsDir, file), { force: true })));
}

async function removeUnusedReleaseImages() {
  await Promise.all([
    rm(resolve(distDir, 'img/steps/step-1-upload.png'), { force: true }),
    rm(resolve(distDir, 'img/steps/step-2-pick-color.png'), { force: true }),
    rm(resolve(distDir, 'img/steps/step-3-result.png'), { force: true })
  ]);
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const path of ['backup', 'css', 'img', 'js', '.htaccess', 'manifest.webmanifest', 'sw.js']) {
  await cp(resolve('app', path), resolve(distDir, path), {
    recursive: true,
    verbatimSymlinks: true
  });
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

let html = await inlineStyles(rendered.stdout);
html = await bundleScripts(html);

await optimizeServiceWorker();
await removeUnbundledScripts();
await removeUnusedReleaseImages();
await writeFile(resolve(distDir, 'index.html'), html);

console.log('Built static app into dist.');
