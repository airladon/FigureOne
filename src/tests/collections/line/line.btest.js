// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(60000);
test('Collections: Line', async () => {
  // eslint-disable-next-line no-undef
  await page.goto(`file:/${__dirname}/index.html`);
  // eslint-disable-next-line no-undef
  const image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
});
