import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { test } from 'node:test';

const appFiles = [
  'app/index.php',
  'app/js/app.js',
  'app/js/canvas.js',
  'app/js/color.js',
  'app/js/contrast.js',
  'app/js/i18n.js',
  'app/js/image.js',
  'app/js/pwa.js',
  'app/js/toolbar.js',
  'app/js/util.js'
];

async function readSource(path) {
  return readFile(path, 'utf8');
}

async function readAllAppSource() {
  return Promise.all(appFiles.map(readSource));
}

function evaluateDeclarations(source, startMarker, endMarker, expression) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);

  assert.notEqual(start, -1, `Could not find ${startMarker}`);
  assert.notEqual(end, -1, `Could not find ${endMarker}`);

  return vm.runInNewContext(`${source.slice(start, end)}\n${expression}`);
}

async function getInterfaceTranslations() {
  const source = await readSource('app/js/i18n.js');

  return evaluateDeclarations(
    source,
    'var languages = ',
    'function getTranslation',
    '({ languages, translations, localizedTranslationUpdates });'
  );
}

async function getColorTranslations() {
  const source = await readSource('app/js/color.js');

  return evaluateDeclarations(
    source,
    'var COLOR_NAME_RANGES = ',
    'function colorNameLanguage',
    '({ COLOR_NAME_RANGES, COLOR_NAME_TRANSLATIONS });'
  );
}

function assertSameKeys(actual, expected, context) {
  const missing = expected.filter((key) => !Object.hasOwn(actual, key));
  const extra = [...Object.keys(actual)].filter((key) => !expected.includes(key));

  assert.deepEqual(missing, [], `${context} is missing translation keys`);
  assert.deepEqual(extra, [], `${context} has unknown translation keys`);
}

function placeholderTokens(value) {
  return [...value.matchAll(/\{[a-z][a-z0-9]*\}/gi)].map((match) => match[0]).sort();
}

function assertTranslatedValues(translations, keys, context, options = {}) {
  const { disallowKeyFallback = true } = options;

  for (const key of keys) {
    const value = translations[key];

    assert.equal(typeof value, 'string', `${context}.${key} must be a string`);
    assert.notEqual(value.trim(), '', `${context}.${key} must not be empty`);

    if (disallowKeyFallback) {
      assert.notEqual(value, key, `${context}.${key} must not fall back to the key name`);
    }
  }
}

function assertMatchingPlaceholders(actual, expected, keys, context) {
  for (const key of keys) {
    assert.deepEqual(
      placeholderTokens(actual[key]),
      placeholderTokens(expected[key]),
      `${context}.${key} must keep the same placeholder tokens as English`
    );
  }
}

function collectReferencedInterfaceKeys(sources) {
  const patterns = [
    /\bdata-i18n(?:-(?:value|label|aria-label|file-empty|placeholder))?="([^"]+)"/g,
    /\b(?:translate|getTranslation)\('([^']+)'\)/g
  ];
  const keys = new Set();

  for (const source of sources) {
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        keys.add(match[1]);
      }
    }
  }

  return [...keys].sort();
}

test('all interface translation keys are present for every supported language', async () => {
  const { languages, translations } = await getInterfaceTranslations();
  const expectedCodes = languages.map((language) => language.code);
  const englishKeys = [...Object.keys(translations.en)].sort();

  assert.deepEqual([...Object.keys(translations)].sort(), [...expectedCodes].sort());

  for (const code of expectedCodes) {
    const localeTranslations = translations[code];
    assert.ok(localeTranslations, `${code} must have a translation table`);
    assertSameKeys(localeTranslations, englishKeys, code);
    assertTranslatedValues(localeTranslations, englishKeys, code);
    assertMatchingPlaceholders(localeTranslations, translations.en, englishKeys, code);
  }
});

test('every referenced interface translation key exists in every supported language', async () => {
  const { languages, translations } = await getInterfaceTranslations();
  const referencedKeys = collectReferencedInterfaceKeys(await readAllAppSource());

  assert.notEqual(referencedKeys.length, 0);

  for (const code of languages.map((language) => language.code)) {
    const missing = referencedKeys.filter((key) => !Object.hasOwn(translations[code], key));
    assert.deepEqual(missing, [], `${code} is missing keys referenced by the app`);
  }
});

test('new interface strings are localized instead of copied from English', async () => {
  const { languages, translations, localizedTranslationUpdates } = await getInterfaceTranslations();
  const nonEnglishCodes = languages
    .map((language) => language.code)
    .filter((code) => code !== 'en');

  assert.deepEqual(
    Array.from(Object.keys(localizedTranslationUpdates)).sort(),
    Array.from(nonEnglishCodes).sort()
  );

  for (const code of nonEnglishCodes) {
    for (const key of Object.keys(localizedTranslationUpdates[code])) {
      assert.notEqual(
        translations[code][key],
        translations.en[key],
        `${code}.${key} must be localized, not copied from English`
      );
    }
  }
});

test('all status color names are translated for every supported language', async () => {
  const { languages } = await getInterfaceTranslations();
  const { COLOR_NAME_RANGES, COLOR_NAME_TRANSLATIONS } = await getColorTranslations();
  const expectedCodes = languages.map((language) => language.code);
  const englishKeys = [...Object.keys(COLOR_NAME_TRANSLATIONS.en)].sort();
  const rangedColorKeys = [...new Set(COLOR_NAME_RANGES.map((range) => range.name))].sort();

  assert.deepEqual([...Object.keys(COLOR_NAME_TRANSLATIONS)].sort(), [...expectedCodes].sort());

  for (const code of expectedCodes) {
    const localeTranslations = COLOR_NAME_TRANSLATIONS[code];
    assert.ok(localeTranslations, `${code} must have a color-name translation table`);
    assertSameKeys(localeTranslations, englishKeys, `${code} color names`);
    assertTranslatedValues(localeTranslations, englishKeys, `${code} color names`, {
      disallowKeyFallback: false
    });
  }

  for (const colorKey of rangedColorKeys) {
    assert.ok(
      Object.hasOwn(COLOR_NAME_TRANSLATIONS.en, colorKey),
      `Color range "${colorKey}" must have a localized color name`
    );
  }
});
