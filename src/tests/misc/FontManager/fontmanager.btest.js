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

async function measureWidth(family, style, weight, glyphs) {
  return page.evaluate(
    ([f, s, w, g]) => figure.fonts.measureText(f, s, w, g),
    [family, style, weight, glyphs],
  );
}

async function loadFontSync(family, style, weight, glyphs) {
  return page.evaluate(
    ([f, s, w, g]) => {
      const fd = f.split(' ').join('-');
      const ff = new FontFace(f, `url(http://localhost:8080//src/tests/misc/FontManager/fonts/${fd}/${fd}-${s}-${w}-${g}.woff2)`, { style: s, weight: w });
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
      const fd = f.split(' ').join('-');
      const ff = new FontFace(f, `url(http://localhost:8080//src/tests/misc/FontManager/fonts/${fd}/${fd}-${s}-${w}-${g}.woff2)`, { style: s, weight: w });
      ff.load().then((loaded) => {
        document.fonts.add(loaded);
        document.body.style.fontFamily = `${f}, auto`;
      });
    },
    [family.split(' ').join('-'), style, weight, glyphs],
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
    [family.split(' ').join('-'), style, weight, glyphs],
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
    test('Get weights single', async () => {
      expect(await getWeights({ family: 'montserrat', glyphs: 'latin' })).toEqual([]);
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      expect(await getWeights({ family: 'montserrat', glyphs: 'latin' })).toEqual([
        ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder', 'lighter'],
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
  describe('Greek vs Latin', () => {
    test('Load Latin then Greek', async () => {
      expect(await isAvailable({
        family: 'open sans', glyphs: 'greek',
      })).toBe(false);
      expect(await isAvailable({
        family: 'open sans', glyphs: 'latin',
      })).toBe(false);
      expect(await isAvailable({
        family: 'open sans', glyphs: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM\u0391\u0392\u0393\u0394\u0395\u0396\u0397\u0398\u0399\u039A\u039B\u039C\u039D\u039E\u039F\u03A0\u03A1\u03A3\u03A4\u03A5\u03A6\u03A7\u03A8\u03A9\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8\u03B9\u03BA\u03BB\u03BC\u03BD\u03BE\u03BF\u03C0\u03C1\u03C2\u03C3\u03C4\u03C5\u03C6\u03C7\u03C8\u03c9',
      })).toBe(false);
      expect(await isAvailable({
        family: 'open sans', glyphs: 'q\u0391',
      })).toBe(false);

      await loadFontSync('open sans', 'normal', '300', 'latin');
      expect(await isAvailable({
        family: 'open sans', glyphs: 'greek',
      })).toBe(false);
      expect(await isAvailable({
        family: 'open sans', glyphs: 'latin',
      })).toBe(true);
      expect(await isAvailable({
        family: 'open sans', glyphs: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM\u0391\u0392\u0393\u0394\u0395\u0396\u0397\u0398\u0399\u039A\u039B\u039C\u039D\u039E\u039F\u03A0\u03A1\u03A3\u03A4\u03A5\u03A6\u03A7\u03A8\u03A9\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8\u03B9\u03BA\u03BB\u03BC\u03BD\u03BE\u03BF\u03C0\u03C1\u03C2\u03C3\u03C4\u03C5\u03C6\u03C7\u03C8\u03c9',
      })).toBe(false);
      expect(await isAvailable({
        family: 'open sans', glyphs: 'q\u0391',
      })).toBe(false);

      await loadFontSync('open sans', 'normal', '300', 'greek');
      expect(await isAvailable({
        family: 'open sans', glyphs: 'greek',
      })).toBe(true);
      expect(await isAvailable({
        family: 'open sans', glyphs: 'latin',
      })).toBe(true);
      expect(await isAvailable({
        family: 'open sans', glyphs: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM\u0391\u0392\u0393\u0394\u0395\u0396\u0397\u0398\u0399\u039A\u039B\u039C\u039D\u039E\u039F\u03A0\u03A1\u03A3\u03A4\u03A5\u03A6\u03A7\u03A8\u03A9\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8\u03B9\u03BA\u03BB\u03BC\u03BD\u03BE\u03BF\u03C0\u03C1\u03C2\u03C3\u03C4\u03C5\u03C6\u03C7\u03C8\u03c9',
      })).toBe(true);
      expect(await isAvailable({
        family: 'open sans', glyphs: 'q\u0391',
      })).toBe(true);
    });
  });
  describe('watch', () => {
    test('Simple', async () => {
      expect(await isAvailable({
        family: 'montserrat', style: 'normal', glyphs: 'latin',
      })).toBe(false);
      await setLoaded();
      expect(await getLoaded()).toBe(0);
      await watch({ family: 'montserrat', glyphs: 'latin' });
      expect(await getLoaded()).toBe(0);
      let fonts = await getFontManager();
      expect(fonts.loaded).toBe(0);
      expect(fonts.loading).toBe(1);
      expect(fonts.timedOut).toBe(0);
      expect(fonts.fonts['montserrat-normal-normal-latin'].loaded).toBe(false);
      expect(fonts.fonts['montserrat-normal-normal-latin'].timedOut).toBe(false);
      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      expect(await getLoaded()).toBe(1);
      fonts = await getFontManager();
      expect(fonts.loaded).toBe(1);
      expect(fonts.loading).toBe(1);
      expect(fonts.timedOut).toBe(0);
      expect(fonts.fonts['montserrat-normal-normal-latin'].loaded).toBe(true);
      expect(fonts.fonts['montserrat-normal-normal-latin'].timedOut).toBe(false);
    });
    test('Double', async () => {
      expect(await isAvailable({
        family: 'montserrat', style: 'normal', glyphs: 'latin',
      })).toBe(false);
      expect(await isAvailable({
        family: 'open sans', style: 'normal', glyphs: 'latin',
      })).toBe(false);
      await setLoaded();
      expect(await getLoaded()).toBe(0);
      await watch({ family: 'montserrat', glyphs: 'latin' });
      await watch({ family: 'open sans', glyphs: 'latin' });
      let fonts = await getFontManager();
      expect(fonts.loaded).toBe(0);
      expect(fonts.loading).toBe(2);
      expect(fonts.timedOut).toBe(0);
      expect(fonts.fonts['montserrat-normal-normal-latin'].loaded).toBe(false);
      expect(fonts.fonts['montserrat-normal-normal-latin'].timedOut).toBe(false);
      expect(fonts.fonts['open sans-normal-normal-latin'].loaded).toBe(false);
      expect(fonts.fonts['open sans-normal-normal-latin'].timedOut).toBe(false);

      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      expect(await getLoaded()).toBe(1);
      fonts = await getFontManager();
      expect(fonts.loaded).toBe(1);
      expect(fonts.loading).toBe(2);
      expect(fonts.timedOut).toBe(0);
      expect(fonts.fonts['montserrat-normal-normal-latin'].loaded).toBe(true);
      expect(fonts.fonts['montserrat-normal-normal-latin'].timedOut).toBe(false);
      expect(fonts.fonts['open sans-normal-normal-latin'].loaded).toBe(false);
      expect(fonts.fonts['open sans-normal-normal-latin'].timedOut).toBe(false);
      expect(await isAvailable({
        family: 'montserrat', style: 'normal', glyphs: 'latin',
      })).toBe(true);
      expect(await isAvailable({
        family: 'open sans', style: 'normal', glyphs: 'latin',
      })).toBe(false);

      await loadFontSync('open sans', 'normal', '300', 'latin');
      await sleep(100);
      expect(await getLoaded()).toBe(2);
      fonts = await getFontManager();
      expect(fonts.loaded).toBe(2);
      expect(fonts.loading).toBe(2);
      expect(fonts.timedOut).toBe(0);
      expect(fonts.fonts['open sans-normal-normal-latin'].loaded).toBe(true);
      expect(fonts.fonts['open sans-normal-normal-latin'].timedOut).toBe(false);
      expect(await isAvailable({
        family: 'montserrat', style: 'normal', glyphs: 'latin',
      })).toBe(true);
      expect(await isAvailable({
        family: 'open sans', style: 'normal', glyphs: 'latin',
      })).toBe(true);
    });
    test('Two weights', async () => {
      expect(await isAvailable({
        family: 'montserrat', style: 'normal', weight: '300', glyphs: 'latin',
      })).toBe(false);
      expect(await isAvailable({
        family: 'montserrat', style: 'normal', weight: '400', glyphs: 'latin',
      })).toBe(false);
      expect(await getWeights({ family: 'montserrat', glyphs: 'latin' })).toEqual([]);
      await setLoaded();
      expect(await getLoaded()).toBe(0);
      await watch({ family: 'montserrat', weight: '300', glyphs: 'latin' });
      await watch({ family: 'montserrat', weight: '400', glyphs: 'latin' });
      let fonts = await getFontManager();
      expect(fonts.loaded).toBe(0);
      expect(fonts.loading).toBe(2);
      expect(fonts.timedOut).toBe(0);
      expect(fonts.fonts['montserrat-normal-300-latin'].loaded).toBe(false);
      expect(fonts.fonts['montserrat-normal-300-latin'].timedOut).toBe(false);
      expect(fonts.fonts['montserrat-normal-400-latin'].loaded).toBe(false);
      expect(fonts.fonts['montserrat-normal-400-latin'].timedOut).toBe(false);
      expect(await getWeights({ family: 'montserrat', glyphs: 'latin' })).toEqual([]);

      await loadFontSync('montserrat', 'normal', '400', 'latin');
      await sleep(100);
      fonts = await getFontManager();
      expect(fonts.loaded).toBe(2);
      expect(fonts.loading).toBe(2);
      expect(fonts.timedOut).toBe(0);

      expect(await getWeights({ family: 'montserrat', glyphs: 'latin' })).toEqual([
        ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder', 'lighter'],
      ]);
      expect(await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['300', '400']))
        .toBe(false);


      await loadFontSync('montserrat', 'normal', '300', 'latin');
      fonts = await getFontManager();
      expect(fonts.loaded).toBe(2);
      expect(fonts.loading).toBe(2);
      expect(fonts.timedOut).toBe(0);
      expect(await getWeights({ family: 'montserrat', glyphs: 'latin' })).toEqual([
        ['100', '200', '300', 'lighter'], ['400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder'],
      ]);
      expect(await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['300', '400']))
        .toBe(true);
    });
    test('Timeout', async () => {
      await setLoaded();
      expect(await getLoaded()).toBe(0);
      await watch({ family: 'montserrat', glyphs: 'latin' }, 0.1);
      await watch({ family: 'open sans', glyphs: 'latin' }, 0.35);
      let fonts = await getFontManager();
      expect(fonts.loaded).toBe(0);
      expect(fonts.loading).toBe(2);
      expect(fonts.timedOut).toBe(0);
      expect(fonts.fonts['montserrat-normal-normal-latin'].loaded).toBe(false);
      expect(fonts.fonts['montserrat-normal-normal-latin'].timedOut).toBe(false);
      expect(fonts.fonts['open sans-normal-normal-latin'].loaded).toBe(false);
      expect(fonts.fonts['open sans-normal-normal-latin'].timedOut).toBe(false);
      await sleep(200);
      fonts = await getFontManager();
      expect(fonts.loaded).toBe(0);
      expect(fonts.loading).toBe(2);
      expect(fonts.timedOut).toBe(1);
      expect(await getLoaded()).toBe(1);
      fonts = await getFontManager();
      expect(fonts.fonts['montserrat-normal-normal-latin'].loaded).toBe(false);
      expect(fonts.fonts['montserrat-normal-normal-latin'].timedOut).toBe(true);
      expect(fonts.fonts['open sans-normal-normal-latin'].loaded).toBe(false);
      expect(fonts.fonts['open sans-normal-normal-latin'].timedOut).toBe(false);
      await sleep(300);
      fonts = await getFontManager();
      expect(fonts.loaded).toBe(0);
      expect(fonts.loading).toBe(2);
      expect(fonts.timedOut).toBe(2);
      expect(await getLoaded()).toBe(2);
      fonts = await getFontManager();
      expect(fonts.fonts['montserrat-normal-normal-latin'].loaded).toBe(false);
      expect(fonts.fonts['montserrat-normal-normal-latin'].timedOut).toBe(true);
      expect(fonts.fonts['open sans-normal-normal-latin'].loaded).toBe(false);
      expect(fonts.fonts['open sans-normal-normal-latin'].timedOut).toBe(true);
      expect(await isAvailable({
        family: 'montserrat', style: 'normal', weight: '300', glyphs: 'latin',
      })).toBe(false);
      expect(await isAvailable({
        family: 'montserrat', style: 'normal', weight: '400', glyphs: 'latin',
      })).toBe(false);
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
