/* global page */
/* eslint-disable jest/no-export, no-await-in-loop */
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
  jest.setTimeout(120000);
  // eslint-disable-next-line jest/valid-title
  test(title, async () => {
    await page.goto(file);
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    await page.setViewportSize({ width: dimensions.width, height: 1000 });
    let remainingHeight = dimensions.height;
    let y = 0;
    while (remainingHeight > 0) {
      await page.evaluate((scrollY) => {
        window.scroll(0, scrollY);
      }, [y]);
      const height = Math.min(remainingHeight, 1000);
      const clipY = Math.max(0, 1000 - (dimensions.height - y));
      const image = await page.screenshot({
        // fullPage: true,
        clip: {
          x: 0,
          y: clipY,
          width: dimensions.width,
          height: 1000,
        },
      });
      y += height;
      remainingHeight -= height;
      expect(image).toMatchImageSnapshot();
    }
    expect(failures).toEqual([]);
  });
}

module.exports = {
  browserStaticTester,
};
