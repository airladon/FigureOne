// eslint-disable-next-line no-undef
const { Figure, tools } = Fig;

const figure = new Figure({
  scene: {
    left: -4.5, bottom: -4.5, right: 4.5, top: 4.5,
  },
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

figure.add([
  {
    name: 'origin',
    make: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1],
    },
  },
  {
    name: 'grid',
    make: 'grid',
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
    make: 'grid',
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
const click = text => tools.misc.Console.bind(this, text);
const makeShape = (name, make, options, lineOptions = null) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  // const name = `_${index}`;
  const indexName = `${index}`;
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
    make,
    options: tools.misc.joinObjects({}, {
      position: [x, y],
      line,
      touchBorder: 'buffer',
      text: [
        { text: 'a', onClick: click('a') },
        { text: 'b', onClick: click('b'), location: [0.2, 0.1] },
      ],
      // defaultTextTouchBorder: 0.1,
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    }),
  };
};

const txt = (name, options, lineOptions = null) => makeShape(
  name,
  'primitives.txt',
  tools.misc.joinObjects({}, {
    color: [1, 0, 0, 1],
    touchBorder: 'buffer',
    type: 'bmp',
  }, options),
  lineOptions,
);

// function clk(text) { tools.misc.Console(text); }

/* eslint-disable object-curly-newline */
const arrows = [
  /*
  .......########...#######..########..########..########.########...######.
  .......##.....##.##.....##.##.....##.##.....##.##.......##.....##.##....##
  .......##.....##.##.....##.##.....##.##.....##.##.......##.....##.##......
  .......########..##.....##.########..##.....##.######...########...######.
  .......##.....##.##.....##.##...##...##.....##.##.......##...##.........##
  .......##.....##.##.....##.##....##..##.....##.##.......##....##..##....##
  .......########...#######..##.....##.########..########.##.....##..######.
  */
  // Default border: 'draw', touchBorder: 'buffer'
  txt('b1'),
  txt('b2', { border: 'rect' }),
  txt('b3', { border: 0.1 }),
  txt('b4', { border: [0.1, 0.2] }),
  txt('b5', { border: [[0, 0], [0.5, 0], [0, 0.5]] }),
  txt('b6', { border: [[[0, 0], [0.5, 0], [0, 0.5]]] }),

  txt('tb1', { touchBorder: 'rect' }),
  txt('tb2', { touchBorder: 0.1 }),
  txt('tb3', { touchBorder: [0.1, 0.2] }),
  txt('tb4', { touchBorder: [[0, 0], [0.5, 0], [0, 0.5]] }),
  txt('tb5', { touchBorder: [[[0, 0], [0.5, 0], [0, 0.5]]] }),
  txt('tb6', { border: 0.1, touchBorder: 'border' }),

  /*
  ....###....########........##.##.....##..######..########
  ...##.##...##.....##.......##.##.....##.##....##....##...
  ..##...##..##.....##.......##.##.....##.##..........##...
  .##.....##.##.....##.......##.##.....##..######.....##...
  .#########.##.....##.##....##.##.....##.......##....##...
  .##.....##.##.....##.##....##.##.....##.##....##....##...
  .##.....##.########...######...#######...######.....##...
  */
  txt('ad1', { adjustments: { width: 0.1 } }),
  txt('ad2', { adjustments: { descent: 0.1 } }),
  txt('ad3', { adjustments: { ascent: 0.1 } }),
  txt('ad4', { adjustments: { width: 0.2, descent: 0.3, ascent: 0.1 } }),

  /*
  ..........###....##.......####..######...##....##
  .........##.##...##........##..##....##..###...##
  ........##...##..##........##..##........####..##
  .......##.....##.##........##..##...####.##.##.##
  .......#########.##........##..##....##..##..####
  .......##.....##.##........##..##....##..##...###
  .......##.....##.########.####..######...##....##
  */
  txt('a1', { text: 'gG', xAlign: 'left', yAlign: 'bottom' }),
  txt('a2', { text: 'gG', xAlign: 'left', yAlign: 'baseline' }),
  txt('a3', { text: 'gG', xAlign: 'center', yAlign: 'middle' }),
  txt('a4', { text: 'gG', xAlign: 'right', yAlign: 'top' }),

  /*
  .########..#######..##....##.########
  .##.......##.....##.###...##....##...
  .##.......##.....##.####..##....##...
  .######...##.....##.##.##.##....##...
  .##.......##.....##.##..####....##...
  .##.......##.....##.##...###....##...
  .##........#######..##....##....##...
  */
  txt('f1', { text: 'aBQpf' }),
  txt('f2', { text: 'aBQpf', font: { family: 'Times' } }),
  txt('f3', { text: 'aBQpf', font: { family: 'Times New Roman' } }),
  txt('f4', { text: 'aBQpf', font: { family: 'Arial' } }),
  txt('f5', { text: 'aBQpf', font: { family: 'Helvetica' } }),
  txt('f6', { text: 'aBQpf', font: { size: 0.2, style: 'italic' } }),
  txt('f7', { text: 'aBQpf', font: { underline: true } }),
  txt('f8', { text: 'aBQpf', font: { underline: { descent: -0.05 } } }),
  txt('f9', { text: 'aBQpf', font: { underline: { descent: 0.1, width: 0.05, color: [0, 0, 1, 1] } } }),
  txt('f10', { text: 'aBQpf', font: { underline: { descent: -0.15, width: 0.05, color: [0, 0, 1, 1] }, atlasColor: true } }),
  // to test maxAscent, maxDescent, descent, midAscent need to use new fonts as
  // the atlas is only created once, so when created previously without the mods
  // then the mods will not be there
  txt('f11', { text: 'aBQpf', font: { maxDescent: 1, descent: 0.5, size: 0.101 } }),
  txt('f12', { text: 'Qa', font: { descent: 0.5, size: 0.102 } }),
  txt('f13', { text: 'aBQpf', font: { maxAscent: 2, midAscent: 1.5, size: 0.103 } }),
  txt('f14', { text: 'a', font: { midAscent: 1.5, size: 0.104 } }),

  /*
  ..######...#######..##........#######..########.
  .##....##.##.....##.##.......##.....##.##.....##
  .##.......##.....##.##.......##.....##.##.....##
  .##.......##.....##.##.......##.....##.########.
  .##.......##.....##.##.......##.....##.##...##..
  .##....##.##.....##.##.......##.....##.##....##.
  ..######...#######..########..#######..##.....##
  */
  txt('c1', { color: [0, 0, 1, 1] }),
  txt('c2', { color: [0, 0, 1, 1], font: { color: [0, 1, 1, 1] } }),
  /*
  .##.....##.########..########.....###....########.########..######.
  .##.....##.##.....##.##.....##...##.##......##....##.......##....##
  .##.....##.##.....##.##.....##..##...##.....##....##.......##......
  .##.....##.########..##.....##.##.....##....##....######....######.
  .##.....##.##........##.....##.#########....##....##.............##
  .##.....##.##........##.....##.##.....##....##....##.......##....##
  ..#######..##........########..##.....##....##....########..######.
  */
  txt('u1'),
  txt('u2'),

  /*
  ..#######..##.....##.########.##.......####.##....##.########
  .##.....##.##.....##....##....##........##..###...##.##......
  .##.....##.##.....##....##....##........##..####..##.##......
  .##.....##.##.....##....##....##........##..##.##.##.######..
  .##.....##.##.....##....##....##........##..##..####.##......
  .##.....##.##.....##....##....##........##..##...###.##......
  ..#######...#######.....##....########.####.##....##.########
  */
  txt('o1', { font: { outline: true, size: 0.4 } }),
  txt('o2', { font: { outline: { width: 0.015, fill: false }, size: 0.4 } }),
  txt('o3', { font: { outline: { color: [0, 1, 0, 1] }, color: [0, 0, 1, 1], atlasColor: true, size: 0.4 } }),
  txt('o4', { font: { outline: {}, color: [0, 0, 1, 1], size: 0.4 } }),
  txt('o5', { font: { outline: { fill: true, color: [0, 1, 0, 1] }, size: 0.4 } }),
  txt('o6', { font: { outline: { fill: true, color: [0, 0, 1, 1] }, atlasColor: true, size: 0.4 } }),

  /*
  .##.....##..#######..########...######.
  .###...###.##.....##.##.....##.##....##
  .####.####.##.....##.##.....##.##......
  .##.###.##.##.....##.##.....##..######.
  .##.....##.##.....##.##.....##.......##
  .##.....##.##.....##.##.....##.##....##
  .##.....##..#######..########...######.
  */
  txt('m1', { text: 'a', font: { family: 'times', modifiers: { a: { a: 2, d: 1 } } } }),
];
figure.add(arrows);
figure.getElement('u1').setText('updated');
figure.getElement('u2').setText({ text: 'update', xAlign: 'center', yAlign: 'top', font: { size: 0.2, color: [0, 0, 1, 1] } });
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
//   font: { color: [0, 0, 1, 1] },
//   xAlign: 'right',
// });

for (let i = 0; i < index; i += 1) {
  const element = figure.elements.elements[figure.elements.drawOrder[i + 3]];
  const border = element.getBorder('draw', 'border');
  for (let j = 0; j < border.length; j += 1) {
    figure.add({
      name: `border${i}${j}`,
      make: 'polyline',
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
      make: 'polyline',
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

  // for (let j = 0; j < element.drawBorderBuffer.length; j += 1) {
  //   figure.add({
  //     name: `textBuffer${i}${j}`,
  //     make: 'polyline',
  //     options: {
  //       points: element.drawBorderBuffer[j],
  //       width: 0.01,
  //       color: [1, 0, 1, 1],
  //       close: true,
  //       dash: [0.02, 0.02, 0.04],
  //       position: element.getPosition(),
  //     },
  //   });
  // }
}
