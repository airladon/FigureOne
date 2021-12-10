// // const { polygon } = Fig.tools.g2;
// const figure = new Fig.Figure({
// color: Fig.tools.color.HexToArray('#212529'),
// backgroundColor: Fig.tools.color.HexToArray('#f6f7f7'),
// });
// const figure = new Fig.Figure({ scene: [-3, -3, 3, 3], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.4, render: '2d' } });

const figure = new Fig.Figure({
  scene: [-3, -3, 3, 3],
  font: { size: 0.4 }
});

// figure.add({
//   make: 'grid',
//   step: 0.5,
//   color: [0.8, 0.8, 0.8, 1],
// });

// figure.add({
//   make: 'polygon',
//   sides: 20,
//   radius: 0.03,
//   color: [0.8, 0.8, 0.8, 1],
// });

figure.add({
  make: 'text',
  text: 'Engage!',
  font: { color: [0, 0, 1, 1], style: 'italic' },
  xAlign: 'center',
  position: [0, 0.5],
});

figure.add({
  make: 'text',
  text: 'Make it so!',
  font: {
    family: 'monospace',
    color: [1, 1, 0, 1],
    outline: { fill: true, color: [1, 0, 0, 1], width: 0.02 },
    size: 0.6,
    underline: { color: [0, 0, 1, 1] },
  },
  xAlign: 'center',
  position: [0, -0.5],
});



// t.notifications.add('onClick', () => {
//   // t.setText(`${counter}`);
//   counter += 1;
// });

// const next = figure.add({make: 'collections.button', label: 'Next', position: [0.7, -0.8],});

// next.notifications.add('touch', () => eqn.animations.new().nextForm(1).start());

// const t = figure.add({
//   make: 'text',
//   text: 'a',
//   // font: { render: 'gl' },
//   // text: ['hello', 'world'],
//   // font: { family: 'times', modifiers: { a: { a: 2, d: 1, w: 2 } }, render: 'gl' },
// });

// const eqn = figure.add({
//   make: 'equation',
//   formDefaults: {
//     elementMods: {
//       a: { color: [1, 0, 0, 1] },
//     },
//   },
//   forms: {
//     0: ['a', 'b', 'c'],
//     1: {
//       content: ['a', 'b', 'c'],
//       elementMods: {
//         a: { color: [0, 1, 0, 1] },
//       },
//     },
//     2: ['a', 'b', 'c'],
//   },
// });

// const next = figure.add({
// make: 'collections.button',
// label: 'Next >',
// position: [0.75, -0.8],
// height: 0.34,
// width: 1,
// colorFill: Fig.tools.color.HexToArray('#0020b0'),
// colorLabel: Fig.tools.color.HexToArray('#fff'),
// colorLine: [0,0,0,0],
// corner: {radius: 10, sides: 4},
// });
// next.notifications.add('touch', () => eqn.animations.new().nextForm(1).start());

// const t = figure.add({
//   name: 'text',
//   make: 'collections.text',
//   font: { family: 'Times New Roman' },
//   text: ['line1', { text: 'line2 |accent|', font: { family: 'Arial' } }],
//   modifiers: { accent: { font: { family: 'Courier' } } },
//   // text: ['This |is| a', 'test of', 'multi-lines'],
//   // modifiers: {
//   //   is: { font: { color: [0, 1, 0, 1], render: '2d' } },
//   // },
//   // { font: { color: [0, 0, 1, 1] }, text: ['line1', { text: 'line2 |accent|', font: { color: [1, 0, 1, 1] } }], modifiers: { accent: { font: { color: [0, 1, 0, 1] } } } }
// });

// const e = figure.add({
//   make: 'equation',
//   forms: { 0: ['a', 'b', '1'] },
//   // font: { render: '2d' },
//   scale: 3,
//   position: [0, 0.4],
// })
// figure.showBorders();


// console.log('asdf');

// t.setText({ text: ['a', 'b', 'c', 'd'] });

// figure.showBorders();


