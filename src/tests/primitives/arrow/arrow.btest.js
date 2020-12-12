// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(60000);
test('Primitives: Arrow', async () => {
  // eslint-disable-next-line no-undef
  await page.goto(`file:/${__dirname}/index.html`);
  // await page.screenshot({ fullPage: true, type: 'jpeg', path: `${__dirname}/1.jpeg` });
  // eslint-disable-next-line no-undef
  const image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
});
