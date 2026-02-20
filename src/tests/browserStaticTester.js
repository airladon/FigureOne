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

function browserStaticTester(title, fileIn) {
  // Capture caller's file from stack trace (called at module level in .btest.js)
  const callerFile = new Error().stack.split('\n')
    .map(l => l.match(/\((.+\.btest\.js):\d+:\d+\)/))
    .filter(Boolean).map(m => m[1])[0];

  let file = fileIn;
  if (fileIn.startsWith('file://home/pwuser')) {
    file = fileIn.replace('file://home/pwuser', 'http://localhost:8080/');
  }
  // eslint-disable-next-line playwright/valid-title
  test(title, async ({ page }, testInfo) => {
    const failures = [];
    page.on('console', (msg) => {
      for (let i = 0; i < msg.args().length; i += 1) {
        const result = `${msg.args()[i]}`;
        if (result.startsWith('JSHandle@fail')) {
          failures.push(result);
        }
      }
    });
    await page.goto(file);
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    await page.setViewportSize({ width: dimensions.width, height: 1000 });
    const fileName = kebab(path.basename(callerFile || testInfo.file));
    const kebabTitle = kebab(title);
    let counter = 1;
    let remainingHeight = dimensions.height;
    let y = 0;
    while (remainingHeight > 0) {
      await page.evaluate((scrollY) => {
        window.scroll(0, scrollY);
      }, [y]);
      const height = Math.min(remainingHeight, 1000);
      const clipY = Math.max(0, 1000 - (dimensions.height - y));
      const image = await page.screenshot({
        clip: {
          x: 0,
          y: clipY,
          width: dimensions.width,
          height: 1000,
        },
      });
      expect(image).toMatchSnapshot({
        name: `${fileName}-${kebabTitle}-${counter}-snap.png`,
      });
      counter += 1;
      y += height;
      remainingHeight -= height;
    }
    expect(failures).toEqual([]);
  });
}

module.exports = {
  browserStaticTester,
};