// figure.add({
//   make: 'grid',
//   step: 0.1,
//   line: { width: 0.003 },
//   color: [0.8, 0.8, 0.8, 1],
// });
// // figure.add({
// //   make: 'grid',
// //   step: 0.5,
// //   line: { width: 0.005 },
// //   color: [0.5, 0.5, 0.5, 1],
// // });
// // figure.add({
// //   make: 'polygon',
// //   sides: 20,
// //   radius: 0.05,
// // });
// // const p = figure.add({
// //   name: 'text',
// //   make: 'collections.toggle',
// //   // text: ['This |is| a', 'test of', 'multi-lines'],
// //   label: {
// //     text: 'hello toggle',
// //     font: { family: 'montserrat', glyphs: 'latin', type: '2d', },
// //   },
// // });
// // const t = figure.add({
// //   make: 'txt',
// //   text: 'hello',
// //   font: { family: 'montserrat', glyphs: 'latin' },
// //   type: 'bmp',
// // });
// // const e = figure.add({
// //   make: 'equation',
// //   forms: { 0: ['aa', 'bb', 'cc'] },
// //   textFont: { family: 'montserrat', glyphs: 'latin', type: '2d' },
// //   position: [0, 0.5],
// //   type: 'bmp',
// // });

// // const a = figure.collections.angle({
// //   angle: Math.PI / 4,
// //   curve: {
// //     num: 3,
// //     step: -0.03,
// //     radius: 0.5,
// //     width: 0.01,
// //   },
// //   label: {
// //     text: 'a',
// //     offset: 0.05,
// //   },
// // });
// // figure.add('a', a);


// // const figure = new Fig.Figure({
// // color: Fig.tools.color.HexToArray('#212529'),
// // backgroundColor: Fig.tools.color.HexToArray('#f6f7f7')
// // });

// const c = makeBlocks(5);
// const a = figure.add({
//   make: 'rectangle',
//   width: 0.4,
//   height: 0.1,
//   color: [1, 0, 0, 0.5],
//   xAlign: 'left',
//   yAlign: 'bottom',
// });

// const b = figure.add({
//   make: 'ellipse',
//   width: 0.5,
//   height: 0.5,
//   yAlign: 'middle',
//   xAlign: 'left',
//   color: [0, 0, 1, 0.6],
//   offset: [0, 0.2],
// })

// console.log(a)
// const eqn = figure.add(
//   {
//     make: 'collections.equation',
//     elements: {
//       plus: '  +  ',
//       times1: ' \u00D7 ',
//       times2: ' \u00D7 ',
//       equals: '  =  ',
//       blocks2,
//       blocks5,
//       brace: { symbol: 'brace', side: 'top' },
//     },
//     scale: 1.6,
//     formDefaults: { alignment: { fixTo: 'equals' } },
//     forms: {
//       0: ['2', 'plus', '5', 'equals', '_?'],
//       1: [{ topComment: { content: '2', comment: 'blocks2', scale: 0.3, inSize: false } }, 'plus', '5', 'equals', '_?'],
//       2: ['blocks2', 'plus', '5', 'equals', '_?'],
//       3: ['blocks2', 'plus', { topComment: { content: '5', comment: 'blocks5',scale: 0.3, inSize: false } }, 'equals', '_?'],
//       4: ['blocks2', 'plus', 'blocks5', 'equals', '_?'],
//       5: ['blocks2', ' ', 'blocks5', 'equals', '_?'],
//       6: ['blocks2', ' ', 'blocks5', 'equals', '7'],
//     },
//     position: [0.1, -0.1],
//     move: true,
//   },
// );

// // const text = figure.add({
// //   make: 'collections.text',
// //   text: ['a', 'b'],
// // });
// // text.setText({ text: ['c', 'd'] });
// figure.addFrameRate();

// const next = figure.add({make: 'collections.button', label: 'Next', position: [0.7, -0.8],});

// next.notifications.add('touch', () => eqn.animations.new().nextForm(1).start());

