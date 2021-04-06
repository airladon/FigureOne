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
const { performance } = require('perf_hooks');

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
  require('./start.js');
  // Tests
  // * Snapshot at each state time
  // * Matrix of snapshots seeking from a state, to a state
  //    - where to states are different slides
  //    - where from states are different slides, or user defined

  // Get the state times from the json video file and save them in a tests
  // array of tuples: [time, deltaTime]
  const combinedData = JSON.parse(fs.readFileSync(dataFile));
  const diffsKey = combinedData.states.map.map.diffs;
  const diffs = combinedData.states.minified[diffsKey];
  // const stateTimes = diffs.map((d, i) => {
  //   if (i === 0) {
  //     return [d[0], d[0]];
  //   }
  //   return [d[0], Math.round((d[0] - diffs[i - 1][0]) * 1000000) / 1000000];
  // });
  const stateTimes = diffs.map(d => d[0]);

  const slideEventKey = combinedData.events.map.map.slide;
  const slides = combinedData.events.minified[slideEventKey];
  const slideTimes = slides.map(s => s[0] + 1.1);
  let fromTimes = fromTimesIn;
  if (fromTimes.length === 0) {
    fromTimes = [slideTimes[0], slideTimes.slice(-1)[0]];
  }
  let toTimes = toTimesIn;
  if (toTimes.length === 0) {
    toTimes = slideTimes.slice(0, -1);
  }
  const seekTests = [];
  stateTimes.forEach((stateTime) => {
    seekTests.push([stateTime]);
  });
  // console.log(fromTimes, toTimes)
  const fromToTests = [];
  fromTimes.forEach((from) => {
    toTimes.forEach((to) => {
      fromToTests.push([from, to]);
    });
  });
  // console.log(fromToTests);

  // console.log(combinedData.events.mini)

  // Get the slide events

  // Final Tests
  const tests = [[0], ...stateTimes.map(t => [t])];
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
        document.getElementById('f1_player__play_pause').style.visibility = 'hidden';
      }, [dataFileUrl]);
      // Delay for time to fetch and load data file, then start playback
      await sleep(500);
    });
    // test.each(tests)('Play: %s',
    //   async (time) => {
    //     // console.log('play', time)
    //     const t = performance.now();
    //     const currentTime = await page.evaluate(() => {
    //       return Promise.resolve(figure.recorder.getCurrentTime());
    //     });
    //     // console.log(currentTime, performance.now())
    //     const deltaTime = time - currentTime;
    //     let d = deltaTime;
    //     // Trigger frames between those to be recorded
    //     await page.evaluate(([delta]) => {
    //       figure.globalAnimation.frame(delta);
    //       // figure.recorder.subscriptions.publish('timeUpdate', [figure.recorder.getCurrentTime()]);
    //       figure.globalAnimation.frame(0);
    //     }, [d]);
    //     const image = await page.screenshot({ fullPage: true });
    //     const t3 = performance.now();
    //     expect(image).toMatchImageSnapshot({
    //       customSnapshotIdentifier: `${zeroPad(Math.round(time * 10000), 7)}`,
    //       failureThreshold: threshold,
    //     });
    //     console.log('play', time,
    //       Math.round((t3 - t)),
    //     );
    //   });
    test.each(tests)('Play: %s',
      async (time) => {
        // console.log('play', time)
        const currentTime = await page.evaluate(() => {
          return Promise.resolve(figure.recorder.getCurrentTime());
        });
        // console.log(currentTime, performance.now())
        const deltaTime = time - currentTime;
        let d = deltaTime;
        // Trigger frames between those to be recorded
        // console.log(deltaTime, intermitentTime)
        if (intermitentTime > 0) {
          if (deltaTime > intermitentTime) {
            for (let i = intermitentTime; i < deltaTime - intermitentTime; i += intermitentTime) {
              // console.log(i + currentTime)
              await page.evaluate((t) => {
                figure.globalAnimation.frame(t);
              }, [intermitentTime]);
              d -= intermitentTime;
            }
          }
        }
        // const t1 = performance.now();
        // Trigger frame to be recordered
        await page.evaluate(([delta]) => {
          figure.globalAnimation.frame(delta);
          figure.recorder.subscriptions.publish('timeUpdate', [figure.recorder.getCurrentTime()]);
          figure.globalAnimation.frame(0);
          // console.log(figure.elements._eqn.isShown, figure.elements._eqn.opacity, figure.getRemainingAnimationTime())
        }, [d]);
        const t = performance.now();
        // const currentTimeAfter = await page.evaluate(() => {
        //   return Promise.resolve(figure.recorder.getCurrentTime());
        // })
        const image = await page.screenshot({ fullPage: true });
        const t1 = performance.now();
        expect(image).toMatchImageSnapshot({
          customSnapshotIdentifier: `${zeroPad(Math.round(time * 10000), 7)}`,
          failureThreshold: threshold,
        });
        console.log('play', time,
          Math.round((t1 - t)),
        );
      });
    test.each(seekTests)('Seek: %s',
      async (seekTimeIn) => {
        // console.log('seek', seekTimeIn)
        // console.log('Seek: ', seekTimeIn)
        const currentTime = await page.evaluate(([seekTime]) => {
          figure.recorder.seek(0);
          figure.globalAnimation.frame(0);
          figure.recorder.seek(seekTime);
          figure.globalAnimation.frame(0);
          // figure.recorder.resumePlayback();
          // figure.globalAnimation.frame(0);
          return Promise.resolve(figure.recorder.getCurrentTime());
        }, [seekTimeIn]);
        const image = await page.screenshot({ fullPage: true });
        expect(image).toMatchImageSnapshot({
          customSnapshotIdentifier: `${zeroPad(Math.round(currentTime * 10000), 7)}`,
          failureThreshold: threshold,
        });
      });
    test.each(fromToTests)('From To: %s %s',
      async (fromTime, toTime) => {
        const seek = async (seekTimeIn) => {
          const currentTime = await page.evaluate(([seekTime]) => {
            figure.recorder.seek(seekTime);
            figure.globalAnimation.frame(0);
            // figure.recorder.resumePlayback();
            // figure.globalAnimation.frame(0);
            return Promise.resolve(figure.recorder.getCurrentTime());
          }, [seekTimeIn]);
          let index = 0;
          while (index < stateTimes.length - 1 && stateTimes[index] < currentTime + 0.5) {
            index += 1;
          }
          const nextFrameTime = stateTimes[index][0];
          // console.log(seekTimeIn, currentTime, nextFrameTime);
          const checkImage = async (imageTime) => {
            const image = await page.screenshot({ fullPage: true });
            expect(image).toMatchImageSnapshot({
              customSnapshotIdentifier: `${zeroPad(Math.round(imageTime * 10000), 7)}`,
              failureThreshold: threshold,
            });
          };
          await checkImage(currentTime);
          if (nextFrameTime > currentTime) {
            await page.evaluate(([delta]) => {
              figure.globalAnimation.frame(delta);
            }, [nextFrameTime - currentTime]);
            await checkImage(nextFrameTime);
          }
        };
        // console.log('from', fromTime);
        await seek(fromTime);
        // console.log('to', toTime);
        await seek(toTime);
        // Seek to fromTime
      });
  });
}


module.exports = {
  tester,
};

