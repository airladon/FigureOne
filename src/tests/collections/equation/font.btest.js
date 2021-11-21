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

async function makeShape(t) {
  return page.evaluate((type) => {
    figure.add({
      name: 'shape',
      make: 'equation',
      forms: { 0: ['aa', 'bb', 'cc'] },
      textFont: { family: 'montserrat', glyphs: 'latin', type: '2d' },
      position: [0, 0.5],
      type,
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

describe('Text Font', () => {
  beforeEach(async () => {
    await loadPage();
  });
  describe('Create', () => {
    test('Simple BMP', async () => {
      await makeShape('bmp');
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      await snap();
      const gl = await numGL('shape');
      const d2 = await num2D('shape');
      expect(gl).toBe(3);
      expect(d2).toBe(0);
    });
    test('Simple 2D', async () => {
      await makeShape('2d');
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      await snap();
      const gl = await numGL('shape');
      const d2 = await num2D('shape');
      expect(gl).toBe(0);
      expect(d2).toBe(3);
    });
    test('Hide BMP', async () => {
      await makeShape('bmp');
      await snap();
      await page.evaluate(() => figure.get('shape').hide());
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      await snap();
      await page.evaluate(() => figure.get('shape').show());
      await snap();
      const gl = await numGL('shape');
      const d2 = await num2D('shape');
      expect(gl).toBe(3);
      expect(d2).toBe(0);
    });
    test('Hide 2D', async () => {
      await makeShape('2d');
      await snap();
      await page.evaluate(() => figure.get('shape').hide());
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      await snap();
      await page.evaluate(() => figure.get('shape').show());
      await snap();
      const gl = await numGL('shape');
      const d2 = await num2D('shape');
      expect(gl).toBe(0);
      expect(d2).toBe(3);
    });
  });
});


// ff = new FontFace('monserrat', 'url(http://localhost:8080//src/tests/misc/fonts/montserrat/montserrat-normal-400-latin.woff2)');
// ff.load().then(function(loaded_face) {
//   document.fonts.add(loaded_face);
// });
