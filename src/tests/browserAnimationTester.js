/* global figure timeoutId startUpdates */
/* eslint-disable no-await-in-loop */
const path = require('path');
const { test, expect } = require('@playwright/test');

function kebab(str) {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .replace(/(\d)([a-zA-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function testBrowserAnimation(title, file, duration, step) {
  // Capture caller's file from stack trace (called at module level in .btest.js)
  const callerFile = new Error().stack.split('\n')
    .map(l => l.match(/\((.+\.btest\.js):\d+:\d+\)/))
    .filter(Boolean).map(m => m[1])[0];

  // eslint-disable-next-line playwright/valid-title
  test(title, async ({ page }, testInfo) => {
    page.on('console', (msg) => {
      for (let i = 0; i < msg.args().length; i += 1) {
        const result = `${msg.args()[i]}`;
        // eslint-disable-next-line no-console
        console.log(result);
      }
    });

    let image;
    await page.goto(file);
    await page.evaluate(() => {
      clearTimeout(timeoutId);
      figure.timeKeeper.setManualFrames();
      figure.timeKeeper.frame(0);
      startUpdates();
    });

    const fileName = kebab(path.basename(callerFile || testInfo.file));
    const kebabTitle = kebab(title);
    let counter = 1;

    for (let i = 0; i <= duration; i += step) {
      await page.evaluate(
        ([s]) => figure.timeKeeper.frame(s), [i === 0 ? 0 : step],
      );
      image = await page.screenshot({ fullPage: true });
      expect(image).toMatchSnapshot({
        name: `${fileName}-${kebabTitle}-${counter}-snap.png`,
      });
      counter += 1;
    }
  });
}

module.exports = {
  testBrowserAnimation,
};
