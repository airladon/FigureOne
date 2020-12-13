/* global page */
/* eslint-disable jest/no-export */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

function browserStaticTester(title, file) {
  jest.setTimeout(60000);
  test(title, async () => {
    await page.goto(file);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot();
  });
}

module.exports = {
  browserStaticTester,
};
