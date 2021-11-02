// const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure({ scene: [-3, -3, 6, 6]});
// Zoomable and Pannable plot

const drawContext2D = figure.draw2DLow;
const { ctx } = drawContext2D;
console.log(drawContext2D.canvas.offsetWidth);
console.log(drawContext2D.canvas.offsetHeight);
ctx.save();
ctx.font = 'Italic 100 30px Helvetica';
const letters = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/.,';[]\-=!@#$%^&*()_+{}|:"<>?1234567890`;
let x = 20;
let y = 400;
for (let i = 0; i < letters.length; i += 1) {
  ctx.fillText(letters[i], x, y);
  x += ctx.measureText(letters[i]).width;
  if (x >= 600) {
    x = 20;
    y += 40;
  }
}
// ctx.fillText('a', 400, 400);
// ctx.fillText('g', 420, 400);
ctx.restore();

figure.add({
  make: 'glText',
  // gl: true,
  text: 'asdf',
})