// document.getElementById('asdf').innerHTML = '\u00b0\u00baasdf\u002e';
// e.hide();
// console.log(figure.fonts.fonts['montserrat-normal-100-latin'].callbacks)

// const a = figure.add({
//   // make: 'collections.angle',
//   // angle: Math.PI / 4,
//   // curve: { width: 0.01 },
//   // sides: true,
//   // label: {
//   //   text: {
//   //     type: 'bmp',
//   //     forms: { base: ['a', 'b', 'c'] },
//   //     textFont: { family: 'montserrat', glyphs: 'latin' },
//   //   },
//   // },
//   name: 'axis',
//   make: 'collections.axis',
//   length: 5,
//   position: [-2, 0.4],
//   start: 0,
//   stop: 0.001,
//   color: [0, 0, 1, 1],
//       title: { text: 'time (s)', font: { color: [0, 1, 0, 1] } },
//       labels: { color: [0, 1, 0, 1], font: { color: [0, 1, 1, 1] }, xAlign: 'right' },
//   // labels: { xAlign: 'right', rotation: Math.PI / 4, precision: 4 },
//   font: { family: 'montserrat', glyphs: 'latin', size: 0.2, type: '2d' },
//   // },
//   // label: 'a',
// });

// figure.add({
//   make: 'collections.line',
//   length: 3,
//   width: 0.01,
//   label: {
//     text: {
//       type: 'bmp',
//       forms: { base: ['a', 'b', 'c'] },
//       textFont: { family: 'montserrat', weight: '200', glyphs: 'latin' },
//     },
//   },
// });

// figure.add({
//   make: 'txt',
//   text: ['g', 'b'],
//   type: '2d',
//   xAlign: 'center',
//   yAlign: 'baseline',
//   font: { underline: true },
//   location: [[0, 0], [0, -0.5]],
// });
// figure.add({
//   make: 'polygon',
//   radius: 0.03,
//   color: [1, 0, 0, 1],
// });
// figure.fonts.watch(a, () => console.log('angle loaded'))

// const c = figure.add({
//   name: 'c',
//   make: 'collection',
//   elements: [
//     {
//       name: 'a',
//       make: 'txt',
//       text: 'abc',
//       type: '2d',
//       font: { family: 'montserrat', weight: '400', glyphs: 'latin' },
//     },
//     {
//       name: 'b',
//       make: 'txt',
//       text: 'abc',
//       type: 'bmp',
//       font: { family: 'montserrat', weight: '400', glyphs: 'latin' },
//     },
//     {
//       name: 'c',
//       make: 'txt',
//       text: 'abc',
//       type: 'bmp',
//       font: { family: 'open sans', weight: '300', glyphs: 'latin' },
//     },
//     {
//       name: 'd',
//       make: 'collection',
//       elements: [
//         {
//           name: 'e',
//           make: 'txt',
//           text: 'abc',
//           type: 'bmp',
//           font: { family: 'montserrat', weight: '400', glyphs: 'latin' },
//         },
//         {
//           name: 'f',
//           make: 'txt',
//           text: 'abc',
//           type: '2d',
//           font: { family: 'montserrat', weight: '400', glyphs: 'latin' },
//         },
//       ],
//     },
//   ],
// });
// window.loaded = 0;
// figure.fonts.watch(figure.get('c'), () => { window.loaded += 1; });
// console.log(figure.fonts.fonts['montserrat-normal-400-latin'].callbacks)
// console.log(figure.fonts.fonts['montserrat-normal-400-latin-atlas'].callbacks)
// console.log(figure.fonts.fonts['open sans-normal-300-latin-atlas'].callbacks)
// // console.log(figure.fonts.fonts)
// // figure.fonts.watch(c, () => console.log('loaded'))

// const b = figure.add({
//   make: 'txt',
//   text: 'abc',
//   type: 'bmp',
//   font: { family: 'montserrat', weight: '400', glyphs: 'latin' },
// });
// // console.log(b.getBoundingRect().width)

