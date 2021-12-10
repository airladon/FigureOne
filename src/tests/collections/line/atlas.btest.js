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
  await page.goto(`http://localhost:8080/${__dirname.replace('/home/pwuser', '')}/atlas.html`);
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

// async function frame() {
//   await page.evaluate(() => new Promise((resolve) => {
//     figure.notifications.add('afterDraw', () => resolve(), 1);
//     figure.animateNextFrame();
//   }), []);
// }

// eslint-disable-next-line no-unused-vars
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function peval(callback, params) {
  return page.evaluate(callback, params);
}

describe('Line Atlas', () => {
  beforeEach(async () => {
    await loadPage();
  });
  describe('Create', () => {
    test('Simple', async () => {
      await page.evaluate(() => {
        figure.add({
          name: 'line',
          make: 'collections.line',
          length: 1,
          width: 0.01,
          label: {
            text: {
              render: 'gl',
              forms: { base: ['a', 'b', 'c'] },
              textFont: {
                family: 'montserrat', weight: '200', glyphs: 'latin', size: 0.3,
              },
            },
          },
        });
      });
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(200);
      await snap();
    });
    test('Hidden', async () => {
      await page.evaluate(() => {
        figure.add({
          name: 'line',
          make: 'collections.line',
          length: 1,
          width: 0.01,
          label: {
            text: {
              render: 'gl',
              forms: { base: ['a', 'b', 'c'] },
              textFont: {
                family: 'montserrat', weight: '200', glyphs: 'latin', size: 0.3,
              },
            },
          },
        });
      });
      // shown
      await snap();
      await peval(() => figure.get('line').hide());
      // hidden
      await snap();
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(200);
      // still hidden
      await snap();
      await peval(() => figure.get('line').show());
      // shown with new layou
      await snap();
    });
  });
});


// ff = new FontFace('monserrat', 'url(http://localhost:8080//src/tests/misc/fonts/montserrat/montserrat-normal-400-latin.woff2)');
// ff.load().then(function(loaded_face) {
//   document.fonts.add(loaded_face);
// });
