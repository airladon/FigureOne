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
  jest.setTimeout(60000);
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
      const image = await page.screenshot({
        // fullPage: true,
        clip: {
          x: 0,
          y: 0,
          width: dimensions.width,
          height: Math.min(remainingHeight, 1000),
        },
      });
      y += 1000;
      remainingHeight -= 1000;
      expect(image).toMatchImageSnapshot();
    }
    expect(failures).toEqual([]);
  });
}

module.exports = {
  browserStaticTester,
};
