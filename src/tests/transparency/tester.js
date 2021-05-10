/* global page */
/* eslint-disable import/prefer-default-export, global-require */
/* eslint-disable import/no-dynamic-require, no-eval */
/* eslint-disable jest/no-export, no-await-in-loop */

// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');
// const playwright = require('playwright');

expect.extend({ toMatchImageSnapshot });

page.on('console', async (msg) => {
  const msgType = msg.type();
  const args = await Promise.all(msg.args().map(jsHandle => jsHandle.jsonValue()));
  // eslint-disable-next-line no-console
  console[msgType](...args);
});


// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

function tester(htmlFile, title, threshold = 0, width = 500, height = 500) {
  jest.setTimeout(120000);

  let file = `file:/${htmlFile}`;
  if (htmlFile.startsWith('http')) {
    file = htmlFile;
  }
  // eslint-disable-next-line jest/valid-title
  describe(title, () => {
    test('transparency', async () => {
      await page.setViewportSize({ width, height });
      await page.goto(file);
      const image = await page.screenshot();
      expect(image).toMatchImageSnapshot({
        customSnapshotIdentifier: `${title}-chromium`,
        failureThreshold: threshold,
      });
    });
  });
}


module.exports = {
  tester,
};

