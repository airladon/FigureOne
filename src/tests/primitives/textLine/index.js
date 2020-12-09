// eslint-disable-next-line no-undef
const { Figure, tools } = Fig;

const figure = new Figure({
  limits: [-4.5, -4.5, 9, 9],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

figure.add([
  {
    name: 'origin',
    method: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1],
    },
  },
  {
    name: 'grid',
    method: 'grid',
    options: {
      bounds: [-4.5, -4.5, 9, 9],
      yStep: 0.1,
      xStep: 0.1,
      color: [0.9, 0.9, 0.9, 1],
      line: { width: 0.004 },
    },
  },
  {
    name: 'gridMajor',
    method: 'grid',
    options: {
      bounds: [-4.5, -4.5, 9, 9],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.7, 0.7, 0.7, 1],
      line: { width: 0.004 },
    },
  },
]);


// ***************************************************
// ***************************************************
// ***************************************************
const xValues = tools.math.range(-4, 4, 1);
const yValues = tools.math.range(4, -4, -1);
let index = 0;
const makeShape = (name, method, options, lineOptions = null) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  // const name = `_${index}`;
  const indexName = `${index}`
  index += 1;
  let line;
  if (lineOptions != null) {
    line = tools.misc.joinObjects({}, {
      width: 0.05,
      widthIs: 'mid',
    }, lineOptions);
  }
  return {
    name,
    method,
    options: tools.misc.joinObjects({}, {
      position: [x, y],
      line,
      touchBorder: 'buffer',
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    }),
  };
};

const txt = (name, options, lineOptions = null) => makeShape(
  name,
  'primitives.textLine',
  tools.misc.joinObjects({}, {
    // drawBorderBuffer: 0.1,
    color: [1, 0, 0, 1],
    // width: 0.4,
    // height: 0.2,
    // top: 'left',
    touchBorder: 'buffer',
  }, options),
  lineOptions,
);

