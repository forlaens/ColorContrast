import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';

function formatBytes(value) {
  if (value < 1024) return `${value} bytes`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

const jsFile = resolve('dist/js/app.bundle.js');
const cssFile = resolve('app/css/style.css');
const mapFile = resolve('dist/js/app.bundle.js.map');

const [jsStat, cssStat, mapStat] = await Promise.all([
  stat(jsFile),
  stat(cssFile),
  stat(mapFile)
]);

console.log(`Bundle size: ${formatBytes(jsStat.size)}`);
console.log(`CSS size: ${formatBytes(cssStat.size)}`);
console.log(`Source map size: ${formatBytes(mapStat.size)}`);
