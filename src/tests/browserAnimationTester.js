/* global page figure timeoutId startUpdates Fig */
/* eslint-disable no-await-in-loop */
/* eslint-disable jest/no-export */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

function testBrowserAnimation(title, file, duration, step) {
  jest.setTimeout(60000);

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

  test(title, async () => {
    let image;
    await page.goto(file);
    await page.evaluate(() => {
      clearTimeout(timeoutId);
      figure.globalAnimation.setManualFrames();
      figure.globalAnimation.frame(0);
      startUpdates();
    });

    for (let i = 0; i <= duration; i += step) {
      await page.evaluate(
        ([s]) => figure.globalAnimation.frame(s), [i === 0 ? 0 : step],
      );
      // delay(100);
      image = await page.screenshot({ fullPage: true });
      expect(image).toMatchImageSnapshot();
    }
  });
}

module.exports = {
  testBrowserAnimation,
};