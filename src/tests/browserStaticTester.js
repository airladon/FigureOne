/* global page */
/* eslint-disable jest/no-export */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const failures = [];
page.on('console', (msg) => {
  for (let i = 0; i < msg.args().length; i += 1) {
    const result = `${msg.args()[i]}`;
    if (result.startsWith('JSHandle@fail')) {
      failures.push(result);
    }
  }
});

function browserStaticTester(title, file) {
  jest.setTimeout(60000);
  test(title, async () => {
    await page.goto(file);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot();
    expect(failures).toEqual([]);
  });
}

module.exports = {
  browserStaticTester,
};
