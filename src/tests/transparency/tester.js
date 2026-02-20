/* eslint-disable import/prefer-default-export, global-require */
/* eslint-disable import/no-dynamic-require, no-eval */
/* eslint-disable no-await-in-loop */

const { test, expect } = require('@playwright/test');

function tester(htmlFile, title, threshold = 0, width = 500, height = 500) {
  let file = `file:/${htmlFile}`;
  if (htmlFile.startsWith('http')) {
    file = htmlFile;
  }
  // eslint-disable-next-line playwright/valid-title
  test.describe(title, () => {
    test('transparency', async ({ page }) => {
      page.on('console', async (msg) => {
        const msgType = msg.type();
        const args = await Promise.all(msg.args().map(jsHandle => jsHandle.jsonValue()));
        if (msgType !== 'warning') {
          // eslint-disable-next-line no-console
          console[msgType](...args);
        }
      });
      await page.setViewportSize({ width, height });
      await page.goto(file);
      const image = await page.screenshot();
      expect(image).toMatchSnapshot({
        name: `${title}-chromium.png`,
        maxDiffPixels: threshold,
      });
    });
  });
}


module.exports = {
  tester,
};
