const path = require('path');
const base = require('@playwright/test');

function kebab(str) {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .replace(/(\d)([a-zA-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Custom test fixtures that provide `legacySnap` — a function that takes
 * a screenshot buffer and matches it against a snapshot file using the old
 * jest-image-snapshot naming convention:
 *   {kebab-filename}-{kebab-testpath}-{counter}-snap.png
 *
 * Usage:
 *   const { test, expect } = require('../../legacyFixtures');
 *   test('Title', async ({ page, legacySnap }) => {
 *     const image = await page.screenshot();
 *     legacySnap(image);
 *   });
 */
const test = base.test.extend({
  // eslint-disable-next-line no-empty-pattern
  legacySnap: async ({}, use, testInfo) => {
    let counter = 0;
    const fn = kebab(path.basename(testInfo.file));
    const tn = testInfo.titlePath.slice(1).map(s => kebab(s)).join('-');
    const snap = (image) => {
      counter += 1;
      const name = `${fn}-${tn}-${counter}-snap.png`;
      base.expect(image).toMatchSnapshot({ name });
    };
    await use(snap);
  },
});

module.exports = { test, expect: base.expect };
