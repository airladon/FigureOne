/* eslint-disable no-await-in-loop, import/no-unresolved, no-eval */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* global figure page */

const Path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const files = [];

function zeroPad(num, places) {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join('0') + num;
}

function ThroughDirectory(directory) {
  fs.readdirSync(directory).forEach((file) => {
    const absolutePath = Path.join(directory, file);
    if (fs.statSync(absolutePath).isDirectory()) {
      ThroughDirectory(absolutePath);
      return;
    }
    if (
      absolutePath.endsWith('js')
      && !absolutePath.endsWith('test.js')
    ) {
      files.push(absolutePath);
    }
  });
}

ThroughDirectory(`${__dirname}/../../js`);

const examples = {};
for (let i = 0; i < files.length; i += 1) {
  let lastInterfaceName = '';
  const file = files[i];
  const data = fs.readFileSync(file, 'UTF-8');
  const lines = data.split(/\r?\n/);
  const uniqueFileId = file.match(/\/src\/.*/)[0]
    .replace(/\/src\/js\//, '').replace(/\//g, '.');
  let inExample = false;
  let currentExample = [];
  let unnamedExamples = {};
  let interfaceName = '';
  let readInterfaceName = false;
  const addExample = (e, c) => {
    const code = c.join('\n');
    const hash = crypto.createHash('sha1').update(code).digest('hex').slice(0, 8);
    e[hash] = code;
  };
  lines.forEach((line) => {
    if (line.match(/^ *\/\*/)) {
      interfaceName = '';
    }
    if (line.match(/^ *\* *@example/)) {
      if (inExample) {
        addExample(unnamedExamples, currentExample);
        currentExample = [];
      }
      inExample = true;
      return;
    }
    if (inExample && line.match(/^ *\*\//)) {
      inExample = false;
      addExample(unnamedExamples, currentExample);
      currentExample = [];
      readInterfaceName = true;
      return;
    }
    if (inExample) {
      currentExample.push(line.slice().replace(/^ *\*/, ''));
    }
    if (readInterfaceName && !line.match(/^ *\/\//) && !line.match(/^ *\/\*/)) {
      let updateName = true;
      let nameFound = true;
      if (line.match(/^ *export type/)) {
        [, interfaceName] = line.match(/export type ([^ ]*)/);
      } else if (line.match(/^ *class/)) {
        [, interfaceName] = line.match(/class ([^ ]*)/);
      } else if (line.match(/function/)) {
        [, interfaceName] = line.match(/function ([^(]*)/);
      } else if (line.match(/^ *export default class/)) {
        [, interfaceName] = line.match(/class ([^ ]*)/);
      } else if (line.match(/^ *export class/)) {
        [, interfaceName] = line.match(/class ([^ ]*)/);
      } else if (line.match(/^ *type/)) {
        [, interfaceName] = line.match(/type ([^ ]*)/);
      } else if (line != null && line !== '') {
        [, interfaceName] = line.match(/^ *([^(]*)/);
        updateName = false;
      } else {
        nameFound = false;
      }
      if (!nameFound) {
        return;
      }
      if (updateName) {
        lastInterfaceName = interfaceName;
      } else {
        interfaceName = `${lastInterfaceName}.${interfaceName}`;
      }
      readInterfaceName = false;
      Object.keys(unnamedExamples).forEach((hash) => {
        const id = `${uniqueFileId}.${interfaceName}.${hash}`;
        examples[id] = unnamedExamples[hash];
      });
      unnamedExamples = {};
    }
  });
}

const start = `
const figure = new Fig.Figure({ limits: [-3, -2.25, 6, 4.5], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

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

const pow = (pow = 2, stop = 10, step = 0.05) => {
  const xValues = Fig.tools.math.range(0, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** pow));
};

// shape to animate
figure.add(
  {
    name: 'p',
    method: 'polygon',
    options: {
      sides: 4,
      radius: 0.5,
      position: [0, 0],
    },
  },
);
const p = figure.getElement('p');
figure.globalAnimation.setManualFrames();
figure.globalAnimation.frame(0);
`;

let tests = [];
Object.keys(examples).forEach((key) => {
  const value = examples[key];
  tests.push([key, value]);
});

jest.setTimeout(60000);
tests = tests.slice(0, 3);
fs.writeFileSync(`${__dirname}/index.js`, `${start}`);
test.each(tests)('%s',
  async (id, code) => {
    await jestPlaywright.resetBrowser();
    await page.setViewportSize({ width: 500, height: 375 });
    await page.goto(`file:/${__dirname}/index.html`);
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
    });
    if (remainingDuration > 0) {
      // const num = 5;
      const timeStep = 0.5;
      const steps = Math.ceil(remainingDuration / timeStep);
      for (let i = 1; i <= steps; i += 1) {
        if (id.endsWith('1ff30952')) {
          // console.log(timeStep, timeStep * i * 1000)
        }
        await page.evaluate(([t]) => figure.globalAnimation.frame(t), [timeStep]);
        image = await page.screenshot({ fullPage: true });
        expect(image).toMatchImageSnapshot({
          customSnapshotIdentifier: `${id}-${zeroPad(Math.floor(timeStep * i * 1000), 5)}`,
        });
      }
    }
    if (id.endsWith('1ff30952')) {
      fs.writeFileSync(`${__dirname}/index.js`, `${start}\n${code}`);
    }
  });

