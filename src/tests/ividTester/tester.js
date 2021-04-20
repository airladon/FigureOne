/* global page figure __title __width __height */
/* eslint-disable import/prefer-default-export, global-require, no-console */
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

// It's not clear to me whether page.evaluate will always paint the screen
// first and then return. Below, a promise is returned that resolves when
// the screen is painted, guaranteeing this behaviour, but it's possible it is
// overkill. In the seek function below, no such thing is done, though if
// inconsistent behaviour in the future is seen, maybe try doing the same.
async function frame(delta) {
  await page.evaluate(([d]) => new Promise((resolve) => {
    figure.subscriptions.add('afterDraw', () => resolve(), 1);
    figure.globalAnimation.frame(d);
    figure.animateNextFrame();
    figure.recorder.subscriptions.publish('timeUpdate', [figure.recorder.getCurrentTime()]);
    resolve();
  }), [delta]);
}

async function seek(seekTimeIn) {
  await page.evaluate(([seekTime]) => {
    figure.recorder.seek(seekTime);
    figure.animateNextFrame();
  }, [seekTimeIn]);
}

async function getCurrentTime() {
  const currentTime = await page.evaluate(() => Promise.resolve(figure.recorder.getCurrentTime()));
  return currentTime;
}

async function snap(time, threshold) {
  const image = await page.screenshot({ timeout: 300000 });
  return expect(image).toMatchImageSnapshot({
    customSnapshotIdentifier: `${zeroPad(Math.round(time * 10000), 7)}`,
    failureThreshold: threshold,
  });
}

