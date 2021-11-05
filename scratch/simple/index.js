// const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure({ scene: [-3, -3, 6, 6], backgroundColor: [1, 1, 1, 1], font: { size: 0.5 } });
// Zoomable and Pannable plot

// const drawContext2D = figure.draw2DLow;
// const { ctx } = drawContext2D;
// console.log(drawContext2D.canvas.offsetWidth);
// console.log(drawContext2D.canvas.offsetHeight);
// ctx.save();
// ctx.font = 'Italic 100 30px Helvetica';
// const letters = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/.,';[]\-=!@#$%^&*()_+{}|:"<>?1234567890`;
// let x = 20;
// let y = 400;
// for (let i = 0; i < letters.length; i += 1) {
//   ctx.fillText(letters[i], x, y);
//   x += ctx.measureText(letters[i]).width;
//   if (x >= 600) {
//     x = 20;
//     y += 40;
//   }
// }
// // ctx.fillText('a', 400, 400);
// // ctx.fillText('g', 420, 400);
// ctx.restore();

b = figure.add({
  make: 'txt',
  // gl: true,
  text: 'QwertfMy 123\u03C0',
  // text: 'asdf',
  font: { size: 0.5, style: 'italic', family: 'Times New Roman', underline: true },
  color: [1, 0, 0, 1],
  move: { type: 'rotation' },
  yAlign: 'bottom',
  xAlign: 'center',
  adjustments: { descent: -0.03 },
  type: '2d',
});
figure.add({
  make: 'rectangle',
  xAlign: 'left',
  yAlign: 'bottom',
  width: 2,
  height: 0.01,
  position: [0, 0],
});

a = figure.add({
  make: 'txt',
  // gl: true,
  text: 'Qwerty 123\u03C0',
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
  font: { size: 2, color: [1, 0, 1, 1], weight: '700' },
  type: '2d',
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
// eqn.animations.new()
//   .delay(1)
//   .dissolveIn(3)
//   .start();

// const angle = figure.add({
//   make: 'collections.angle',
//   angle: Math.PI / 4,
//   label: {
//     text: null,
//     update: true,
//     font: { size: 0.2 },
//   },
//   curve: {
//     radius: 0.5,
//     width: 0.01,
//   },
//   corner: {
//     width: 0.01,
//     length: 1,
//   },
// });

// angle.setMovable({
//   startArm: 'rotation',
//   endArm: 'angle',
//   movePadRadius: 0.3,
// });

// const tri = figure.add({
//   make: 'collections.polyline',
//   close: true,
//   points: [[1.5, 3], [3, 0], [0, 0]],
//   width: 0.01,
//   angle: {
//     label: { text: null, scale: 2, font: { size: 0.5 } },
//     color: [1, 0, 0, 1],
//   },
//   color: [0, 0, 1, 1],
//   makeValid: { shape: 'triangle', hide: { minSide: 2, minAngle: Math.PI / 12 } },
//   side: { label: null },
// });

// tri.updatePoints([[1.5, 3], [3, 0], [0, 0]])
// tri._angle1.setOpacity(0.5)