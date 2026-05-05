import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  assert.equal(result.status, 0, [result.stdout, result.stderr].join('\n'));
}

test('built HTML is valid', () => {
  run('npm', ['run', 'build']);
  run('node', ['node_modules/html-validate/bin/html-validate.mjs', 'dist/index.html']);
});
