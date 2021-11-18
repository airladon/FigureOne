/* globals page figure */
/* eslint-disable no-await-in-loop, */

// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(120000);

page.on('console', (msg) => {
  for (let i = 0; i < msg.args().length; i += 1) {
    // eslint-disable-next-line no-console
    console.log(`${i}: ${msg.args()[i]}`);
  }
});

async function loadPage() {
  await page.goto(`http://localhost:8080/${__dirname.replace('/home/pwuser', '')}/font.html`);
}


async function loadFontSync(family, style, weight, glyphs) {
  return page.evaluate(
    ([f, s, w, g]) => {
      const fd = f.split(' ').join('-');
      const ff = new FontFace(f, `url(http://localhost:8080//src/tests/misc/fonts/${fd}/${fd}-${s}-${w}-${g}.woff2)`, { style: s, weight: w });
      return new Promise(resolve => ff.load().then((loaded) => {
        document.fonts.add(loaded);
        resolve();
      }));
    },
    [family, style, weight, glyphs],
  );
}

async function snap(id, threshold = 0) {
  const image = await page.screenshot({ timeout: 300000 });
  return expect(image).toMatchImageSnapshot({
    // customSnapshotIdentifier: `${id}`,
    failureThreshold: threshold,
  });
}


// eslint-disable-next-line no-unused-vars
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function peval(callback, params) {
  return page.evaluate(callback, params);
}

async function makePlot(t) {
  return page.evaluate((type) => {
    const pow = (p = 2, start = 0, stop = 10, step = 0.05) => {
      const xValues = Fig.range(start, stop, step);
      return xValues.map(x => new Fig.Point(x, x ** p));
    };
    figure.add({
      name: 'plot',
      make: 'collections.plot',
      width: 1,
      height: 1,
      position: [-0.6, -0.5],
      y: { title: 'y Axis' },
      x: { title: 'x Axis' },
      font: { family: 'montserrat', glyphs: 'latin', type },
      trace: [
        { points: pow(1.5), name: 'Power 1.5' },
        {
          points: pow(2, 0, 10, 0.5),
          name: 'Power 2',
          markers: { sides: 4, radius: 0.03 },
        },
        {
          points: pow(3, 0, 10, 0.5),
          name: 'Power 3',
          markers: { radius: 0.03, sides: 10, line: { width: 0.005 } },
          line: { dash: [0.04, 0.01] },
        },
      ],
      legend: {
        frame: { line: { width: 0.01 }, space: 0.05 },
      },
      frame: true,
    });
  }, t);
}

async function numGL(name) {
  return page.evaluate((n) => {
    const gls = figure.get(n).getAllPrimitives().filter(e => e.text != null);
    return gls.length;
  }, name);
}

async function num2D(name) {
  return page.evaluate((n) => {
    const d2s = figure.get(n).getAllPrimitives()
      .filter(e => e.drawingObject != null && e.drawingObject.text != null);
    return d2s.length;
  }, name);
}

describe('Axis Font', () => {
  beforeEach(async () => {
    await loadPage();
  });
  describe('Create', () => {
    test('Simple BMP', async () => {
      await makePlot('bmp');
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      await snap();
      const gl = await numGL('plot');
      const d2 = await num2D('plot');
      expect(gl).toBe(7);
      expect(d2).toBe(0);
    });
    test('Simple 2D', async () => {
      await makePlot('2d');
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      await snap();
      const gl = await numGL('plot');
      const d2 = await num2D('plot');
      expect(gl).toBe(0);
      expect(d2).toBe(7);
    });
    test('Hide BMP', async () => {
      await makePlot('bmp');
      await snap();
      await page.evaluate(() => figure.get('plot').hide());
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      await snap();
      await page.evaluate(() => figure.get('plot').show());
      await snap();
      const gl = await numGL('plot');
      const d2 = await num2D('plot');
      expect(gl).toBe(7);
      expect(d2).toBe(0);
    });
    test('Hide 2D', async () => {
      await makePlot('2d');
      await snap();
      await page.evaluate(() => figure.get('plot').hide());
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      await snap();
      await page.evaluate(() => figure.get('plot').show());
      await snap();
      const gl = await numGL('plot');
      const d2 = await num2D('plot');
      expect(gl).toBe(0);
      expect(d2).toBe(7);
    });
    // test('Labels title diff', async () => {
    //   await page.evaluate(() => {
    //     figure.add({
    //       name: 'axis',
    //       make: 'collections.axis',
    //       start: 0,
    //       stop: 10,
    //       font: {
    //         type: 'bmp', family: 'montserrat', glyphs: 'latin', size: 0.1, weight: '100',
    //       },
    //       labels: {
    //         font: { weight: '400' },
    //       },
    //       title: { text: ['time', '(s)'] },
    //     });
    //   });
    //   await peval(() => {
    //     figure.fonts.watch(
    //       figure.get('axis'),
    //       {
    //         weights: 2,
    //         timeout: 10,
    //         callback: () => {
    //           figure.get('axis').recreateAtlases();
    //         },
    //       },
    //     );
    //   });
    //   await snap();
    //   await loadFontSync('montserrat', 'normal', '400', 'latin');
    //   await sleep(100);
    //   await snap();
    //   await loadFontSync('montserrat', 'normal', '100', 'latin');
    //   await sleep(500);
    //   await snap();
    // });
    // test('Hidden', async () => {
    //   await page.evaluate(() => {
    //     figure.add({
    //       name: 'axis',
    //       make: 'collections.axis',
    //       start: 0,
    //       stop: 10,
    //       font: {
    //         type: 'bmp', family: 'montserrat', glyphs: 'latin', size: 0.1,
    //       },
    //       title: { text: ['time', '(s)'] },
    //     });
    //   });
    //   // shown
    //   await snap();
    //   await peval(() => figure.get('axis').hide());
    //   // hidden
    //   await snap();
    //   await loadFontSync('montserrat', 'normal', '400', 'latin');
    //   await sleep(100);
    //   // still hidden
    //   await snap();
    //   await peval(() => figure.get('axis').show());
    //   // shown with new layou
    //   await snap();
    // });
  });
});


// ff = new FontFace('monserrat', 'url(http://localhost:8080//src/tests/misc/fonts/montserrat/montserrat-normal-400-latin.woff2)');
// ff.load().then(function(loaded_face) {
//   document.fonts.add(loaded_face);
// });
