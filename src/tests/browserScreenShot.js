/* global page figure Fig testCases */
/* eslint-disable no-await-in-loop */
/* eslint-disable jest/no-export */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

function browserScreenShot(title, file, testCase = '', duration = 0, step = 1) {
  jest.setTimeout(120000);

  // function delay(time) {
  //   return new Promise(function(resolve) {
  //       setTimeout(resolve, time)
  //   });
  // }

  page.on('console', (msg) => {
    for (let i = 0; i < msg.args().length; i += 1) {
      Fig.tools.misc.Console(`${i}: ${msg.args()[i]}`);
    }
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
        // eslint-disable-next-line
        testCases[tc]();
      }
    }, [testCase]);

    for (let i = 0; i <= duration; i += step) {
      await page.evaluate(
        ([s]) => figure.timeKeeper.frame(s), [i === 0 ? 0 : step],
      );
      // delay(100);
      image = await page.screenshot({ fullPage: true });
      expect(image).toMatchImageSnapshot({
        customSnapshotIdentifier: `${testCase}`,
        // failureThreshold: threshold,
        // customSnapshotsDir: `${__dirname}/${snapshots}`,
      });
    }
  });
}

module.exports = {
  browserScreenShot,
};
