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
async function areWeightsAvailable(font, weights) {
  return page.evaluate(
    ([f, w]) => figure.fonts.areWeightsAvailable(f, w),
    [font, weights],
  );
}
async function areStylesAvailable(font, styles) {
  return page.evaluate(
    ([f, s]) => figure.fonts.areStylesAvailable(f, s),
    [font, styles],
  );
}
async function getWeights(font) {
  return page.evaluate(
    f => figure.fonts.getWeights(f),
    font,
  );
}
async function getStyles(font) {
  return page.evaluate(
    f => figure.fonts.getStyles(f),
    font,
  );
}

async function measureWidth(family, style, weight, glyphs) {
  return page.evaluate(
    ([f, s, w, g]) => figure.fonts.measureText(f, s, w, g),
    [family, style, weight, glyphs],
  );
}

async function loadFontSync(family, style, weight, glyphs) {
  return page.evaluate(
    ([f, s, w, g]) => {
      const ff = new FontFace(f, `url(http://localhost:8080//src/tests/misc/FontManager/fonts/${f}/${f}-${s}-${w}-${g}.woff2)`, { style: s, weight: w });
      return new Promise(resolve => ff.load().then((loaded) => {
        document.fonts.add(loaded);
        resolve();
      }));
    },
    [family, style, weight, glyphs],
  );
}

// eslint-disable-next-line no-unused-vars
async function loadFontAsync(family, style, weight, glyphs) {
  return page.evaluate(
    ([f, s, w, g]) => {
      const ff = new FontFace(f, `url(http://localhost:8080//src/tests/misc/FontManager/fonts/${f}/${f}-${s}-${w}-${g}.woff2)`, { style: s, weight: w });
      ff.load().then((loaded) => {
        document.fonts.add(loaded);
        document.body.style.fontFamily = `${f}, auto`;
      });
    },
    [family, style, weight, glyphs],
  );
}

// eslint-disable-next-line no-unused-vars
async function loadFontStyle(family, style, weight, glyphs) {
  return page.evaluate(
    ([f, s, w, g]) => {
      const fontStyle = document.createElement('style');
      fontStyle.appendChild(document.createTextNode(`@font-face {
        font-family: '${f}';
        font-style: ${s};
        font-weight: ${w};
        src: url('http://localhost:8080//src/tests/misc/FontManager/fonts/${f}/${f}-${s}-${w}-${g}.woff2') format('woff2');
      }`));
      // document.head.insertBefore(fontStyle, document.head.children[0]);
      document.head.appendChild(fontStyle);
    },
    [family, style, weight, glyphs],
  );
}

