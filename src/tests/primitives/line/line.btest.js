const { test } = require('../../legacyFixtures');

test('Primitives: Line', async ({ page, legacySnap }) => {
  await page.goto(`file://${__dirname}/index.html`);
  const image = await page.screenshot({ fullPage: true });
  legacySnap(image);
});
