import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { analyzeMetafile } from 'esbuild';

const metaPath = resolve('dist/js/app.bundle.meta.json');
const meta = JSON.parse(await readFile(metaPath, 'utf8'));

const analysis = await analyzeMetafile(meta, {
  verbose: true
});

console.log(analysis);
