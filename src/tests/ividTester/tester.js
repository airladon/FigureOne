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
  const tests = [[0], ...stateTimes.map(t => [t])];

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
        // figure.recorder.audio = null;
        // figure.recorder.loadVideoTrack(url, () => figure.recorder.startPlayback());
        document.getElementById('f1_player__play_pause').style.visibility = 'hidden';
      }, [dataFileUrl]);
    });
    afterAll(() => {
      fs.rmSync(dataFile, `${path}/tests/video-track.json`);
      fs.rmSync(dataFile, `${path}/tests/audio-track.mp3`);
    });
    test.each(tests)('Play: %s',
      async (time) => {
        const currentTime = await page.evaluate(
          () => Promise.resolve(figure.recorder.getCurrentTime()),
        );
        const deltaTime = time - currentTime;
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
          figure.recorder.subscriptions.publish('timeUpdate', [figure.recorder.getCurrentTime()]);
        }, [d]);
        await sleep(500);
        console.log('Capture', time);
        const image = await page.screenshot({ fullPage: true, timeout: 300000 });
        expect(image).toMatchImageSnapshot({
          customSnapshotIdentifier: `${zeroPad(Math.round(time * 10000), 7)}`,
          failureThreshold: threshold,
        });
      });
    test.each(seekTests)('Seek: %s',
      async (seekTimeIn) => {
        const currentTime = await page.evaluate(([seekTime]) => {
          figure.recorder.seek(0);
          figure.globalAnimation.frame(0);
          figure.recorder.seek(seekTime);
          figure.globalAnimation.frame(0);
          return Promise.resolve(figure.recorder.getCurrentTime());
        }, [seekTimeIn]);
        const image = await page.screenshot({ fullPage: true, timeout: 300000 });
        expect(image).toMatchImageSnapshot({
          customSnapshotIdentifier: `${zeroPad(Math.round(currentTime * 10000), 7)}`,
          failureThreshold: threshold,
        });
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
            const image = await page.screenshot({ fullPage: true, timeout: 300000 });
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

