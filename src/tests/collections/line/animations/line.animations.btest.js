/* global page figure timeoutId startUpdates Fig */
/* eslint-disable no-await-in-loop */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });
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

const step = 0.25;
const duration = 2;

test('Collections: Line', async () => {
  let image;
  await page.goto(`file:/${__dirname}/index.html`);
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
