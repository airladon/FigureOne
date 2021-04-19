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

// const messages = [];
// page.on('console', (msg) => {
//   for (let i = 0; i < msg.args().length; i += 1) {
//     const result = `${msg.args()[i]}`;
//     messages.push(result);
//   }
//   // console.log(messages)
// });
page.on('console', m => console.log(m.text()));
// page.on('console', m => console.log(m.text(), JSON.stringify(m.args())));
// page.on(`console`, async (msg) => {
//           let msgType = msg.type();
//         msgType = msgType === `warning` ? `warn` : msgType; // so we can feed it to console.warn
//         const msgText = msg.text();
//         const args = msg.args().map((jsHandle) => {
//           // see https://github.com/microsoft/playwright/issues/2275
//           const remoteObject = jsHandle[`_remoteObject`];
//           if (Object.prototype.hasOwnProperty.call(remoteObject, `value`)) {
//             return remoteObject.value;
//           } else if (remoteObject.type === `object` && remoteObject.subtype === `error` && remoteObject.description) {
//             const errStack = remoteObject.description;
//             const errMessage = errStack.split(`\n`)[0];
//             const err = new Error(errMessage);
//             err.stack = errStack;
//             return err;
//           }
//           // we don't know how to parse this out yet, return as is
//           return remoteObject;
//         });

//         // proxy browser console stream
//         console[msgType](...args);
//         });

function zeroPad(num, places) {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join('0') + num;
}

// let lastTime = -1;
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
    });
    test.each(tests)('%s %s',
      async (time, description, deltaTime, action, location, snap) => {
        let d = deltaTime;
        console.log('Plan time:', time)
        if (intermitentTime > 0) {
          if (deltaTime > intermitentTime) {
            for (let i = intermitentTime; i <= deltaTime - intermitentTime; i += intermitentTime) {
              await page.evaluate((t) => {
                figure.globalAnimation.frame(t);
                // console.log('intermittent', t)
              }, intermitentTime);
              d -= intermitentTime;
            }
          }
        }
        if (action !== 'delay') {
          await page.evaluate(([delta, t, l]) => {
            console.log('before frame')
            figure.globalAnimation.frame(delta);
            console.log('after frame')
            // console.log('now time', figure.globalAnimation.now())
            console.log(t, delta, figure.getRemainingAnimationTime(), figure.elements._nav.nav.currentSlideIndex, figure.elements._nav.nav.inTransition, figure.elements._eqn.animations.length, figure.elements._eqn.getRemainingAnimationTime())
            // if (figure.elements._eqn.animations.animations[0] != null) {
            //   console.log('start', figure.elements._eqn.animations.animations[0].startTime, figure.elements._eqn.animations.animations[0].steps[0].duration, figure.globalAnimation.now());
            // }
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

