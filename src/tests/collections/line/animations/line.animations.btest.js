/* global page figure timeoutId */
/* eslint-disable no-await-in-loop */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(60000);

const step = 0.5;
const duration = 2;

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i)
        console.log(`${i}: ${msg.args()[i]}`);
  });

test('Collections: Line', async () => {
  let image;
  await page.goto(`file:/${__dirname}/index.html`);
  await page.evaluate(() => {
    clearTimeout(timeoutId);
  });
  // await page.evaluate(() => figure.globalAnimation.frame(0));
  await page.evaluate(([s]) => {
    figure.globalAnimation.requestNextAnimationFrame.call(
      window, figure.globalAnimation.frame.bind(figure.globalAnimation, s),
    );
  }, [step]);
  // delay(100);
  image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
  for (let i = step; i <= duration; i += step) {
    await page.evaluate(([s]) => {
      figure.globalAnimation.requestNextAnimationFrame.call(
        window, figure.globalAnimation.frame.bind(figure.globalAnimation, s),
      );
    }, [step]);
    // figure.globalAnimation.frame(s), [step]);
    delay(100);
    image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot();
  }
});
