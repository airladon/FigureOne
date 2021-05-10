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
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    }),
  };
};

const click = text => tools.misc.Console.bind(this, text);
const txt = (name, options, lineOptions = null) => makeShape(
  name,
  'primitives.textLines',
  tools.misc.joinObjects({}, {
    color: [1, 0, 0, 1],
    defaultTextTouchBorder: [0, 0.1],
    text: [
      { text: 'Make it |so|' },
      { text: '|engage|' },
      'Sir',
    ],
    modifiers: {
      so: {
        onClick: click('so'),
        font: { color: [0, 0, 1, 1] },
      },
      engage: {
        text: 'Engage',
        onClick: click('Engage'),
        font: { color: [0, 0, 1, 1] },
      },
    },
  }, options),
  lineOptions,
);


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
  // Default border: 'rect', touchBorder: 'rect'
  txt('b1', {}),
  txt('b2', { border: 'draw' }),
  txt('b3', { border: 0.1 }),
  txt('b4', { border: 'buffer' }),
  txt('b5', { border: [[0, 0], [0.5, 0], [0, 0.5]] }),

  // TouchBorder
  txt('tb1', { border: 0.05, touchBorder: 'border' }),
  txt('tb2', { border: 0.05, touchBorder: 'rect' }),
  txt('tb3', { border: 0.05, touchBorder: 0.1 }),
  txt('tb4', { border: 0.05, touchBorder: 'draw' }),
  txt('tb5', { border: 0.05, touchBorder: 'buffer' }),
  txt('tb6', { border: 0.05, touchBorder: [[0, 0], [0.5, 0], [0, 0.5]] }),

  // Test individual touch borders
  txt('itb1', {
    modifiers: {
      so: {
        touchBorder: [0, 0.35],
        onClick: click('so'),
      },
      // engage: {
      //   text: 'Engage',
      //   onClick: click('Engage'),
      // },
    },
  }),

  txt('itb2', {
    modifiers: {
      so: {
        touchBorder: [0, 0.35],
        onClick: click('so'),
      },
      engage: {
        text: 'Engage',
        touchBorder: [[0.1, 0], [0.3, 0], [0.3, 0.3]],
        onClick: click('Engage'),
      },
    },
  }),

  // /*
  // ..........###....##.......####..######...##....##
  // .........##.##...##........##..##....##..###...##
  // ........##...##..##........##..##........####..##
  // .......##.....##.##........##..##...####.##.##.##
  // .......#########.##........##..##....##..##..####
  // .......##.....##.##........##..##....##..##...###
  // .......##.....##.########.####..######...##....##
  // */
  txt('a1', { xAlign: 'left', yAlign: 'bottom' }),
  txt('a2', { xAlign: 'left', yAlign: 'baseline' }),
  txt('a3', { xAlign: 'center', yAlign: 'middle' }),
  txt('a4', { xAlign: 'right', yAlign: 'top' }),

  /*
  .............##.##.....##..######..########.####.########.##....##
  .............##.##.....##.##....##....##.....##..##........##..##.
  .............##.##.....##.##..........##.....##..##.........####..
  .............##.##.....##..######.....##.....##..######......##...
  .......##....##.##.....##.......##....##.....##..##..........##...
  .......##....##.##.....##.##....##....##.....##..##..........##...
  ........######...#######...######.....##....####.##..........##...
  */
  txt('a5', { justify: 'center', xAlign: 'left', yAlign: 'bottom' }),
  txt('a6', { justify: 'center', xAlign: 'left', yAlign: 'baseline' }),
  txt('a7', { justify: 'center', xAlign: 'center', yAlign: 'middle' }),
  txt('a8', { justify: 'center', xAlign: 'right', yAlign: 'top' }),
  txt('a9', { justify: 'right', xAlign: 'left', yAlign: 'bottom' }),
  txt('a10', { justify: 'right', xAlign: 'left', yAlign: 'baseline' }),
  txt('a11', { justify: 'right', xAlign: 'center', yAlign: 'middle' }),
  txt('a12', { justify: 'right', xAlign: 'right', yAlign: 'top' }),
  txt('a13', {
    text: [
      'Make it |so|',
      {
        text: '|engage|',
        justify: 'center',
      },
      'Sir',
    ],
    xAlign: 'center',
  }),

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
  txt('f1', { font: { size: 0.2, style: 'italic' }, xAlign: 'center' }),
  txt('f2', { font: { color: [0, 1, 0, 1], weight: 'bold' } }),

  // Custom Fonts
  txt('f3', {
    text: [
      {
        text: 'Make it |so| ',
        font: { size: 0.1, style: 'normal', color: [0, 0, 1, 1] },
      },
      { text: '|engage|' },
      'Sir',
    ],
    font: { size: 0.2, style: 'italic' },
  }),

  /*
  ........######...#######..##........#######..########.
  .......##....##.##.....##.##.......##.....##.##.....##
  .......##.......##.....##.##.......##.....##.##.....##
  .......##.......##.....##.##.......##.....##.########.
  .......##.......##.....##.##.......##.....##.##...##..
  .......##....##.##.....##.##.......##.....##.##....##.
  ........######...#######..########..#######..##.....##
  */
  txt('c1', { color: [0, 0, 1, 1] }),
  // font overrides color
  txt('c2', { font: { color: [0, 1, 0, 1] }, color: [0, 0, 1, 1] }),

  /*
  .......##.......####.##....##.########.....######..########...######.
  .......##........##..###...##.##..........##....##.##.....##.##....##
  .......##........##..####..##.##..........##.......##.....##.##......
  .......##........##..##.##.##.######.......######..########..##......
  .......##........##..##..####.##................##.##........##......
  .......##........##..##...###.##..........##....##.##........##....##
  .......########.####.##....##.########.....######..##.........######.
  */
  txt('ls1', { lineSpace: 0.2 }),
  txt('ls2', {
    text: [
      'Make it |so|',
      { text: '|engage|', lineSpace: 0.2 },
      'Sir',
    ],
  }),

  // /*
  // .##.....##.########..########.....###....########.########
  // .##.....##.##.....##.##.....##...##.##......##....##......
  // .##.....##.##.....##.##.....##..##...##.....##....##......
  // .##.....##.########..##.....##.##.....##....##....######..
  // .##.....##.##........##.....##.#########....##....##......
  // .##.....##.##........##.....##.##.....##....##....##......
  // ..#######..##........########..##.....##....##....########
  // */
  txt('u1', { xAlign: 'center' }),
  txt('u2', { xAlign: 'center' }),
  txt('u3', { xAlign: 'center' }),
  txt('u4', { xAlign: 'center' }),
  txt('u5', { xAlign: 'center' }),
  txt('u6', { xAlign: 'center' }),
];
figure.add(arrows);
figure.getElement('u1').custom.setText('updated ');
figure.getElement('u2').custom.setText('updated ', 2);
figure.getElement('u2').custom.setText('updated ', 3);
figure.getElement('u3').custom.setText({
  text: 'updated',
  touchBorder: [0, 0.1, 0.1, 0.1],
  font: { color: [0, 0.5, 0, 1], size: 0.2 },
  onClick: () => tools.misc.Console('Updated!!'),
}, 3);
figure.getElement('u4').custom.updateText({ text: 'updated' });
figure.getElement('u5').custom.updateText({ text: 'updated |so| there' });
figure.getElement('u6').custom.updateText({
  text: [
    'A |line|',
    {
      text: 'A second |line|',
      font: { size: 0.1, style: 'normal', color: [1, 0, 1, 1] },
    },
  ],
  modifiers: {
    line: { font: { size: 0.15, color: [1, 0, 0, 1] } },
  },
  color: [0, 0, 1, 1],
  xAlign: 'left',
});

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
  for (let j = 0; j < element.drawBorderBuffer.length; j += 1) {
    figure.add({
      name: `textBuffer${i}${j}`,
      make: 'polyline',
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
