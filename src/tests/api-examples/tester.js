/* eslint-disable no-await-in-loop, import/no-unresolved, no-eval, jest/no-export */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* global figure page jestPlaywright */
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const fs = require('fs');
const { getExamples } = require('./getExamples');

expect.extend({ toMatchImageSnapshot });

function zeroPad(num, places) {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join('0') + num;
}

// We only want to return from this function after the canvas has actually been
// painted, so we resolve the promise with the 'afterDraw' notification
async function frame(delta) {
  await page.evaluate(([d]) => new Promise((resolve) => {
    figure.notifications.add('afterDraw', () => resolve(), 1);
    figure.timeKeeper.frame(d);
    figure.animateNextFrame();
  }), [delta]);
}

function tester(snapshots, path, initialization = '', threshold = 0) {
  const examples = getExamples(path);
  const start = `
const figure = new Fig.Figure({
  limits: [-3, -2.25, 6, 4.5],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

figure.add([
  {
    name: '__minorGrid',
    make: 'primitives.grid',
    options: {
      position: [0, 0],
      color: [0.9, 0.9, 0.9, 1],
      line: { width: 0.002 },
      xStep: 0.1,
      yStep: 0.1,
      bounds: figure.limits._dup(),
    },
  },
  {
    name: '__majorGrid',
    make: 'primitives.grid',
    options: {
      position: [0, 0],
      color: [0.9, 0.9, 0.9, 1],
      line: { width: 0.005 },
      xStep: 0.5,
      yStep: 0.5,
      bounds: figure.limits._dup(),
    },
  },
  {
    name: '__origin',
    make: 'primitives.polygon',
    options: {
      color: [0.9, 0.9, 0.9, 1],
      radius: 0.025,
      sides: 10,
    },
  },
]);

${initialization}
figure.timeKeeper.setManualFrames();
figure.timeKeeper.frame(0);
figure.animateNextFrame();
`;

  const tests = [];
  Object.keys(examples).forEach((key) => {
    const value = examples[key];
    tests.push([key, value]);
  });

  jest.setTimeout(120000);
  fs.writeFileSync(`${__dirname}/index.js`, `${start}`);
  test.each(tests)('%s',
    async (id, code) => {
      await jestPlaywright.resetBrowser();
      await page.setViewportSize({ width: 500, height: 375 });
      await page.goto(`file://${__dirname}/index.html`);
      await page.evaluate(() => {
        figure.timeKeeper.setManualFrames();
      });
      await frame(0);
      await page.evaluate(([c]) => {
        eval(c);
      }, [code]);
      await frame(0);
      const remainingDuration = await page.evaluate(() => figure.getRemainingAnimationTime());
      let image = await page.screenshot();
      expect(image).toMatchImageSnapshot({
        customSnapshotIdentifier: `${id}-00000`,
        failureThreshold: threshold,
        customSnapshotsDir: `${__dirname}/${snapshots}`,
      });
      if (remainingDuration > 0) {
        const timeStep = 0.5;
        const steps = Math.ceil(remainingDuration / timeStep) + 2;
        for (let i = 1; i <= steps; i += 1) {
          await frame(timeStep);
          image = await page.screenshot();
          // eslint-disable-next-line jest/no-conditional-expect
          expect(image).toMatchImageSnapshot({
            customSnapshotIdentifier: `${id}-${zeroPad(Math.floor(timeStep * i * 1000), 5)}`,
            failureThreshold: threshold,
            customSnapshotsDir: `${__dirname}/${snapshots}`,
          });
        }
      }
    });
}

module.exports = {
  tester,
};
