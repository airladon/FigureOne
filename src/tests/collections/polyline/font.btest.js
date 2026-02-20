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

  async function makeShape(t) {
    return page.evaluate((render) => {
      figure.add({
        name: 'shape',
        make: 'collections.polyline',
        points: [[-0.8, 0.5], [0.8, 0.5], [0, -0.5]],
        close: true,
        makeValid: {
          shape: 'triangle',
          hide: {
            minAngle: Math.PI / 8,
          },
        },
        font: { family: 'montserrat', glyphs: '1234567890.\u00b0gh', render },
        side: {
          showLine: true,
          offset: 0.2,
          arrow: 'barb',
          width: 0.01,
          label: {
            text: null,
          },
        },
        angle: {
          label: null,
          curve: {
            radius: 0.2,
          },
        },
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
      await makeShape('gl');
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      await snap();
      const gl = await numGL('shape');
      const d2 = await num2D('shape');
      expect(gl).toBe(6);
      expect(d2).toBe(0);
    });
    test('Simple 2D', async () => {
      await makeShape('2d');
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      await snap();
      const gl = await numGL('shape');
      const d2 = await num2D('shape');
      expect(gl).toBe(0);
      expect(d2).toBe(6);
    });
    test('Hide BMP', async () => {
      await makeShape('gl');
      await snap();
      await page.evaluate(() => figure.get('shape').hide());
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      await snap();
      await page.evaluate(() => figure.get('shape').show());
      await snap();
      const gl = await numGL('shape');
      const d2 = await num2D('shape');
      expect(gl).toBe(6);
      expect(d2).toBe(0);
    });
    test('Hide 2D', async () => {
      await makeShape('2d');
      await snap();
      await page.evaluate(() => figure.get('shape').hide());
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      await snap();
      await page.evaluate(() => figure.get('shape').show());
      await snap();
      const gl = await numGL('shape');
      const d2 = await num2D('shape');
      expect(gl).toBe(0);
      expect(d2).toBe(6);
    });
  });
});
