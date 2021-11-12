// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

test('Primitives: TextLines', async () => {
  // eslint-disable-next-line no-undef
  await page.goto(`file://${__dirname}/index.html`);
  // eslint-disable-next-line no-undef
  const image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
});
