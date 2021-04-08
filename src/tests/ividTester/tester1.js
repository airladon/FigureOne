/* global page figure timeoutId __title __width __height */
/* eslint-disable import/prefer-default-export, global-require */
/* eslint-disable import/no-dynamic-require, no-eval */
/* eslint-disable jest/no-export, no-await-in-loop */
global.__title = '';
global.__timeStep = 0.5;
global.__width = 500;
global.__height = 375;

// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

page.on('console', m => console.log(m.text(), JSON.stringify(m.args())));

function zeroPad(num, places) {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join('0') + num;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tester(htmlFile, dataFileUrl, dataFile, fromTimesIn = [], toTimesIn = [], threshold = 0, intermitentTime = 0) {
  jest.setTimeout(120000);
  describe(__title, () => {
    test('inital', async () => {
      const snap = async (name) => {
        const image = await page.screenshot({ fullPage: true });
        expect(image).toMatchImageSnapshot({
          customSnapshotIdentifier: name,
          failureThreshold: threshold,
        });
      };
      await page.setViewportSize({ width: __width || 500, height: __height || 375 });
      await page.goto(htmlFile);
      await snap('00-initial');
      await page.evaluate(() => {
        figure.globalAnimation.setManualFrames();
        // figure.globalAnimation.frame(0);
      });
      await snap('01-after-set-frames');
      await page.evaluate(() => {
        figure.elements._xLabel.animations.new().position({ target: [0, 0], duration: 2 }).start();
      });
      await snap('02-after-anim-start');
      await page.evaluate(() => {
        figure.globalAnimation.frame(1);
      });
      await snap('03-after-1s');
    });
  });
}


module.exports = {
  tester,
};

