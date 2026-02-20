/* eslint-disable no-await-in-loop, */

const { test, expect } = require('../../legacyFixtures');

async function loadFontSync(page, family, style, weight, glyphs) {
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test.describe('Axis Font', () => {
  let page;
  let legacySnap;

  test.beforeEach(async ({ page: p, legacySnap: ls }) => {
    page = p;
    legacySnap = ls;
    page.on('console', (msg) => {
      for (let i = 0; i < msg.args().length; i += 1) {
        // eslint-disable-next-line no-console
        console.log(`${i}: ${msg.args()[i]}`);
      }
    });
    await page.goto(`http://localhost:8080/${__dirname.replace('/home/pwuser', '')}/font.html`);
  });

  async function snap() {
    const image = await page.screenshot();
    legacySnap(image);
  }

  async function makePlot(t) {
    return page.evaluate((render) => {
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
        font: { family: 'montserrat', glyphs: 'latin', render },
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

  test.describe('Create', () => {
    test('Simple BMP', async () => {
      await makePlot('gl');
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(500);
      await snap();
      const gl = await numGL('plot');
      const d2 = await num2D('plot');
      expect(gl).toBe(7);
      expect(d2).toBe(0);
    });
    test('Simple 2D', async () => {
      await makePlot('2d');
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      await snap();
      const gl = await numGL('plot');
      const d2 = await num2D('plot');
      expect(gl).toBe(0);
      expect(d2).toBe(7);
    });
    test('Hide BMP', async () => {
      await makePlot('gl');
      await snap();
      await page.evaluate(() => figure.get('plot').hide());
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
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
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      await snap();
      await page.evaluate(() => figure.get('plot').show());
      await snap();
      const gl = await numGL('plot');
      const d2 = await num2D('plot');
      expect(gl).toBe(0);
      expect(d2).toBe(7);
    });
  });
});
