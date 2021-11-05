// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

test('Primitives: Text', async () => {
  console.log(`http://localhost:8080/${__dirname.replace('/home/pwusr/', '')}/index.html`)
  // eslint-disable-next-line no-undef
  await page.goto(`http://localhost:8080/${__dirname.replace('/home/pwusr/', '')}/index.html`);
  // eslint-disable-next-line no-undef
  const image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
});
