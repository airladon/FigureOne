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
const fs = require('fs');

expect.extend({ toMatchImageSnapshot });

page.on('console', m => console.log(m.text(), JSON.stringify(m.args())));

function zeroPad(num, places) {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join('0') + num;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tester(htmlFile, dataFileUrl, dataFile, threshold = 0, intermitentTime = 0) {
  require('./start.js');
  // Tests
  // * Snapshot at each state time
  //

  // Get the state times from the json video file
  const combinedData = JSON.parse(fs.readFileSync(dataFile));
  const diffsKey = combinedData.states.map.map.diffs;
  const diffs = combinedData.states.minified[diffsKey];
  // Create array of tuples: [absoluteTime, deltaTime]
  const stateTimes = diffs.map((d, i) => {
    if (i === 0) {
      return [d[0], d[0], true];
    }
    return [d[0], Math.round((d[0] - diffs[i - 1][0]) * 100000) / 100000, true];
  });

  // Final Tests
  const tests = [[0, 0, false], ...stateTimes];

  jest.setTimeout(120000);

  describe(__title, () => {
    // Load page, set manual frames, remove audio, load video data file and play
    beforeAll(async () => {
      await page.setViewportSize({ width: __width || 500, height: __height || 375 });
      await page.goto(htmlFile);
      await page.evaluate((url) => {
        figure.globalAnimation.setManualFrames();
        figure.globalAnimation.frame(0);
        figure.recorder.audio = null;
        figure.recorder.fetchAndLoad(url, () => figure.recorder.startPlayback());
      }, [dataFileUrl]);
      // Delay for time to fetch and load data file, then start playback
      await sleep(500);
    });
    test.each(tests)('%s %s %b',
      async (time, deltaTime, snap) => {
        let d = deltaTime;
        // Trigger frames between those to be recorded
        if (intermitentTime > 0) {
          if (deltaTime > intermitentTime) {
            for (let i = intermitentTime; i < deltaTime - intermitentTime; i += intermitentTime) {
              await page.evaluate((t) => {
                figure.globalAnimation.frame(t);
              }, [intermitentTime]);
              d -= intermitentTime;
            }
          }
        }
        // Trigger frame to be recordered
        await page.evaluate(([delta]) => {
          figure.globalAnimation.frame(delta);
        }, [d]);
        if (!snap) {
          return;
        }
        // Record frame
        const image = await page.screenshot({ fullPage: true });
        expect(image).toMatchImageSnapshot({
          customSnapshotIdentifier: `${zeroPad(Math.round(time * 1000), 5)}`,
          failureThreshold: threshold,
        });
      });
  });
}


module.exports = {
  tester,
};

