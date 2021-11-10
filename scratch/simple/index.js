// const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure({ scene: [-3, -3, 6, 6], backgroundColor: [1, 1, 1, 1], font: { size: 0.5 } });

const map = {
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
  fontSize: 159.88888888888889,
  dimension: 3597,
};
b = figure.add({
  make: 'txt',
  // gl: true,
  // text: 'QwertfMy 123\u03C0',
  text: 'abcdefg',
  // text: 'asdf',
  // font: { size: 0.5, style: 'italic', family: 'open sans', underline: { color: [0.5, 0.5, 0.5, 1] }, weight: '300', glyphs: 'common', outline: { color: [0, 0, 1, 1], width: 0.005, fill: false }, fixColor: true },
  color: [1, 1, 0, 1],
  // font: { family: 'arial', weight: 'bold', outline: { fill: true, color: [0, 0, 1, 1 ] }, fixColor: true, },
  font: {
    src: 'http://localhost:8080/src/tests/misc/atlas/atlas.png',
    map,
    loadColor: [0, 0, 1, 1],
    glyphs: 'abcdefghijklmnopqrstuvwxyz',
    fixColor: true,
  },
  move: { type: 'rotation' },
  yAlign: 'bottom',
  xAlign: 'center',
  // adjustments: { descent: -0.03 },
  type: 'bmp',
});
// figure.add({
//   make: 'rectangle',
//   xAlign: 'left',
//   yAlign: 'bottom',
//   width: 2,
//   height: 0.01,
//   position: [0, 0],
// });
// console.log(figure.fontManager.isFamilyAvailable('Open Sans'));
// console.log(figure.fontManager.isFamilyAvailable('Open Sans', 'π'));
figure.showBorders();

// console.log(figure.fonts.watch({ family: 'open sans', testString: 'latin', callback: () => console.log('latin loaded') }));
// console.log(figure.fonts.watch({ family: 'open sans', testString: 'greek', callback: () => console.log('greek loaded') }));


// // figure.fontManager.whenAvailable('Open Sans', '300', 'normal', () => console.log('available'));

// a = figure.add({
//   make: 'txt',
//   // gl: true,
//   text: 'Qwerty 123\u03C03',
//   font: { size: 1, underline: true },
//   // font: { size: 0.5, style: 'italic', family: 'Times New Roman', underline: true },
//   // move: { type: 'translate' },
//   move: true,
//   position: [0, 2],
// });

// eqn = figure.add({
//   make: 'equation',
//   elements: { a: { color: [1, 0, 0, 1], onClick: () => console.log('a'), touchBorder: 0.2 } },
//   forms: { 0: [{ frac: ['a', 'vinculum', 'b'] }, '_ = ', '2', 'c'] },
//   position: [1, 1],
//   textFont: { size: 0.5 },
//   font: { size: 0.5 },
// });

// // eqn._a.setFont({ color: [0, 1, 0, 1]});
// eqn._a.setColor([0, 0, 1, 1]);

// const test = figure.add({
//   make: 'txt',
//   text: 'a',
//   font: { size: 2, color: [1, 0, 1, 1], weight: '700', family: 'open sans', glyphs: 'a', },
//   type: 'bmp',
// });

// const t = figure.add({
//   name: 'eqn',
//   make: 'collections.text',
//   position: [-1, 5],
//   justify: 'right',
//   xAlign: 'left',
//   yAlign: 'baseline',
//   type: 'bmp',
//   text: [
//     'Lines justified |to| |the| left',
//     { text: 'A |line| with a |modifiedPhrase|', lineSpace: 1 },
//     {
//       text: 'A |line| |with| cu|st|om defaults',
//       font: {
//         style: 'italic',
//         color: [0, 0.5, 1, 1],
//       },
//     },
//   ],
//   elements: {
//     abc: { text: 'hello world', color: [1, 0, 1, 1], font: { size: 0.2 } },
//     v: { symbol: 'vinculum' },
//   },
//   modifiers: {
//     to: {
//       eqn: { frac: { numerator: 'abc', symbol: 'v', denominator: '2', scale: 0.6, offsetY: 0.2 } },
//     },
//     st: {
//       // lSpace: 0.1,
//       // rSpace: 0.1,
//       offset: [0.1, 0],
//       space: 0.1,
//     },
//     modifiedPhrase: {
//       text: 'modified phrase',
//       font: {
//         style: 'italic',
//         color: [0, 0.5, 1, 1],
//         size: 0.4,
//       },
//     },
//     with: {
//       offset: [0.1, 0.3],
//       font: { size: 0.2 },
//     },
//     line: {
//       font: {
//         family: 'Times New Roman',
//         color: [0, 0.6, 0, 1],
//         style: 'italic',
//       },
//     },
//   },
// });