// function clk(text) { tools.misc.Console(text); }
const click = text => tools.misc.Console.bind(this, text);
/* eslint-disable object-curly-newline */
const arrows = [
  // txt('a1', {
  //   text: ['Hello ', 'world'],
  // }),
  /*
  .......########...#######..########..########..########.########...######.
  .......##.....##.##.....##.##.....##.##.....##.##.......##.....##.##....##
  .......##.....##.##.....##.##.....##.##.....##.##.......##.....##.##......
  .......########..##.....##.########..##.....##.######...########...######.
  .......##.....##.##.....##.##...##...##.....##.##.......##...##.........##
  .......##.....##.##.....##.##....##..##.....##.##.......##....##..##....##
  .......########...#######..##.....##.########..########.##.....##..######.
  */
  // Test default border: 'draw', touchBorder: 'buffer'
  txt('b1', {
    text: [
      { text: 'hello', onClick: click('hello') },
      ' ',
      { text: 'world', onClick: click('world') },
    ],
    defaultTextTouchBorder: [0, 0.1],
  }),

  // // Test border: 'rect'
  // txt('b2', {
  //   border: 'rect',
  //   text: [
  //     { text: 'a', onClick: click('a') },
  //     { text: 'b', onClick: click('b'), location: [0.2, 0.1] },
  //   ],
  //   defaultTextTouchBorder: 0.1,
  // }),

  // // Test border: number
  // txt('b3', {
  //   border: 0.1,
  //   text: [
  //     { text: 'a', onClick: click('a') },
  //     { text: 'b', onClick: click('b'), location: [0.2, 0.1] },
  //   ],
  //   defaultTextTouchBorder: 0.1,
  // }),

  // // Test border: 'buffer'
  // txt('b4', {
  //   border: 'buffer',
  //   text: [
  //     { text: 'a', onClick: click('a') },
  //     { text: 'b', onClick: click('b'), location: [0.2, 0.1] },
  //   ],
  //   defaultTextTouchBorder: 0.1,
  // }),

  // // Test border: 'custom'
  // txt('b5', {
  //   border: [[0, 0], [0.5, 0], [0, 0.5]],
  //   text: [
  //     { text: 'a', onClick: click('a') },
  //     { text: 'b', onClick: click('b'), location: [0.2, 0.1] },
  //   ],
  //   defaultTextTouchBorder: 0.1,
  // }),

  // // Test TouchBorder: 'border'
  // txt('tb1', {
  //   border: 0.05,
  //   touchBorder: 'border',
  //   text: [
  //     { text: 'a', onClick: click('a') },
  //     { text: 'b', onClick: click('b'), location: [0.2, 0.1] },
  //   ],
  //   defaultTextTouchBorder: 0.1,
  // }),

  // // Test TouchBorder: 'rect'
  // txt('tb2', {
  //   border: 0.05,
  //   touchBorder: 'rect',
  //   text: [
  //     { text: 'a', onClick: click('a') },
  //     { text: 'b', onClick: click('b'), location: [0.2, 0.1] },
  //   ],
  //   defaultTextTouchBorder: 0.1,
  // }),

  // // Test TouchBorder: number
  // txt('tb3', {
  //   border: 0.05,
  //   touchBorder: 0.1,
  //   text: [
  //     { text: 'a', onClick: click('a') },
  //     { text: 'b', onClick: click('b'), location: [0.2, 0.1] },
  //   ],
  //   defaultTextTouchBorder: 0.1,
  // }),

  // // Test TouchBorder: draw
  // txt('tb4', {
  //   border: 0.05,
  //   touchBorder: 'draw',
  //   text: [
  //     { text: 'a', onClick: click('a') },
  //     { text: 'b', onClick: click('b'), location: [0.2, 0.1] },
  //   ],
  //   defaultTextTouchBorder: 0.1,
  // }),

  // // Test TouchBorder: buffer
  // txt('tb5', {
  //   border: 0.05,
  //   touchBorder: 'buffer',
  //   text: [
  //     { text: 'a', onClick: click('a') },
  //     { text: 'b', onClick: click('b'), location: [0.2, 0.1] },
  //   ],
  //   defaultTextTouchBorder: 0.1,
  // }),

  // // Test TouchBorder: custom
  // txt('tb6', {
  //   border: 0.05,
  //   touchBorder: [[0, 0], [0.5, 0], [0, 0.5]],
  //   text: [
  //     { text: 'a', onClick: click('a') },
  //     { text: 'b', onClick: click('b'), location: [0.2, 0.1] },
  //   ],
  //   defaultTextTouchBorder: 0.1,
  // }),

  // // Test individual touch borders
  // txt('itb1', {
  //   text: [
  //     { text: 'a', onClick: click('a'), touchBorder: 0.15 },
  //     { text: 'b', onClick: click('b'), location: [0.2, 0.1], touchBorder: 0.05 },
  //   ],
  //   defaultTextTouchBorder: 0.1,
  // }),

  // // Test individual touch custom
  // txt('itb2', {
  //   text: [
  //     {
  //       text: 'a',
  //       onClick: click('a'),
  //       touchBorder: [[-0.1, -0.1], [0.2, -0.1], [-0.1, 0.2]],
  //     },
  //     {
  //       text: 'b',
  //       onClick: click('b'),
  //       location: [0.2, 0.1],
  //       touchBorder: [[0.1, 0], [0.3, 0], [0.3, 0.3]],
  //     },
  //   ],
  //   defaultTextTouchBorder: 0.1,
  // }),

  // /*
  // ..........###....##.......####..######...##....##
  // .........##.##...##........##..##....##..###...##
  // ........##...##..##........##..##........####..##
  // .......##.....##.##........##..##...####.##.##.##
  // .......#########.##........##..##....##..##..####
  // .......##.....##.##........##..##....##..##...###
  // .......##.....##.########.####..######...##....##
  // */
  // // Default Align
  // txt('a1', { text: 'gG', xAlign: 'left', yAlign: 'bottom' }),
  // txt('a2', { text: 'gG', xAlign: 'left', yAlign: 'baseline' }),
  // txt('a3', { text: 'gG', xAlign: 'center', yAlign: 'middle' }),
  // txt('a4', { text: 'gG', xAlign: 'right', yAlign: 'top' }),

  // // Custom Align
  // txt('a5', {
  //   text: [
  //     {
  //       text: 'gG',
  //       xAlign: 'right',
  //       yAlign: 'top',
  //     },
  //     {
  //       text: 'gG',
  //       location: [0.1, 0.1],
  //     },
  //   ],
  //   xAlign: 'left',
  //   yAlign: 'bottom',
  // }),

  // /*
  // .......########..#######..##....##.########
  // .......##.......##.....##.###...##....##...
  // .......##.......##.....##.####..##....##...
  // .......######...##.....##.##.##.##....##...
  // .......##.......##.....##.##..####....##...
  // .......##.......##.....##.##...###....##...
  // .......##........#######..##....##....##...
  // */
  // // Default Fonts
  // txt('f1', { text: 'gG', font: { size: 0.2, style: 'italic' } }),
  // txt('f2', { text: 'gG', font: { color: [0, 0, 1, 1], weight: 'bold' } }),

  // // Custom Fonts
  // txt('f3', {
  //   text: [
  //     {
  //       text: 'gG',
  //       font: { size: 0.1, style: 'normal', color: [0, 0, 1, 1] },
  //     },
  //     {
  //       text: 'gG',
  //       location: [0.15, 0.15],
  //     },
  //   ],
  //   font: { size: 0.2, style: 'italic' },
  // }),

  // /*
  // ........######...#######..##........#######..########.
  // .......##....##.##.....##.##.......##.....##.##.....##
  // .......##.......##.....##.##.......##.....##.##.....##
  // .......##.......##.....##.##.......##.....##.########.
  // .......##.......##.....##.##.......##.....##.##...##..
  // .......##....##.##.....##.##.......##.....##.##....##.
  // ........######...#######..########..#######..##.....##
  // */
  // txt('c1', { text: 'gG', color: [0, 0, 1, 1] }),
  // // font overrides color
  // txt('c2', { text: 'gG', font: { color: [0, 1, 0, 1] }, color: [0, 0, 1, 1] }),

  // /*
  // .##.....##.########..########.....###....########.########
  // .##.....##.##.....##.##.....##...##.##......##....##......
  // .##.....##.##.....##.##.....##..##...##.....##....##......
  // .##.....##.########..##.....##.##.....##....##....######..
  // .##.....##.##........##.....##.#########....##....##......
  // .##.....##.##........##.....##.##.....##....##....##......
  // ..#######..##........########..##.....##....##....########
  // */
  // txt('u1', { text: 'gG', xAlign: 'right' }),
  // txt('u2', { text: 'gG' }),
  // txt('u3', {
  //   text: [
  //     'gG',
  //     { text: 'gB', location: [0.2, 0.2] },
  //   ],
  // }),
  // txt('u4', { text: 'gG', xAlign: 'right' }),
  // txt('u5', { text: 'gG', xAlign: 'right' }),
];
figure.add(arrows);
// figure.getElement('u1').custom.setText('updated');
// figure.getElement('u2').custom.setText({
//   text: 'updated',
//   touchBorder: 0.1,
//   xAlign: 'right',
//   yAlign: 'top',
//   location: [0.1, 0.1],
//   font: { color: [0, 0.5, 0, 1], size: 0.2 },
//   onClick: () => tools.misc.Console('Updated!!'),
// });
// figure.getElement('u3').custom.setText('updated', 1);
// figure.getElement('u4').custom.updateText({ text: 'hello' });
// figure.getElement('u5').custom.updateText({
//   text: [
//     { text: 'updated' },
//     { text: 'now', location: [0, -0.2] },
//   ],
//   color: [0, 0, 1, 1],
//   xAlign: 'right',
// });

