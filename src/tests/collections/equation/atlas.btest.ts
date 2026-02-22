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

describe('Equation Atlas', () => {
  beforeEach(async () => {
    await loadPage();
  });
  describe('Create', () => {
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
      await loadFontSync('montserrat', 'normal', '400', 'latin');
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
      await loadFontSync('montserrat', 'normal', '400', 'latin');
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
      // Initially as forms are lazyly laid out by default, only form 0 will
      // have an actual width
      const w01 = await page.evaluate(() => figure.elements._eqn.eqn.forms['0'].width);
      expect(w01).toBeGreaterThan(0);

      // Form 1 will have 0 width
      const w11 = await page.evaluate(() => figure.elements._eqn.eqn.forms['1'].width);
      expect(w11).toEqual(0);

      await snap();

      // On loading the font, form 0 should be re-laid out getting a new width
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(200);
      const w02 = await page.evaluate(() => figure.elements._eqn.eqn.forms['0'].width);
      expect(w02).toBeGreaterThan(w01);

      // Form one is not set, so it is not rearranged when font is loaded
      const w12 = await page.evaluate(() => figure.elements._eqn.eqn.forms['1'].width);
      expect(w12).toBe(0);
      await snap();

      // We can now show form 1 which will lay it out based on the loaded font
      // widths
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
      // Both forms will have defined widths
      const w01 = await page.evaluate(() => figure.elements._eqn.eqn.forms['0'].width);
      expect(w01).toBeGreaterThan(0);
      const w11 = await page.evaluate(() => figure.elements._eqn.eqn.forms['1'].width);
      expect(w11).toBeGreaterThan(0);
      const set01 = await page.evaluate(() => figure.get('eqn').eqn.forms['0'].positionsSet);
      expect(set01).toEqual(true);
      const set11 = await page.evaluate(() => figure.get('eqn').eqn.forms['1'].positionsSet);
      expect(set11).toEqual(true);
      await snap();

      // On loading the font, form 0 should be re-laid out getting a new width
      // Form 1 should simply have its positionsSet to be false
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(200);
      const w02 = await page.evaluate(() => figure.elements._eqn.eqn.forms['0'].width);
      expect(w02).toBeGreaterThan(w01);

      // Form one is not set, so it is not rearranged when font is loaded
      const w12 = await page.evaluate(() => figure.elements._eqn.eqn.forms['1'].width);
      expect(w12).toEqual(w01);
      const set02 = await page.evaluate(() => figure.get('eqn').eqn.forms['0'].positionsSet);
      expect(set02).toEqual(true);
      const set12 = await page.evaluate(() => figure.get('eqn').eqn.forms['1'].positionsSet);
      expect(set12).toEqual(false);
      await snap();

      // We can now show form 1 which will lay it out based on the loaded font
      // widths
      await page.evaluate(() => {
        figure.elements._eqn.showForm('1');
      });
      const w13 = await page.evaluate(() => figure.elements._eqn.eqn.forms['1'].width);
      expect(w13).toBeGreaterThan(w12);
      await snap();
    });
  });
});


// ff = new FontFace('monserrat', 'url(http://localhost:8080//src/tests/misc/fonts/montserrat/montserrat-normal-400-latin.woff2)');
// ff.load().then(function(loaded_face) {
//   document.fonts.add(loaded_face);
// });
