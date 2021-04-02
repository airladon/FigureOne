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
const fs = require('fs');
// const { fig } = require('../../../package/index.js');
// console.log(fig.tools.tools)

expect.extend({ toMatchImageSnapshot });

page.on('console', m => console.log(m.text(), JSON.stringify(m.args())));

function zeroPad(num, places) {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join('0') + num;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// let lastTime = -1;
async function tester(htmlFile, dataFileUrl, dataFile, threshold = 0, intermitentTime = 0, finish = 'finish') {
  require('./start.js');
  // console.log(dataFile)
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
  const tests = [[0, 0, false], ...stateTimes];

  jest.setTimeout(120000);

  let file = `file:/${htmlFile}`;
  if (htmlFile.startsWith('http')) {
    file = htmlFile;
  }
  

  // const setup = async () => {
  //   await page.setViewportSize({ width: __width || 500, height: __height || 375 });
  //   console.log('1111')
  //   await page.goto(file);
  //   console.log('2222')
  //   await page.evaluate(() => {
  //     clearTimeout(timeoutId);
  //     figure.globalAnimation.setManualFrames();
  //     figure.globalAnimation.frame(0);
  //   });
  // };
  // await setup();
  // console.log('3333')
  // const tests = [];
  // let lastTime = 0;
  // __steps.forEach((step) => {
  //   let time;
  //   let action;
  //   let location;
  //   let description;
  //   let snap;
  //   if (Array.isArray(step)) {
  //     [time, action, location, description, snap] = step;
  //   } else {
  //     time = step;
  //   }
  //   if (snap == null) {
  //     snap = true;
  //   }
  //   const delta = time - lastTime;
  //   const test = [
  //     time,
  //     description || '',
  //     delta,
  //     action || null,
  //     location || [],
  //     snap,
  //   ];
  //   lastTime = time;
  //   tests.push(test);
  // });
  
  // lastTime = -1;
  // const dataFileURL = dataFile.replace('/', 'http://localhost:8080')
  describe(__title, () => {
    beforeAll(async () => {
      await page.setViewportSize({ width: __width || 500, height: __height || 375 });
      await page.goto(file);
      await page.evaluate((url) => {
        clearTimeout(timeoutId);
        figure.globalAnimation.setManualFrames();
        figure.globalAnimation.frame(0);
        // figure.recorder.timeUpdates = 500;
        figure.recorder.audio = null;
        // figure.recorder.fetchAndLoad(
        //   'http://localhost:8080/docs/examples/Trig%201%20-%20Trig%20Functions/ivid_data.json',
        //   () => figure.recorder.startPlayback(),
        // );
        figure.recorder.fetchAndLoad(url, () => figure.recorder.startPlayback());
      }, [dataFileUrl]);
      await sleep(500);
    });
    test.each(tests)('%s %s',
      async (time, deltaTime, snap) => {
        let d = deltaTime;
        if (intermitentTime > 0) {
          if (deltaTime > intermitentTime) {
            for (let i = intermitentTime; i < deltaTime - intermitentTime; i += intermitentTime) {
              await page.evaluate((t) => {
                figure.globalAnimation.frame(t);
              }, [intermitentTime]);
              d -= intermitentTime;
              // lastTime += d;
            }
          }
        }
        // if (action !== 'delay') {
        await page.evaluate(([delta]) => {
          figure.globalAnimation.frame(delta);
          // eval(t);
        }, [d]);
        // lastTime += d;
        // }
        if (!snap) {
          return;
        }
        // if (time !== lastTime) {
        const image = await page.screenshot({ fullPage: true });
        expect(image).toMatchImageSnapshot({
          customSnapshotIdentifier: `${zeroPad(Math.round(time * 1000), 5)}`,
          failureThreshold: threshold,
        });
        //   lastTime = time;
        // }
      });
  });
}


module.exports = {
  tester,
};

