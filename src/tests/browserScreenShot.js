/* global figure testCases, runTestCase */
/* eslint-disable no-await-in-loop */
const { test } = require('@playwright/test');
const { matchSnapshot } = require('./snapshotHelper');

function browserScreenShot(title, file, testCase = '', duration = 0, step = 1) {
  // Capture caller's file from stack trace (called at module level in .btest.js)
  const callerFile = new Error().stack.split('\n')
    .map(l => l.match(/\((.+\.btest\.js):\d+:\d+\)/))
    .filter(Boolean).map(m => m[1])[0];

  function delay(time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  const testCaseName = typeof testCase === 'string' ? testCase : testCase.join(' > ');
  const fullTitle = testCaseName ? `${title} > ${testCaseName}` : title;
  // eslint-disable-next-line playwright/valid-title
  test(fullTitle, async ({ page }, testInfo) => {
    page.on('console', async (msg) => {
      const args = await Promise.all(msg.args().map(jsHandle => jsHandle.jsonValue()));
      // eslint-disable-next-line no-console
      console.log(...args);
    });

    await page.goto(file);
    const dimensions = await page.evaluate(() => {
      const e = document.getElementById('figureOneContainer');
      return {
        width: e.clientWidth,
        height: e.clientHeight,
      };
    });
    await page.setViewportSize({ width: dimensions.width, height: dimensions.height });
    await page.evaluate((tc) => {
      figure.timeKeeper.setManualFrames();
      figure.timeKeeper.frame(0);
      if (tc !== '') {
        runTestCase(tc, testCases);
      }
      figure.animateNextFrame();
    }, testCase);
    delay(100);

    const snapshotDir = require('path').join(require('path').dirname(callerFile || testInfo.file), '__image_snapshots__');
    for (let i = 0; i <= duration; i += step) {
      await page.evaluate(
        ([s]) => figure.timeKeeper.frame(s), [i === 0 ? 0 : step],
      );
      const image = await page.screenshot({ fullPage: true });
      const name = typeof testCase === 'string' ? testCase : testCase.join('-');
      matchSnapshot(snapshotDir, image, `${name}.png`, testInfo);
    }
  });
}

module.exports = {
  browserScreenShot,
};