async function tester(
  htmlFile, dataFileUrl, dataFile, stateResolution = 1,
  fromTimesIn = [], toTimesIn = [], threshold = 0, intermitentTime = 0,
) {
  require('./start.js');
  // Tests
  // * Snapshot at each state time
  // * Snapshot of seek to each state time
  // * Snapshots of seek from a time, seek to a time, and play

  // Get the state times from the json video file and save them in a tests
  // array of tuples: [time, deltaTime]
  const combinedData = JSON.parse(fs.readFileSync(dataFile));
  const diffsKey = combinedData.states.map.map.diffs;
  const diffs = combinedData.states.minified[diffsKey];
  const stateTimes = diffs.filter((d, i) => i % stateResolution === 0).map(d => d[0]);

  let slideTimes = [];
  if (combinedData.events.map.map.slide != null) {
    const slideEventKey = combinedData.events.map.map.slide;
    const slides = combinedData.events.minified[slideEventKey];
    slideTimes = slides.map(s => s[0] + 1.1);
  }
  if (combinedData.events.map.map._autoSlide != null) {
    const slideEventKey = combinedData.events.map.map._autoSlide;
    const slides = combinedData.events.minified[slideEventKey];
    slideTimes.push(...slides.map(s => s[0] + 1.1));
    slideTimes.sort();
  }
  let fromTimes = fromTimesIn;
  if (fromTimes.length === 0) {
    fromTimes = slideTimes;
  }
  let toTimes = toTimesIn;
  if (toTimes.length === 0) {
    toTimes = slideTimes;
  }
  const seekTests = [];
  stateTimes.forEach((stateTime) => {
    seekTests.push([stateTime]);
  });
  const fromToTests = [];
  fromTimes.forEach((from) => {
    toTimes.forEach((to) => {
      fromToTests.push([from, to]);
    });
  });

  const path = dataFile.split('/').slice(0, -1).join('/');
  fs.copyFileSync(dataFile, `${path}/tests/video-track.json`);
  fs.copyFileSync(dataFile, `${path}/tests/audio-track.mp3`);

  // Final Tests
  const tests = stateTimes.map(t => [t]);

  jest.setTimeout(120000);
  describe(__title, () => {
    // Load page, set manual frames, remove audio, load video data file and play
    beforeAll(async () => {
      await page.setViewportSize({ width: __width || 500, height: __height || 375 });
      await page.goto(htmlFile);
      await page.evaluate((url) => {
        figure.globalAnimation.manualOneFrameOnly = false;
        figure.globalAnimation.setManualFrames();
        figure.recorder.startPlayback();
        document.getElementById('f1_player__play_pause').style.visibility = 'hidden';
      }, [dataFileUrl]);
      await sleep(50);
    });
    // afterAll(() => {
    //   fs.rmSync(dataFile, `${path}/tests/video-track.json`);
    //   fs.rmSync(dataFile, `${path}/tests/audio-track.mp3`);
    // });
    test.each(tests)('Play: %s',
      async (time) => {
        // const currentTime = await page.evaluate(
        //   () => Promise.resolve(figure.recorder.getCurrentTime()),
        // );
        const currentTime = await getCurrentTime();
        const deltaTime = time - currentTime;
        let d = deltaTime;
        // Trigger frames between those to be recorded
        if (intermitentTime > 0) {
          if (deltaTime > intermitentTime) {
            for (let i = intermitentTime; i < deltaTime - intermitentTime; i += intermitentTime) {
              frame(intermitentTime);
              d -= intermitentTime;
            }
          }
        }
        // Trigger frame to be recordered
        await frame(d);
        await snap(time, threshold);
        // const image = await page.screenshot({ timeout: 300000 });
        // expect(image).toMatchImageSnapshot({
        //   customSnapshotIdentifier: `${zeroPad(Math.round(time * 10000), 7)}`,
        //   failureThreshold: threshold,
        // });
      });
    test.each(seekTests)('Seek: %s',
      async (seekTimeIn) => {
        // const currentTime = await page.evaluate(([seekTime]) => {
        //   figure.recorder.seek(0);
        //   figure.globalAnimation.frame(0);
        //   figure.recorder.seek(seekTime);
        //   figure.globalAnimation.frame(0);
        //   return Promise.resolve(figure.recorder.getCurrentTime());
        // }, [seekTimeIn]);
        await seek(0);
        await frame(0);
        await seek(seekTimeIn);
        await frame(0);
        const currentTime = await getCurrentTime();
        // console.log(currentTime);
        // await sleep(50);
        // const image = await page.screenshot({ timeout: 300000 });
        // expect(image).toMatchImageSnapshot({
        //   customSnapshotIdentifier: `${zeroPad(Math.round(currentTime * 10000), 7)}`,
        //   failureThreshold: threshold,
        // });
        await snap(currentTime, threshold);
      });
    test.each(fromToTests)('From To: %s %s',
      async (fromTime, toTime) => {
        console.log(fromTime, toTime);
        const seek = async (seekTimeIn, play) => {
          const currentTime = await page.evaluate(([seekTime]) => {
            figure.recorder.seek(seekTime);
            figure.globalAnimation.frame(0);
            figure.recorder.subscriptions.publish('timeUpdate', [figure.recorder.getCurrentTime()]);
            return Promise.resolve(figure.recorder.getCurrentTime());
          }, [seekTimeIn]);
          let index = 0;
          while (index < stateTimes.length - 1 && stateTimes[index] < currentTime + 0.5) {
            index += 1;
          }
          const nextFrameTime = stateTimes[index][0];
          const checkImage = async (imageTime) => {
            const image = await page.screenshot({ timeout: 300000 });
            expect(image).toMatchImageSnapshot({
              customSnapshotIdentifier: `${zeroPad(Math.round(imageTime * 10000), 7)}`,
              failureThreshold: threshold,
            });
          };
          await checkImage(currentTime);
          if (nextFrameTime > currentTime && play) {
            await page.evaluate(([delta]) => {
              figure.recorder.resumePlayback();
              figure.globalAnimation.frame(delta);
              figure.recorder.subscriptions.publish('timeUpdate', [figure.recorder.getCurrentTime()]);
            }, [nextFrameTime - currentTime]);
            await checkImage(nextFrameTime);
          }
        };
        await seek(fromTime, false);
        await seek(toTime, true);
      });
  });
}


module.exports = {
  tester,
};