console.log(figure.getElement('b1'))

for (let i = 0; i < index; i += 1) {
  const element = figure.elements.elements[figure.elements.drawOrder[i + 3]];
  const border = element.getBorder('draw', 'border');
  for (let j = 0; j < border.length; j += 1) {
    figure.add({
      name: `border${i}${j}`,
      method: 'polyline',
      options: {
        points: border[j],
        width: 0.01,
        color: [0, 0.7, 0, 1],
        close: true,
        position: element.getPosition(),
      },
    });
  }
  const touchBorder = element.getBorder('draw', 'touchBorder');
  for (let j = 0; j < touchBorder.length; j += 1) {
    figure.add({
      name: `buffer${i}${j}`,
      method: 'polyline',
      options: {
        points: touchBorder[j],
        width: 0.01,
        color: [0, 0, 1, 1],
        close: true,
        dash: [0.02, 0.04],
        position: element.getPosition(),
      },
    });
  }
  for (let j = 0; j < element.drawBorderBuffer.length; j += 1) {
    figure.add({
      name: `textBuffer${i}${j}`,
      method: 'polyline',
      options: {
        points: element.drawBorderBuffer[j],
        width: 0.01,
        color: [1, 0, 1, 1],
        close: true,
        dash: [0.02, 0.02, 0.04],
        position: element.getPosition(),
      },
    });
  }
}
