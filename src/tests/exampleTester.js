/* global page figure timeoutId Fig */
/* eslint-disable import/prefer-default-export */
/* eslint-disable jest/no-export, no-await-in-loop */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const messages = [];
page.on('console', (msg) => {
  for (let i = 0; i < msg.args().length; i += 1) {
    const result = `${msg.args()[i]}`;
    messages.push(result);
  }
});

function zeroPad(num, places) {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join('0') + num;
}

function exampleTester(title, file, stepsIn) {
  jest.setTimeout(60000);

  const tests = [];
  let lastTime = 0;
  stepsIn.forEach((step) => {
    let time;
    let action;
    let location;
    let description;
    if (Array.isArray(step)) {
      [time, action, location, description] = step;
    } else {
      time = step;
    }
    const delta = time - lastTime;
    const test = [
      time,
      description || '',
      delta,
      action || null,
      location || [],
    ];
    lastTime = time;
    tests.push(test);
  });

  describe(title, () => {
    beforeAll(async () => {
      await page.setViewportSize({ width: 500, height: 375 });
      await page.goto(file);
      await page.evaluate(() => {
        clearTimeout(timeoutId);
        figure.globalAnimation.setManualFrames();
        figure.globalAnimation.frame(0);
      });
    });
    test.each(tests)('%i %s',
      async (time, description, deltaTime, action, location) => {
        await page.evaluate(([delta, t, l]) => {
          figure.globalAnimation.frame(delta);
          if (t != null) {
            const loc = Fig.tools.g2.getPoint(l || [0, 0]);
            figure[t](loc);
          }
        }, [deltaTime, action, location]);
        const image = await page.screenshot({ fullPage: true });
        expect(image).toMatchImageSnapshot({
          customSnapshotIdentifier: `${zeroPad(time * 1000, 5)}-${description}`,
        });
      });
  });
}

// export {
//   exampleTester,
// };

module.exports = {
  exampleTester,
};

