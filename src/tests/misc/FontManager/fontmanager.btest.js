/* globals page figure */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(120000);

page.on('console', (msg) => {
  for (let i = 0; i < msg.args().length; i += 1) {
    const result = `${msg.args()[i]}`;
    if (result.startsWith('JSHandle@fail')) {
      failures.push(result);
    }
  }
  for (let i = 0; i < msg.args().length; i += 1) {
    console.log(`${i}: ${msg.args()[i]}`);
  }
});

const fonts = [
  'American Typewriter',
  'Andale Mono',
  'Arial',
  'Arial Black',
  'Arial Narrow',
  'Arial Rounded MT Bold',
  'Arial Unicode MS',
  'Avenir',
  'Avenir Next',
  'Avenir Next Condensed',
  'Bahnschrift',
  'Baskerville',
  'Big Caslon',
  'Bodoni 72',
  'Bodoni 72 Oldstyle',
  'Bodoni 72 Smallcaps',
  'Bradley Hand',
  'Brush Script MT',
  'Calibri',
  'Cambria',
  'Cambria Math',
  'Candara',
  'Chalkboard',
  'Chalkboard SE',
  'Chalkduster',
  'Charter',
  'Cochin',
  'Comic Sans MS',
  'Consolas',
  'Constantia',
  'Copperplate',
  'Corbel',
  'Courier',
  'Courier New',
  'DIN Alternate',
  'DIN Condensed',
  'Didot',
  'Ebrima',
  'Franklin Gothic Medium',
  'Futura',
  'Gabriola',
  'Gadugi',
  'Geneva',
  'Georgia',
  'Georgia',
  'Gill Sans',
  'Helvetica',
  'Helvetica Neue',
  'Herculanum',
  'Hoefler Text',
  'HoloLens MDL2 Assets',
  'Impact',
  'Impact',
  'Ink Free',
  'Javanese Text',
  'Leelawadee UI',
  'Lucida Console',
  'Lucida Grande',
  'Lucida Sans Unicode',
  'Luminari',
  'MS Gothic',
  'MV Boli',
  'Malgun Gothic',
  'Marker Felt',
  'Marlett',
  'Menlo',
  'Microsoft Himalaya',
  'Microsoft JhengHei',
  'Microsoft New Tai Lue',
  'Microsoft PhagsPa',
  'Microsoft Sans Serif',
  'Microsoft Tai Le',
  'Microsoft YaHei',
  'Microsoft Yi Baiti',
  'MingLiU-ExtB',
  'Monaco',
  'Mongolian Baiti',
  'Myanmar Text',
  'Nirmala UI',
  'Noteworthy',
  'Optima',
  'Palatino',
  'Palatino Linotype',
  'Papyrus',
  'Phosphate',
  'Rockwell',
  'Savoye LET',
  'Segoe MDL2 Assets',
  'Segoe Print',
  'Segoe Script',
  'Segoe UI',
  'Segoe UI Emoji',
  'Segoe UI Historic',
  'Segoe UI Symbol',
  'SignPainter',
  'SimSun',
  'Sitka',
  'Skia',
  'Snell Roundhand',
  'Sylfaen',
  'Symbol',
  'Tahoma',
  'Times',
  'Times New Roman',
  'Trattatello',
  'Trebuchet MS',
  'Verdana',
  'Webdings',
  'Wingdings',
  'Yu Gothic',
  'Zapfino',
];

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

async function loadFont(family, style, weight, glyphs) {
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
      await loadFont('montserrat', 'normal', '400', 'latin');
      r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
      expect(r).toBe(false);
      await sleep(500);
      r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
      expect(r).toBe(true);
    });
  });
  describe('Test weights', () => {
    test('Correct weights', async () => {
      let r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['400', '800']);
      expect(r).toBe(false);

      // Load first weight
      await loadFont('montserrat', 'normal', '400', 'latin');
      await sleep(500);
      r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
      expect(r).toBe(true);
      r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['400', '800']);
      expect(r).toBe(false);

      // Load second weight
      await loadFont('montserrat', 'normal', '800', 'latin');
      await sleep(500);
      r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['400', '800']);
      expect(r).toBe(true);
    });
    test('Incorrect weights', async () => {
      await loadFont('montserrat', 'normal', '400', 'latin');
      await loadFont('montserrat', 'normal', '800', 'latin');
      await sleep(500);
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
    // test('All weights', async () => {
    //   // let r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
    //   // expect(r).toBe(false);
    //   // await loadFont('montserrat', 'normal', '400', 'latin');
    //   // r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
    //   // expect(r).toBe(false);
    //   // await sleep(500);
    //   // r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
    //   // expect(r).toBe(true);
    //   await loadFont('montserrat', 'normal', '400', 'latin');
    //   await loadFont('montserrat', 'normal', '200', 'latin');
    //   await loadFont('montserrat', 'normal', '300', 'latin');
    //   await loadFont('montserrat', 'normal', '400', 'latin');
    //   await loadFont('montserrat', 'normal', '500', 'latin');
    //   await loadFont('montserrat', 'normal', '600', 'latin');
    //   await loadFont('montserrat', 'normal', '700', 'latin');
    //   await loadFont('montserrat', 'normal', '800', 'latin');
    //   await loadFont('montserrat', 'normal', '900', 'latin');
    //   let r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
    //   await sleep(1000);
    //   r = await isAvailable({ family: 'montserrat', glyphs: 'latin' });
    //   expect(r).toBe(true);
    //   r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['100', '200', '300', '400', '500', '600', '700', '800', '900']);
    //   expect(r).toBe(false);
    //   await sleep(5000);
    //   r = await areWeightsAvailable({ family: 'montserrat', glyphs: 'latin' }, ['100', '200', '300', '400', '500', '600', '700', '800', '900']);
    //   expect(r).toBe(true);

    // });
  });
});


// const image = await page.screenshot({ fullPage: true });
// expect(image).toMatchImageSnapshot();