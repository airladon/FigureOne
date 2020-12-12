// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(60000);
test('Collections: Line', async () => {
  // eslint-disable-next-line no-undef
  await page.goto(`file:/${__dirname}/index.html`);
  // eslint-disable-next-line no-undef
  page.on('console', msg => {
  for (let i = 0; i < msg.args().length; ++i)
    console.log(`${i}: ${msg.args()[i]}`);
});
  function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
  }
  let image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
  await page.evaluate(() => {
    figure.globalAnimation.requestNextAnimationFrame.call(window, () => {
      // figure.globalAnimation.frame.bind(figure.globalAnimation, 0.5));
      figure.globalAnimation.frame(0.5);
      console.log('animated frame');
    });
    // console.log(figure.globalAnimation != null)
    // return Promise.resolve(true);
  }
  );
  await delay(400);
  image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
  await page.evaluate(() => figure.globalAnimation.frame(0.5));
  image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
});