// a.hide();

// const a = figure.add({
//   make: 'txt',
//   font: { family: 'montserrat', weight: '400', glyphs: 'latin' },
//   text: 'hello',
// });

// figure.fonts.watch(
//   // figure.get('angle'),
//   a,
//   {
//     weights: 2,
//     timeout: 10,
//     callback: () => {
//       // figure.webglLow.recreateAtlases();
//       a.recreateAtlases();
//       // console.log('weights')
//       // figure.get('angle').label.eqn.layoutForms('reset');
//       // figure.get('angle').updateLabel();
//     },
//   },
// );
// console.log(figure.fonts.watch(a, () => console.log('loaddd')));
// console.log(figure.fonts.watch(a, () => console.log('asdf')));
// const b = figure.add({
//   make: 'equation',
//   // font: { size: 2, atlasSize: 0.5, glyphs: 'hel word' },
//   // text: 'hello world',
//   // position: [-2, 0],
//   textFont: { family: 'montserrat', weight: '400', size: 0.4, glyphs: 'latin', },
//   forms: { 0: ['a', 'b', 'c', '    ', '1'], 1: ['b', 'c', 'a', '1'] },
// });
// b.hide();

// ff = new FontFace('montserrat', 'url(http://localhost:8080//src/tests/misc/fonts/montserrat/montserrat-italic-400-latin.woff2)', { weight: '400', style: 'italic' });
// ff.load().then(function(loaded_face) {
//   document.fonts.add(loaded_face);
//   console.log('italic')
// });

// ff1 = new FontFace('montserrat', 'url(http://localhost:8080//src/tests/misc/fonts/montserrat/montserrat-normal-400-latin.woff2)', { weight: '400', style: 'normal' });
// ff1.load().then(function(loaded_face) {
//   document.fonts.add(loaded_face);
//   console.log('400')
// });

// ff2 = new FontFace('montserrat', 'url(http://localhost:8080//src/tests/misc/fonts/montserrat/montserrat-italic-800-latin.woff2)', { weight: '800', style: 'italic'});
// ff2.load().then(function(loaded_face) {
//   document.fonts.add(loaded_face);
//   console.log('800')
// });

// figure.fonts.watch(a._label._a.font, { callback: () => {
//   a.updateLabel();
//   console.log('***********************');
// } })

// const e = figure.add({
//   make: 'equation',
//   forms: { 0: { frac: ['a', 'vinculum', 'b'] } },
// })
// b = figure.add({
//   make: 'txt',
//   // gl: true,
//   // text: 'QwertfMy 123\u03C0',
//   text: 'abcdefg',
//   // text: 'asdf',
//   font: { size: 0.5, style: 'normal', family: 'open sans', underline: { color: [0.5, 0.5, 0.5, 1] }, weight: '300', glyphs: 'common', modifiers: {
//     f: { a: 3 },
//   } },
//   color: [1, 0, 0, 1],
//   // font: { family: 'arial', weight: 'bold', outline: { fill: true, color: [0, 0, 1, 1 ] }, fixColor: true, },
//   // font: {
//   //   src: 'http://localhost:8080/src/tests/misc/atlas/atlas.png',
//   //   map,
//   //   loadColor: [0, 0, 1, 1],
//   //   glyphs: 'abcdefghijklmnopqrstuvwxyz',
//   //   fixColor: true,
//   // },
//   move: { type: 'rotation' },
//   yAlign: 'bottom',
//   xAlign: 'center',
//   // adjustments: { descent: -0.03 },
//   type: 'bmp',
// });
// // figure.add({
// //   make: 'rectangle',
// //   xAlign: 'left',
// //   yAlign: 'bottom',
// //   width: 2,
// //   height: 0.01,
// //   position: [0, 0],
// // });
// // console.log(figure.fontManager.isFamilyAvailable('Open Sans'));
// // console.log(figure.fontManager.isFamilyAvailable('Open Sans', 'π'));
// figure.showBorders();

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
