// const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure({ scene: [-3, -3, 6, 6]});
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

figure.add({
  make: 'glText',
  // gl: true,
  text: 'QwertfMy 123\u03C0',
  // text: 'asdf',
  font: { size: 0.5, style: 'italic', family: 'Times New Roman' },
  color: [1, 0, 0, 1],
  move: { type: 'rotation' },
  yAlign: 'bottom',
  xAlign: 'center',
  adjustments: { descent: -0.03 },
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
  make: 'text2d',
  // gl: true,
  text: 'Qwerty 123\u03C0',
  font: { size: 1 },
  // move: { type: 'translate' },
  move: true,
  position: [0, 2],
})

eqn = figure.add({
  make: 'equation',
  elements: { a: { color: [1, 0, 0, 1], onClick: () => console.log('a'), touchBorder: 0.2 } },
  forms: { 0: [{ frac: ['a', 'vinculum', 'b'] }, '_ = ', '2', 'c'] },
  position: [1, 1],
  textFont: { size: 0.5 },
  font: { size: 0.5 },
});

eqn._a.setFont({ color: [0, 1, 0, 1]});
eqn._a.setColor([0, 0, 1, 1])
// eqn.animations.new()
//   .delay(1)
//   .dissolveIn(3)
//   .start();