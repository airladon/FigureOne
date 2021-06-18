/* global page figure Fig testCases */
/* eslint-disable no-await-in-loop */
/* eslint-disable jest/no-export */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

function browserScreenShot(title, file, testCase = '', duration = 0, step = 1) {
  jest.setTimeout(120000);

  function delay(time) {
    return new Promise(function(resolve) {
      setTimeout(resolve, time)
    });
  }

  page.on('console', async (msg) => {
    const msgType = msg.type();
    const args = await Promise.all(msg.args().map(jsHandle => jsHandle.jsonValue()));
    console[msgType](...args);
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
      function processArray(_a, _o) {
        const next = _a[0];
        if (_a.length === 1) {
          return _o[next];
        }
        return processArray(_a.slice(1), _o[next]);
      }
      if (Array.isArray(tc)) {
        processArray(tc, testCases)();
      } else if (tc !== '') {
        // eslint-disable-next-line
        testCases[tc]();
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
