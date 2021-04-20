/* global page figure __title __width __height */
/* eslint-disable import/prefer-default-export, global-require, no-console */
/* eslint-disable import/no-dynamic-require, no-eval */
/* eslint-disable jest/no-export, no-await-in-loop */
global.__title = '';
global.__width = 500;
global.__height = 375;

// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const fs = require('fs');
const Path = require('path');

expect.extend({ toMatchImageSnapshot });

// page.on('console', m => console.log(m.text(), JSON.stringify(m.args())));
page.on('console', async (msg) => {
  const msgType = msg.type();
  const args = await Promise.all(msg.args().map(jsHandle => jsHandle.jsonValue()));
  console[msgType](...args);
});

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

/**
 * Tests
 * 1) Playback tests: snapshot at each state time during playback
 * 2) Seek tests: snapshot of seek to each state time
 * 3) FromTo tests: snapshots of:
 *     - seekFrom time
 *     - seekTo time
 *     - one state time after resumePlayback at seekTo time
 *
 * During playback tests, use `intermitentTime` to force a frame draw
 * at a specific interval.
 */
async function tester(
  htmlFile,             // website to load
  path,                 // path to test file
  stateSampling = 1,    // Use n for testing every n state times
  fromTimesIn = [],     // Defaults to slide times, then empty
  toTimesIn = [],       // Defaults to slide times, from times, empty
  threshold = 0,        // In pixels
  intermitentTime = 0,  // Force a frame draw every intermitentTime seconds
) {
  // Get the state times from the json video file and save them in a tests
  // array of tuples: [time, deltaTime]
  const videoTrack = Path.resolve(path, '../video-track.json');
  const combinedData = JSON.parse(fs.readFileSync(videoTrack));
  const diffsKey = combinedData.states.map.map.diffs;
  const diffs = combinedData.states.minified[diffsKey];
  const stateTimes = diffs.filter((d, i) => i % stateSampling === 0).map(d => d[0]);

  // Get the slide times (if slides exist)
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
    if (toTimes.length === 0 && fromTimes.length > 0) {
      toTimes = fromTimes;
    }
  }

  // Playback tests will snapshot at state times (so seek can then be compared)
  const playbackTests = stateTimes.map(t => [t]);

  // Seek tests will be all state times
  const seekTests = [];
  stateTimes.forEach((stateTime) => {
    seekTests.push([stateTime]);
  });

  // FromToTests are all combinations of fromTimes and toTimes
  const fromToTests = [];
  fromTimes.forEach((from) => {
    toTimes.forEach((to) => {
      fromToTests.push([from, to]);
    });
  });

  // Copy the audio and video track files to the tests folder so loading the
  // file doesn't cause an error
  // const toPath = Path.resolve(path);
  fs.copyFileSync(videoTrack, `${path}/video-track.json`);
  fs.copyFileSync(videoTrack, `${path}/audio-track.mp3`);

  jest.setTimeout(120000);
  describe(__title, () => {
    // Load page, set manual frames, remove audio, load video data file and play
    beforeAll(async () => {
      await page.setViewportSize({ width: __width || 500, height: __height || 375 });
      await page.goto(htmlFile);
      await page.evaluate(() => {
        figure.globalAnimation.manualOneFrameOnly = false;
        figure.globalAnimation.setManualFrames();
        figure.recorder.startPlayback();
        document.getElementById('f1_player__play_pause').style.visibility = 'hidden';
      });
      await sleep(50);
    });
    test.each(playbackTests)('Play: %s',
      async (time) => {
        console.log(`Playback Test: ${time}`);
        const currentTime = await getCurrentTime();
        const deltaTime = time - currentTime;
        let d = deltaTime;
        if (intermitentTime > 0 && deltaTime > intermitentTime) {
          for (let i = intermitentTime; i < deltaTime - intermitentTime; i += intermitentTime) {
            await frame(intermitentTime);
            d -= intermitentTime;
          }
        }
        await frame(d);
        await snap(time, threshold);
      });
    test.each(seekTests)('Seek: %s',
      async (seekTime) => {
        console.log(`Seek Test: ${seekTime}`);
        await seek(0);
        await frame(0);
        await seek(seekTime);
        await frame(0);
        const currentTime = await getCurrentTime();
        await snap(currentTime, threshold);
      });
    test.each(fromToTests)('From To: %s %s',
      async (fromTime, toTime) => {
        console.log(`FromTo Test: ${fromTime}, ${toTime}`);
        const seekTo = async (seekTimeIn, play) => {
          await seek(seekTimeIn);
          await frame(0);
          const currentTime = await getCurrentTime();
          let index = 0;
          while (index < stateTimes.length - 1 && stateTimes[index] < currentTime + 0.5) {
            index += 1;
          }
          const nextFrameTime = stateTimes[index][0];

          await snap(currentTime, threshold);
          if (nextFrameTime > currentTime && play) {
            await page.evaluate(() => figure.recorder.resumePlayback());
            await frame(nextFrameTime - currentTime);
            await snap(nextFrameTime, threshold);
          }
        };
        await seekTo(fromTime, false);
        await seekTo(toTime, true);
      });
  });
}

module.exports = {
  tester,
};

