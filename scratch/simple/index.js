// const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure({ scene: [-3, -3, 6, 6], backgroundColor: [1, 1, 1, 1], font: { size: 0.5 } });

b = figure.add({
  make: 'txt',
  // gl: true,
  text: 'QwertfMy 123\u03C0',
  // text: 'asdf',
  font: { size: 0.5, style: 'italic', family: 'open sans', underline: false, weight: '300', glyphs: 'common' },
  color: [1, 0, 0, 1],
  move: { type: 'rotation' },
  yAlign: 'bottom',
  xAlign: 'center',
  adjustments: { descent: -0.03 },
  type: 'bmp',
});
figure.add({
  make: 'rectangle',
  xAlign: 'left',
  yAlign: 'bottom',
  width: 2,
  height: 0.01,
  position: [0, 0],
});
// console.log(figure.fontManager.isFamilyAvailable('Open Sans'));
// console.log(figure.fontManager.isFamilyAvailable('Open Sans', 'π'));


console.log(figure.fonts.watch({ family: 'open sans', testString: 'latin', callback: () => console.log('latin loaded') }));
console.log(figure.fonts.watch({ family: 'open sans', testString: 'greek', callback: () => console.log('greek loaded') }));


// figure.fontManager.whenAvailable('Open Sans', '300', 'normal', () => console.log('available'));

a = figure.add({
  make: 'txt',
  // gl: true,
  text: 'Qwerty 123\u03C03',
  font: { size: 1, underline: true },
  // font: { size: 0.5, style: 'italic', family: 'Times New Roman', underline: true },
  // move: { type: 'translate' },
  move: true,
  position: [0, 2],
});

eqn = figure.add({
  make: 'equation',
  elements: { a: { color: [1, 0, 0, 1], onClick: () => console.log('a'), touchBorder: 0.2 } },
  forms: { 0: [{ frac: ['a', 'vinculum', 'b'] }, '_ = ', '2', 'c'] },
  position: [1, 1],
  textFont: { size: 0.5 },
  font: { size: 0.5 },
});

// eqn._a.setFont({ color: [0, 1, 0, 1]});
eqn._a.setColor([0, 0, 1, 1]);

const test = figure.add({
  make: 'txt',
  text: 'a',
  font: { size: 2, color: [1, 0, 1, 1], weight: '700', family: 'open sans', glyphs: 'a', },
  type: 'bmp',
});

const t = figure.add({
  name: 'eqn',
  make: 'collections.text',
  position: [-1, 5],
  justify: 'right',
  xAlign: 'left',
  yAlign: 'baseline',
  type: 'bmp',
  text: [
    'Lines justified |to| |the| left',
    { text: 'A |line| with a |modifiedPhrase|', lineSpace: 1 },
    {
      text: 'A |line| |with| cu|st|om defaults',
      font: {
        style: 'italic',
        color: [0, 0.5, 1, 1],
      },
    },
  ],
  elements: {
    abc: { text: 'hello world', color: [1, 0, 1, 1], font: { size: 0.2 } },
    v: { symbol: 'vinculum' },
  },
  modifiers: {
    to: {
      eqn: { frac: { numerator: 'abc', symbol: 'v', denominator: '2', scale: 0.6, offsetY: 0.2 } },
    },
    st: {
      // lSpace: 0.1,
      // rSpace: 0.1,
      offset: [0.1, 0],
      space: 0.1,
    },
    modifiedPhrase: {
      text: 'modified phrase',
      font: {
        style: 'italic',
        color: [0, 0.5, 1, 1],
        size: 0.4,
      },
    },
    with: {
      offset: [0.1, 0.3],
      font: { size: 0.2 },
    },
    line: {
      font: {
        family: 'Times New Roman',
        color: [0, 0.6, 0, 1],
        style: 'italic',
      },
    },
  },
});
