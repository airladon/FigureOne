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

/* eslint-disable max-len, object-curly-newline */
const externalAtlasMap = {
  a: { width: 88.91763305664062, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 2624.6404376559785, offsetY: 3053.8777777777777 },
  b: { width: 97.66107177734375, ascent: 119.91666666666666, descent: 6.395555555555555, offsetX: 1959.3195071750217, offsetY: 2862.011111111111 },
  c: { width: 88.91763305664062, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 1514.7313418918186, offsetY: 2862.011111111111 },
  d: { width: 97.66107177734375, ascent: 119.91666666666666, descent: 6.395555555555555, offsetX: 3069.2286029391817, offsetY: 3053.8777777777777 },
  e: { width: 88.91763305664062, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 1871.2996020846897, offsetY: 1518.9444444444448 },
  f: { width: 53.24128723144531, ascent: 119.91666666666666, descent: 6.395555555555555, offsetX: 3313.381282382541, offsetY: 3053.8777777777777 },
  g: { width: 97.66107177734375, ascent: 87.9388888888889, descent: 39.97222222222222, offsetX: 159.88888888888889, offsetY: 2862.011111111111 },
  h: { width: 97.66107177734375, ascent: 119.91666666666666, descent: 6.395555555555555, offsetX: 404.0415683322483, offsetY: 2862.011111111111 },
  i: { width: 44.41978454589844, ascent: 119.91666666666666, descent: 6.395555555555555, offsetX: 2025.285617404514, offsetY: 3053.8777777777777 },
  j: { width: 44.41978454589844, ascent: 119.91666666666666, descent: 39.97222222222222, offsetX: 648.1942477756077, offsetY: 2862.011111111111 },
  k: { width: 88.91763305664062, ascent: 119.91666666666666, descent: 6.395555555555555, offsetX: 759.2437091403538, offsetY: 2862.011111111111 },
  l: { width: 44.41978454589844, ascent: 119.91666666666666, descent: 6.395555555555555, offsetX: 981.5377917819553, offsetY: 2862.011111111111 },
  m: { width: 142.158935546875, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 2447.6248660617402, offsetY: 2862.011111111111 },
  n: { width: 97.66107177734375, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 2203.472186618381, offsetY: 2862.011111111111 },
  o: { width: 97.66107177734375, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 2136.33507876926, offsetY: 3053.8777777777777 },
  p: { width: 97.66107177734375, ascent: 87.9388888888889, descent: 39.97222222222222, offsetX: 2315.8877673678926, offsetY: 1518.9444444444448 },
  q: { width: 97.66107177734375, ascent: 87.9388888888889, descent: 39.97222222222222, offsetX: 492.8421130710178, offsetY: 3053.8777777777777 },
  r: { width: 62.21891784667969, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 1270.1883426242405, offsetY: 3053.8777777777777 },
  s: { width: 88.91763305664062, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 2846.93452029758, offsetY: 3053.8777777777777 },
  t: { width: 53.24128723144531, ascent: 119.91666666666666, descent: 6.395555555555555, offsetX: 1425.7356372409397, offsetY: 3053.8777777777777 },
  u: { width: 97.66107177734375, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 1781.1329379611545, offsetY: 3053.8777777777777 },
  v: { width: 88.91763305664062, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 1737.0254245334202, offsetY: 2862.011111111111 },
  w: { width: 124.35978698730469, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 736.9947925143772, offsetY: 3053.8777777777777 },
  x: { width: 88.91763305664062, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 2093.593684726291, offsetY: 1518.9444444444448 },
  y: { width: 88.91763305664062, ascent: 87.9388888888889, descent: 39.97222222222222, offsetX: 1558.838855319553, offsetY: 3053.8777777777777 },
  z: { width: 79.94000244140625, ascent: 87.9388888888889, descent: 6.395555555555555, offsetX: 1092.5872531467014, offsetY: 2862.011111111111 },
  fontSize: 90,
  dimension: 3597,
};
/* eslint-enable max-len, object-curly-newline */

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
    test('Two weights watch', async () => {
      await snap();
      await page.evaluate(() => figure.fonts.watch(
        { family: 'montserrat', glyphs: 'latin' },
        {
          weights: 2,
          callback: () => figure.get('a').recreateAtlas(),
        },
      ));
      await loadFontSync('montserrat', 'normal', '900', 'latin');
      await sleep(100);
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(1000);
      await snap();
    });
  });
  describe('External', () => {
    test('Simple', async () => {
      page.evaluate((map) => {
        figure.add({
          name: 'a',
          make: 'txt',
          text: 'hello',
          font: {
            src: 'http://localhost:8080/src/tests/misc/atlas/atlas.png',
            map,
            loadColor: [0, 0, 1, 1],
            atlasColor: true,
          },
          type: 'bmp',
        });
      }, externalAtlasMap);
      await snap();
      await frame();
      await sleep(1000);
      await frame();
      await snap();
    });
    test('Two same', async () => {
      await page.evaluate((map) => {
        figure.add({
          name: 'a',
          make: 'txt',
          text: 'hello',
          font: {
            src: 'http://localhost:8080/src/tests/misc/atlas/atlas.png',
            map,
            loadColor: [0, 0, 1, 1],
            atlasColor: true,
          },
          type: 'bmp',
        });
      }, externalAtlasMap);
      await page.evaluate((map) => {
        figure.add({
          name: 'b',
          make: 'txt',
          text: 'world',
          font: {
            src: 'http://localhost:8080/src/tests/misc/atlas/atlas.png',
            map,
            loadColor: [0, 0, 1, 1],
            atlasColor: true,
          },
          type: 'bmp',
          position: [0, -0.5],
        });
      }, externalAtlasMap);
      await sleep(1000);
      await frame();
      await snap();
      expect(await page.evaluate(() => Object.keys(figure.webglLow.atlases).length)).toBe(1);
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
