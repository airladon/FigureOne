// // const { polygon } = Fig.tools.g2;
const { Figure, tools, range } = Fig;
const figure = new Figure({
  color: tools.color.HexToArray('#212529'),
  backgroundColor: tools.color.HexToArray('#f6f7f7'),
});

function makeBlocks(num) {
  return figure.add({
    make: 'collection',
    elements: range(0, num - 1).map(n => ({
      make: 'rectangle',
      width: 0.07,
      height: 0.07,
      yAlign: 'bottom',
      xAlign: 'left',
      position: [n * 0.1, 0.03],
    })),
  });
}

const blocks2 = makeBlocks(2);
const blocks5 = makeBlocks(5);

const tc = (content, comment) => ({
  topComment: {
    content, comment, scale: 0.3, inSize: false,
  },
});

const eqn = figure.add(
  {
    make: 'collections.equation',
    elements: {
      plus: '  +  ',
      equals: '  =  ',
      blocks2,
      blocks5,
      brace: { symbol: 'brace', side: 'top' },
    },
    scale: 1.6,
    formDefaults: { alignment: { fixTo: 'equals' } },
    forms: {
      0: ['2', 'plus', '5', 'equals', '_?'],
      1: [tc('2', 'blocks2'), 'plus', '5', 'equals', '_?'],
      // 1: [{ topComment: { content: '2', comment: 'blocks2', scale: 0.3, inSize: false } }, 'plus', '5', 'equals', '_?'],
      2: ['blocks2', 'plus', '5', 'equals', '_?'],
      3: ['blocks2', 'plus', { topComment: { content: '5', comment: 'blocks5',scale: 0.3, inSize: false } }, 'equals', '_?'],
      4: ['blocks2', 'plus', 'blocks5', 'equals', '_?'],
      5: ['blocks2', ' ', 'blocks5', 'equals', '_?'],
      6: ['blocks2', ' ', 'blocks5', 'equals', '7'],
    },
    position: [0.1, -0.1],
    move: true,
  },
);

const next = figure.add({
  make: 'collections.button', label: 'Next', position: [0.7, -0.8],
});

next.notifications.add('touch', () => eqn.animations.new().nextForm(1).start());

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