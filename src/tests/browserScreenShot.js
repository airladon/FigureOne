/* global page figure testCases, runTestCase */
/* eslint-disable no-await-in-loop */
/* eslint-disable jest/no-export */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

function browserScreenShot(title, file, testCase = '', duration = 0, step = 1) {
  jest.setTimeout(120000);

  function delay(time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  page.on('console', async (msg) => {
    // const msgType = msg.type();
    const args = await Promise.all(msg.args().map(jsHandle => jsHandle.jsonValue()));
    // eslint-disable-next-line no-console
    console.log(...args);
  });

  // eslint-disable-next-line jest/valid-title
  test(title, async () => {
    let image;
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

    for (let i = 0; i <= duration; i += step) {
      await page.evaluate(
        ([s]) => figure.timeKeeper.frame(s), [i === 0 ? 0 : step],
      );
      // delay(100);
      image = await page.screenshot({ fullPage: true });
      const name = typeof testCase === 'string' ? testCase : testCase.join('-');
      expect(image).toMatchImageSnapshot({
        customSnapshotIdentifier: `${name}`,
      });
    }
  });
}

module.exports = {
  browserScreenShot,
};
