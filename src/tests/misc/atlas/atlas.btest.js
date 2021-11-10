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
  await page.goto(`http://localhost:8080/${__dirname.replace('/home/pwuser', '')}/index.html`);
}

async function isAvailable(font) {
  return page.evaluate(
    f => figure.fonts.isAvailable(f),
    font,
  );
}
async function setLoaded() {
  return page.evaluate(
    () => { figure.loaded = 0; },
  );
}

async function watch(font, timeout = 5) {
  return page.evaluate(
    ([f, t]) => {
      figure.fonts.watch(f, { callback: () => { figure.loaded += 1; }, timeout: t });
    },
    [font, timeout],
  );
}

async function getLoaded() {
  return page.evaluate(
    () => figure.loaded,
  );
}

async function getFontManager() {
  return page.evaluate(
    () => figure.fonts,
  );
}

async function getAtlases() {
  return page.evaluate(
    () => figure.webglLow.atlases,
  );
}

async function getWeights(font) {
  return page.evaluate(
    f => figure.fonts.getWeights(f),
    font,
  );
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

async function frame() {
  await page.evaluate(() => new Promise((resolve) => {
    figure.notifications.add('afterDraw', () => resolve(), 1);
    figure.animateNextFrame();
  }), []);
}

// eslint-disable-next-line no-unused-vars
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Atlas', () => {
  beforeEach(async () => {
    await loadPage();
  });
  describe('Create', () => {
    beforeEach(async () => {
      await page.evaluate(() => {
        figure.add({
          name: 'a',
          make: 'txt',
          text: 'hello',
          font: { family: 'montserrat', weight: '400', glyphs: 'latin' },
          type: 'bmp',
        });
      });
      await frame();
    });
    test('Simple', async () => {
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      await snap();
    });
    test('Two weights auto', async () => {
      await snap();
      await loadFontSync('montserrat', 'normal', '100', 'latin');
      await sleep(100);
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      await snap();
    });
    test('Two weights force', async () => {
      await snap();
      await loadFontSync('montserrat', 'normal', '900', 'latin');
      await sleep(100);
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await page.evaluate(() => figure.get('a').recreateAtlas());
      await sleep(100);
      await snap();
    });
  });
});


// // const image = await page.screenshot({ fullPage: true });
// // expect(image).toMatchImageSnapshot();

// f = 'open sans'; g = 'greek'; s = 'normal'; w = '400';
// fd = f.split(' ').join('-');
// ff = new FontFace('open sans', `url(http://localhost:8080//src/tests/misc/FontManager/fonts/${f}/${f}-${s}-${w}-${g}.woff2)`, { style: s, weight: w })
// ff.load().then(function(loaded_face) {
//   document.fonts.add(loaded_face);
// });
