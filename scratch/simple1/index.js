// // const { polygon } = Fig.tools.g2;
const { Figure, tools, range } = Fig;
const figure = new Figure({
  color: tools.color.HexToArray('#212529'),
  backgroundColor: tools.color.HexToArray('#f6f7f7'),
});

// const next = figure.add({
//   make: 'collections.button', label: 'Next', position: [0.7, -0.8],
// });

// next.notifications.add('touch', () => eqn.animations.new().nextForm(1).start());

const rect = figure.add({
  make: 'collections.rectangle',
  fill: [0, 1, 1, 0.5],
  label: {
    text: '',
    font: { size: 0.1 },
  },
});
rect.setLabel('asdf')
const div = document.createElement('div');
div.style.width = '100px';
div.style.height = '100px';
div.style.backgroundColor = 'red';
figure.htmlCanvas.appendChild(div);
const abc = figure.add({
  make: 'html',
  name: 'asdf',
  element: div,
  // wrap: false,
  // id: 'asdfasdf',
  position: [0, 0],
});

const xyz = figure.add({
  make: 'polygon',
  radius: 0.1,
})
// abc.hide()
// abc.show()

abc.animations.new()
  .position({ target: [1, 0], duration: 1 })
  .start();

xyz.animations.new()
  .position({ target: [1, 0], duration: 1 })
  .start();
// function anyBase(input, base) {
//   sum=0;
//   for(let i = 0; i < input.length; i += 1) {
//     sum += base ** (input.length - i - 1) * parseInt(input[i], 10);
//   }
//   console.log(sum);
// }
// for (let i = 3; i < 100; i += 1) {
//   anyBase('122221', i);
// }