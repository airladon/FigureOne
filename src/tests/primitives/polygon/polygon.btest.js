// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');
// const playwright = require('playwright');

expect.extend({ toMatchImageSnapshot });

jest.setTimeout(60000);
test('Primitives: polygons', async () => {
  // const browser = await playwright.chromium.launch();
  // const context = await browser.newContext();
  // const page = await context.newPage();
  // eslint-disable-next-line no-undef
  await page.goto(`file:/${__dirname}/index.html`);
  // eslint-disable-next-line no-undef
  const image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
  // await browser.close();
});
