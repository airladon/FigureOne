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
    method: 'primitives.grid',
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
    method: 'primitives.grid',
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
    method: 'primitives.polygon',
    options: {
      color: [0.9, 0.9, 0.9, 1],
      radius: 0.025,
      sides: 10,
    },
  },
]);

${initialization}

figure.globalAnimation.setManualFrames();
figure.globalAnimation.frame(0);
`;

  const tests = [];
  Object.keys(examples).forEach((key) => {
    const value = examples[key];
    tests.push([key, value]);
  });

  jest.setTimeout(60000);
  fs.writeFileSync(`${__dirname}/index.js`, `${start}`);
  test.each(tests)('%s',
    async (id, code) => {
      await jestPlaywright.resetBrowser();
      await page.setViewportSize({ width: 500, height: 375 });
      await page.goto(`file://${__dirname}/index.html`);
      await page.evaluate(([c]) => {
        figure.globalAnimation.setManualFrames();
        figure.globalAnimation.frame(0);
        eval(c);
        figure.globalAnimation.frame(0);
      }, [code]);
      const remainingDuration = await page.evaluate(() => figure.getRemainingAnimationTime());
      let image = await page.screenshot({ fullPage: true });
      expect(image).toMatchImageSnapshot({
        customSnapshotIdentifier: `${id}-00000`,
        failureThreshold: threshold,
        customSnapshotsDir: `${__dirname}/${snapshots}`,
      });
      if (remainingDuration > 0) {
        // const num = 5;
        const timeStep = 0.5;
        const steps = Math.ceil(remainingDuration / timeStep) + 2;
        for (let i = 1; i <= steps; i += 1) {
          if (id.endsWith('1ff30952')) {
            // console.log(timeStep, timeStep * i * 1000)
          }
          await page.evaluate(([t]) => figure.globalAnimation.frame(t), [timeStep]);
          image = await page.screenshot({ fullPage: true });
          expect(image).toMatchImageSnapshot({
            customSnapshotIdentifier: `${id}-${zeroPad(Math.floor(timeStep * i * 1000), 5)}`,
            failureThreshold: threshold,
            customSnapshotsDir: `${__dirname}/${snapshots}`,
          });
        }
      }
      // if (id.endsWith('1ff30952')) {
      //   fs.writeFileSync(`${__dirname}/index.js`, `${start}\n${code}`);
      // }
    });
}

module.exports = {
  tester,
};