// eslint-disable-next-line no-unused-vars
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Font Manager', () => {
  beforeEach(async () => {
    await loadPage();
  });
  describe('isAvailable', () => {
    test('Exists', async () => {
      const times = await isAvailable({ family: 'arial' });
      expect(times).toBe(true);
    });
    test('Weird capitalization', async () => {
      const times = await isAvailable({ family: 'tiMes New rOman' });
      expect(times).toBe(true);
    });
    test('Does not exist', async () => {
      const time = await isAvailable({ family: 'time' });
      expect(time).toBe(false);
    });
    test('Wrong weight', async () => {
      const times = await isAvailable({ family: 'Times New Roman', weight: '100' });
      expect(times).toBe(true);
    });
    test('Montserrat without loading', async () => {
      const r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
      expect(r).toBe(false);
    });
    test('Montserrat with font-face load', async () => {
      let r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
      expect(r).toBe(false);
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
      expect(r).toBe(true);
    });
    test('All fonts', async () => {
      const fonts = ['Andale Mono', 'Arial', 'Arial Black', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Comic Sans MS', 'Courier', 'Courier New', 'Georgia', 'Georgia', 'Helvetica', 'Impact', 'Impact', 'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana',
        'Webdings'];
      let result = true;
      for (let i = 0; i < fonts.length; i += 1) {
        const f = fonts[i];
        result = result && await isAvailable({ family: f, glyphs: 'latin' });
      }
      expect(result).toBe(true);
    });
  });
  describe('Test weights', () => {
    test('Correct weights', async () => {
      let r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['400', '800']);
      expect(r).toBe(false);

      // Load first weight
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
      expect(r).toBe(true);
      r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['400', '800']);
      expect(r).toBe(false);

      // Load second weight
      await loadFontSync('montserrat', 'normal', '800', 'latin');
      r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['400', '800']);
      expect(r).toBe(true);
    });
    test('Incorrect weights', async () => {
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await loadFontSync('montserrat', 'normal', '800', 'latin');
      let r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['300', '900']);
      expect(r).toBe(true);
      r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['100', '700']);
      expect(r).toBe(true);
      r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['400', '300']);
      expect(r).toBe(false);
      r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['700', '900']);
      expect(r).toBe(false);
      r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['600', '800']);
      expect(r).toBe(false);
      r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['500', '800']);
      expect(r).toBe(true);
      r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['400', '800']);
      expect(r).toBe(true);
    });
    test('All weights', async () => {
      await loadFontSync('montserrat', 'normal', '100', 'latin');
      await loadFontSync('montserrat', 'normal', '200', 'latin');
      await loadFontSync('montserrat', 'normal', '300', 'latin');
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await loadFontSync('montserrat', 'normal', '500', 'latin');
      await loadFontSync('montserrat', 'normal', '600', 'latin');
      await loadFontSync('montserrat', 'normal', '700', 'latin');
      await loadFontSync('montserrat', 'normal', '800', 'latin');
      await loadFontSync('montserrat', 'normal', '900', 'latin');
      let r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
      expect(r).toBe(true);
      r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['100', '200', '300', '400', '500', '600', '700', '800', '900']);
      expect(r).toBe(true);
    });
    test('Get weights', async () => {
      await loadFontSync('montserrat', 'normal', '300', 'latin');
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await loadFontSync('montserrat', 'normal', '700', 'latin');
      await loadFontSync('montserrat', 'normal', '900', 'latin');
      const w = await getWeights({ family: 'montserrat', glyphs: 'latin' });
      expect(w).toEqual([
        ['100', '200', '300', 'lighter'],
        ['400', '500', 'normal'],
        ['600', '700', 'bold', 'bolder'],
        ['800', '900'],
      ]);
    });
  });
  describe('Test styles', () => {
    test('Correct styles', async () => {
      // Not font loaded
      expect(await isAvailable({
        family: 'montserrat', style: 'normal', glyphs: 'latin',
      })).toBe(false);
      expect(await isAvailable({
        family: 'montserrat', style: 'italic', glyphs: 'latin',
      })).toBe(false);
      expect(await getStyles({
        family: 'montserrat', glyphs: 'latin',
      })).toEqual([]);
      expect(await areStylesAvailable({
        family: 'montserrat', glyphs: 'latin',
      }, ['italic', 'normal'])).toBe(false);

      // Load normal font only
      // Event though only normal font is loaded, an italic version will still
      // exist as the browser will automatically slant the normal text. The auto
      // italic version should be of different width to the real italic version.
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      const autoItalicWidth = await measureWidth('montserrat', 'italic', '400', 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM');
      expect(await isAvailable({
        family: 'montserrat', style: 'normal', glyphs: 'latin',
      })).toBe(true);
      expect(await isAvailable({
        family: 'montserrat', style: 'italic', glyphs: 'latin',
      })).toBe(true);
      expect(await getStyles({
        family: 'montserrat', glyphs: 'latin',
      })).toEqual([['normal'], ['italic', 'oblique']]);
      expect(await areStylesAvailable({
        family: 'montserrat', glyphs: 'latin',
      }, ['italic', 'normal', 'oblique'])).toBe(false);
      expect(await areStylesAvailable({
        family: 'montserrat', glyphs: 'latin',
      }, ['italic', 'normal'])).toBe(true);

      // Load Iatlic font
      await loadFontSync('montserrat', 'italic', '400', 'latin');
      expect(await getStyles({
        family: 'montserrat', glyphs: 'latin',
      })).toEqual([['normal'], ['italic', 'oblique']]);
      expect(await areStylesAvailable({
        family: 'montserrat', glyphs: 'latin',
      }, ['italic', 'normal', 'oblique'])).toBe(false);
      expect(await areStylesAvailable({
        family: 'montserrat', glyphs: 'latin',
      }, ['italic', 'normal'])).toBe(true);

      const italicWidth = await measureWidth('montserrat', 'italic', '400', 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM');

      expect(autoItalicWidth).not.toEqual(italicWidth);
    });
    test('Italic loaded only', async () => {
      // If only the italic font is loaded, then when trying to display the
      // normal font, only the italic font will be shown.
      // This means that isAvailable will return true for both italic and
      // normal, but the styles will be bucketed together as normal and italic
      // will have identical widths.

      // Not font loaded
      expect(await isAvailable({
        family: 'montserrat', style: 'normal', glyphs: 'latin',
      })).toBe(false);
      expect(await isAvailable({
        family: 'montserrat', style: 'italic', glyphs: 'latin',
      })).toBe(false);
      expect(await getStyles({
        family: 'montserrat', glyphs: 'latin',
      })).toEqual([]);
      expect(await areStylesAvailable({
        family: 'montserrat', glyphs: 'latin',
      }, ['italic', 'normal'])).toBe(false);

      // Load normal font only
      // Event though only normal font is loaded, an italic version will still
      // exist as the browser will automatically slant the normal text. The auto
      // italic version should be of different width to the real italic version.
      await loadFontSync('montserrat', 'italic', '400', 'latin');
      expect(await isAvailable({
        family: 'montserrat', style: 'normal', glyphs: 'latin',
      })).toBe(true);
      expect(await isAvailable({
        family: 'montserrat', style: 'italic', glyphs: 'latin',
      })).toBe(true);
      expect(await getStyles({
        family: 'montserrat', glyphs: 'latin',
      })).toEqual([['normal', 'italic', 'oblique']]);
      expect(await areStylesAvailable({
        family: 'montserrat', glyphs: 'latin',
      }, ['italic', 'normal', 'oblique'])).toBe(false);
      expect(await areStylesAvailable({
        family: 'montserrat', glyphs: 'latin',
      }, ['italic', 'normal'])).toBe(false);
    });
  });
});


// const image = await page.screenshot({ fullPage: true });
// expect(image).toMatchImageSnapshot();

// f = 'montserrat'; g = 'latin'; s = 'normal'; w = '400';
// ff = new FontFace(f, `url(http://localhost:8080//src/tests/misc/FontManager/fonts/${f}/${f}-${s}-${w}-${g}.woff2)`, { style: s, weight: w })
// ff.load().then(function(loaded_face) {
// 	document.fonts.add(loaded_face);
// });