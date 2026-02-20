/* eslint-disable no-await-in-loop, */

const { test } = require('../../legacyFixtures');

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

test.describe('Angle Atlas', () => {
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
    await page.goto(`http://localhost:8080/${__dirname.replace('/home/pwuser', '')}/atlas.html`);
  });

  async function snap() {
    const image = await page.screenshot();
    legacySnap(image);
  }

  async function peval(callback, params) {
    return page.evaluate(callback, params);
  }

  test.describe('Create', () => {
    test('Simple', async () => {
      await page.evaluate(() => {
        figure.add({
          name: 'angle',
          make: 'collections.angle',
          label: {
            text: {
              forms: { base: ['a', 'b', 'c'] },
              textFont: { family: 'montserrat', glyphs: 'latin', render: 'gl' },
            },
          },
          angle: Math.PI / 4,
          curve: { width: 0.01 },
          sides: true,
        });
      });
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      await snap();
    });
    test('Two forms', async () => {
      await page.evaluate(() => {
        figure.add({
          name: 'angle',
          make: 'collections.angle',
          label: {
            text: {
              forms: { base: ['a', 'b', 'c'], 1: ['b', 'd', 'c'] },
              textFont: { family: 'montserrat', glyphs: 'latin', render: 'gl' },
            },
          },
          angle: Math.PI / 4,
          curve: { width: 0.01 },
          sides: true,
        });
      });
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      await snap();
      await peval(() => figure.get('angle').label.showForm('base'));
      await snap();
    });
    test('Hidden', async () => {
      await page.evaluate(() => {
        figure.add({
          name: 'angle',
          make: 'collections.angle',
          label: {
            text: {
              forms: { base: ['a', 'b', 'c'] },
              textFont: { family: 'montserrat', glyphs: 'latin', render: 'gl' },
            },
          },
          angle: Math.PI / 4,
          curve: { width: 0.01 },
          sides: true,
        });
      });
      // shown
      await snap();
      await peval(() => figure.get('angle').hide());
      // hidden
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      // still hidden
      await snap();
      await peval(() => figure.get('angle').show());
      // shown with new layou
      await snap();
    });
    test('Two weights', async () => {
      await page.evaluate(() => {
        figure.add({
          name: 'angle',
          make: 'collections.angle',
          label: {
            text: {
              forms: { base: ['a', 'b', 'c'] },
              textFont: {
                family: 'montserrat', weight: '200', glyphs: 'latin', render: 'gl',
              },
            },
          },
          angle: Math.PI / 4,
          curve: { width: 0.01 },
          sides: true,
        });
      });
      await peval(() => {
        figure.fonts.watch(
          figure.get('angle')._label._a,
          {
            weights: 2,
            timeout: 10,
            callback: () => {
              figure.get('angle').recreateAtlases();
            },
          },
        );
      });
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '800', 'latin');
      await sleep(200);
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '200', 'latin');
      await sleep(1000);
      await snap();
    });
    test('Two weights - late watch', async () => {
      await page.evaluate(() => {
        figure.add({
          name: 'angle',
          make: 'collections.angle',
          label: {
            text: {
              forms: { base: ['a', 'b', 'c'] },
              textFont: {
                family: 'montserrat', weight: '200', glyphs: 'latin', render: 'gl',
              },
            },
          },
          angle: Math.PI / 4,
          curve: { width: 0.01 },
          sides: true,
        });
      });
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '800', 'latin');
      await sleep(200);
      await snap();
      await peval(() => {
        figure.fonts.watch(
          figure.get('angle')._label._a,
          {
            weights: 2,
            timeout: 10,
            callback: () => {
              figure.get('angle').recreateAtlases();
            },
          },
        );
      });
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '200', 'latin');
      await sleep(1000);
      await snap();
    });
  });
});
