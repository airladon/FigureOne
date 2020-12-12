/* global page */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(60000);
test('Collections: Line', async () => {
  await page.goto(`file:/${__dirname}/index.html`);
  const image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
});
