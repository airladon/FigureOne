const { test } = require('../../legacyFixtures');

test('Primitives: Text GL', async ({ page, legacySnap }) => {
  await page.goto(`http://localhost:8080${__dirname.replace('/home/pwuser', '')}/index.html`);
  const image = await page.screenshot({ fullPage: true });
  legacySnap(image);
});


test('Primitives: Text 2D', async ({ page, legacySnap }) => {
  await page.goto(`http://localhost:8080${__dirname.replace('/home/pwuser', '')}/index2d.html`);
  const image = await page.screenshot({ fullPage: true });
  legacySnap(image);
});
