/* global page figure timeoutId Fig __steps __title __width __height */
/* eslint-disable import/prefer-default-export, global-require */
/* eslint-disable import/no-dynamic-require, no-eval */
/* eslint-disable jest/no-export, no-await-in-loop */
global.__frames = [];
global.__title = '';
global.__steps = [];
global.__duration = 5;
global.__timeStep = 0.5;
global.__width = 500;
global.__height = 375;

// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

page.on('console', async (msg) => {
  const msgType = msg.type();
  const args = await Promise.all(msg.args().map(jsHandle => jsHandle.jsonValue()));
  // eslint-disable-next-line no-console
  console[msgType](...args);
});


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function zeroPad(num, places) {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join('0') + num;
}

function tester(htmlFile, framesFile, threshold = 0, intermitentTime = 0, finish = 'finish') {
  require('./start.js');
  if (framesFile != null && framesFile !== '') {
    require(framesFile);
  }
  const { __finish } = require(`./${finish}.js`);
  __finish();
  jest.setTimeout(120000);

  const tests = [];
  let lastTime = 0;
  __steps.forEach((step) => {
    let time;
    let action;
    let location;
    let description;
    let snap;
    if (Array.isArray(step)) {
      [time, action, location, description, snap] = step;
    } else {
      time = step;
    }
    if (snap == null) {
      snap = true;
    }
    const delta = time - lastTime;
    const test = [
      time,
      description || '',
      delta,
      action || null,
      location || [],
      snap,
    ];
    lastTime = time;
    tests.push(test);
  });

  let file = `file:/${htmlFile}`;
  if (htmlFile.startsWith('http')) {
    file = htmlFile;
  }
  lastTime = -1;
  describe(__title, () => {
    beforeAll(async () => {
      await page.setViewportSize({ width: __width || 500, height: __height || 375 });
      await page.goto(file);
      await page.evaluate(() => {
        clearTimeout(timeoutId);
        figure.globalAnimation.manualOneFrameOnly = false;
        figure.globalAnimation.setManualFrames();
        figure.globalAnimation.frame(0);
      });
      // Sleep for an animation frame to act on the frame above
      await sleep(50);
    });
    test.each(tests)('%s %s',
      async (time, description, deltaTime, action, location, snap) => {
        let d = deltaTime;
        if (intermitentTime > 0 && deltaTime > intermitentTime) {
          for (let i = intermitentTime; i <= deltaTime - intermitentTime; i += intermitentTime) {
            await page.evaluate((t) => {
              figure.globalAnimation.frame(t);
            }, intermitentTime);
            d -= intermitentTime;
          }
        }
        if (action !== 'delay') {
          await page.evaluate(([delta, t, l]) => {
            figure.globalAnimation.frame(delta);
            if (t != null) {
              if (t.startsWith('touch')) {
                const loc = Fig.tools.g2.getPoint(l || [0, 0]);
                figure[t](loc);
                if (Array.isArray(l) && l.length === 2) {
                  figure.setCursor(loc);
                }
              } else {
                eval(t);
              }
            }
          }, [d, action, location]);
        }
        if (!snap) {
          return;
        }
        // Sleep for an animation frame to act on the frame above
        await sleep(50);
        if (time !== lastTime) {
          const image = await page.screenshot();
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

