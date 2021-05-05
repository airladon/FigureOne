/* global page figure  */
/* eslint-disable import/prefer-default-export, global-require, no-console */
/* eslint-disable import/no-dynamic-require, no-eval */
/* eslint-disable jest/no-export, no-await-in-loop */

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

// We only want to return from this function after the canvas has actually been
// painted, so we resolve the promise with the 'afterDraw' notification
async function frame(delta) {
  await page.evaluate(([d]) => new Promise((resolve) => {
    figure.notifications.add('afterDraw', () => resolve(), 1);
    figure.timeKeeper.frame(d);
    figure.recorder.notifications.publish('timeUpdate', [figure.recorder.getCurrentTime()]);
    figure.animateNextFrame();
    // resolve();
  }), [delta]);
}

async function seek(seekTimeIn) {
  await page.evaluate(([seekTime]) => {
    figure.recorder.seek(seekTime);
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
 *
 * Input options object to tester is:
 *   title                 // test title
 *   width                 // viewport width
 *   height                // viewport height
 *   htmlFile,             // website to load
 *   testPath,             // path to test file - defaults to calling file
 *   stateSampling = 1,    // Use n for testing every n state times
 *   fromTimesIn = [],     // Defaults to slide times, then empty
 *   toTimesIn = [],       // Defaults to slide times, from times, empty
 *   threshold = 0,        // In pixels
 *   intermitentTime = 0,  // Force a frame draw every intermitentTime seconds
 */
async function tester(
  optionsIn,
) {
  const title = optionsIn.title || 'Video Test';
  const width = optionsIn.width || 500;
  const height = optionsIn.height || 375;
  const testPath = optionsIn.testPath || module.parent.path;
  const htmlFile = optionsIn.htmlFile || 'http://localhost:8080/';
  const fromTimesIn = optionsIn.fromTimes || [];
  const toTimesIn = optionsIn.toTimes || [];
  const threshold = optionsIn.threshold || 0;
  const stateSampling = optionsIn.stateSampling || 1;
  const intermittentTime = optionsIn.intermittentTime || 0;

  // Get the state times from the json video file and save them in a tests
  // array of tuples: [time, deltaTime]
  const videoTrack = Path.resolve(testPath, '../video-track.json');
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

  // Copy the video track file to the tests folder so loading the
  // file doesn't cause an error
  // fs.copyFileSync(videoTrack, `${testPath}/video-track.json`);


  jest.setTimeout(120000);
  describe(title, () => {
    // Load page, set manual frames, remove audio, load video data file and play
    beforeAll(async () => {
      await page.setViewportSize({ width, height });
      await page.goto(htmlFile);
      await page.evaluate(() => {
        figure.timeKeeper.setManualFrames();
        figure.recorder.startPlayback();
        document.getElementById('f1_player__play_pause').style.visibility = 'hidden';
      });
      await sleep(50);
    });
    test.each(playbackTests)('Play: %s',
      async (time) => {
        const currentTime = await getCurrentTime();
        const deltaTime = time - currentTime;
        let d = deltaTime;
        if (intermittentTime > 0 && deltaTime > intermittentTime) {
          for (let i = intermittentTime; i < deltaTime - intermittentTime; i += intermittentTime) {
            await frame(intermittentTime);
            d -= intermittentTime;
          }
        }
        await frame(d);
        await snap(time, threshold);
      });
    test.each(seekTests)('Seek: %s',
      async (seekTime) => {
        await seek(0);
        await frame(0);
        await seek(seekTime);
        await frame(0);
        const currentTime = await getCurrentTime();
        await snap(currentTime, threshold);
      });
    test.each(fromToTests)('From To: %s %s',
      async (fromTime, toTime) => {
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

