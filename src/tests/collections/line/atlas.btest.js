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

test.describe('Line Atlas', () => {
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
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
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
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      // still hidden
      await snap();
      await peval(() => figure.get('line').show());
      // shown with new layou
      await snap();
    });
  });
});
