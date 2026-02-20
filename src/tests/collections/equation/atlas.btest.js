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

test.describe('Equation Atlas', () => {
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

  test.describe('Create', () => {
    test('Simple', async () => {
      await page.evaluate(() => {
        figure.add({
          name: 'eqn',
          make: 'equation',
          textFont: { family: 'montserrat', weight: '400', glyphs: 'latin' },
          forms: { 0: ['a', 'b', 'c'] },
        });
      });
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      await snap();
    });
    test('Stays hidden', async () => {
      await page.evaluate(() => {
        figure.add({
          name: 'eqn',
          make: 'equation',
          textFont: { family: 'montserrat', weight: '400', glyphs: 'latin' },
          forms: { 0: ['a', 'b', 'c'] },
        });
      });
      await snap();
      await page.evaluate(() => {
        figure.get('eqn').hide();
      });
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      await snap();
    });
    test('Two forms, one not set', async () => {
      await page.evaluate(() => {
        figure.add({
          name: 'eqn',
          make: 'equation',
          textFont: { family: 'montserrat', weight: '400', glyphs: 'latin' },
          forms: {
            0: ['a', 'b', 'c'],
            1: ['b', 'd', 'e'],
          },
        });
      });
      const w01 = await page.evaluate(() => figure.elements._eqn.eqn.forms['0'].width);
      expect(w01).toBeGreaterThan(0);
      const w11 = await page.evaluate(() => figure.elements._eqn.eqn.forms['1'].width);
      expect(w11).toEqual(0);
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      const w02 = await page.evaluate(() => figure.elements._eqn.eqn.forms['0'].width);
      expect(w02).toBeGreaterThan(w01);
      const w12 = await page.evaluate(() => figure.elements._eqn.eqn.forms['1'].width);
      expect(w12).toBe(0);
      await snap();
      await page.evaluate(() => {
        figure.elements._eqn.showForm('1');
      });
      const w13 = await page.evaluate(() => figure.elements._eqn.eqn.forms['1'].width);
      expect(w13).toBeGreaterThan(0);
      await snap();
    });
    test('Two forms, both set', async () => {
      await page.evaluate(() => {
        const a = figure.add({
          name: 'eqn',
          make: 'equation',
          textFont: { family: 'montserrat', weight: '400', glyphs: 'latin' },
          forms: {
            0: ['a', 'b', 'c'],
            1: ['b', 'd', 'e'],
          },
        });
        a.showForm('1');
        a.showForm('0');
      });
      const w01 = await page.evaluate(() => figure.elements._eqn.eqn.forms['0'].width);
      expect(w01).toBeGreaterThan(0);
      const w11 = await page.evaluate(() => figure.elements._eqn.eqn.forms['1'].width);
      expect(w11).toBeGreaterThan(0);
      const set01 = await page.evaluate(() => figure.get('eqn').eqn.forms['0'].positionsSet);
      expect(set01).toEqual(true);
      const set11 = await page.evaluate(() => figure.get('eqn').eqn.forms['1'].positionsSet);
      expect(set11).toEqual(true);
      await snap();
      await loadFontSync(page, 'montserrat', 'normal', '400', 'latin');
      await sleep(200);
      const w02 = await page.evaluate(() => figure.elements._eqn.eqn.forms['0'].width);
      expect(w02).toBeGreaterThan(w01);
      const w12 = await page.evaluate(() => figure.elements._eqn.eqn.forms['1'].width);
      expect(w12).toEqual(w01);
      const set02 = await page.evaluate(() => figure.get('eqn').eqn.forms['0'].positionsSet);
      expect(set02).toEqual(true);
      const set12 = await page.evaluate(() => figure.get('eqn').eqn.forms['1'].positionsSet);
      expect(set12).toEqual(false);
      await snap();
      await page.evaluate(() => {
        figure.elements._eqn.showForm('1');
      });
      const w13 = await page.evaluate(() => figure.elements._eqn.eqn.forms['1'].width);
      expect(w13).toBeGreaterThan(w12);
      await snap();
    });
  });
});
