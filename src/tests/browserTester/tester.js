/* global page figure timeoutId Fig __steps __title */
/* eslint-disable import/prefer-default-export, global-require */
/* eslint-disable import/no-dynamic-require, no-eval */
/* eslint-disable jest/no-export, no-await-in-loop */
global.__frames = [];
global.__title = '';
global.__steps = [];
global.__duration = 5;
global.__timeStep = 0.5;

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

// let lastTime = -1;
function tester(htmlFile, framesFile, threshold = 0) {
  require('./start.js');
  if (framesFile != null && framesFile !== '') {
    require(framesFile);
  }
  require('./finish.js');
  jest.setTimeout(60000);

  const tests = [];
  let lastTime = 0;
  __steps.forEach((step) => {
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

  const file = `file:/${htmlFile}`;
  lastTime = -1;
  describe(__title, () => {
    beforeAll(async () => {
      await page.setViewportSize({ width: 500, height: 375 });
      await page.goto(file);
      await page.evaluate(() => {
        clearTimeout(timeoutId);
        figure.globalAnimation.setManualFrames();
        figure.globalAnimation.frame(0);
      });
    });
    test.each(tests)('%s %s',
      async (time, description, deltaTime, action, location) => {
        await page.evaluate(([delta, t, l]) => {
          figure.globalAnimation.frame(delta);
          if (t != null) {
            if (t.startsWith('touch')) {
              const loc = Fig.tools.g2.getPoint(l || [0, 0]);
              figure[t](loc);
            } else {
              eval(t);
            }
          }
        }, [deltaTime, action, location]);
        // console.log(time, lastTime)
        if (time !== lastTime) {
          const image = await page.screenshot({ fullPage: true });
          expect(image).toMatchImageSnapshot({
            customSnapshotIdentifier: `${zeroPad(Math.round(time * 1000), 5)}-${description}`,
            failureThreshold: threshold,
          });
          lastTime = time;
        }
      });
  });
}


module.exports = {
  tester,
};

