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
const makeShape = (name, method, options, lineOptions = null) => {
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

const click = text => tools.misc.Console.bind(this, text);
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
    defaultTextTouchBorder: [0, 0.1],
    text: [
      { text: 'great ', onClick: click('great') },
      { text: 'scott', onClick: click('scott') },
    ],
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
  // Default border: 'draw', touchBorder: 'buffer'
  txt('b1', {}),
  txt('b2', { border: 'rect' }),
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
    text: [
      { text: 'great ', onClick: click('great'), touchBorder: [0, 0.15] },
      { text: 'scott', onClick: click('scott') },
    ],
  }),

  txt('itb2', {
    text: [
      { text: 'great ', onClick: click('great'), touchBorder: [0, 0.15] },
      { text: 'scott', onClick: click('scott'), touchBorder: [[0.1, 0], [0.3, 0], [0.3, 0.3]] },
    ],
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
  // Default Align
  txt('a1', { xAlign: 'left', yAlign: 'bottom' }),
  txt('a2', { xAlign: 'left', yAlign: 'baseline' }),
  txt('a3', { xAlign: 'center', yAlign: 'middle' }),
  txt('a4', { xAlign: 'right', yAlign: 'top' }),

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
  txt('f2', { font: { color: [0, 0, 1, 1], weight: 'bold' } }),

  // Custom Fonts
  txt('f3', {
    text: [
      {
        text: 'great',
        font: { size: 0.1, style: 'normal', color: [0, 0, 1, 1] },
        onClick: click('great'),
      },
      {
        text: 'scott',
        onClick: click('scott'),
      },
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
  ........#######..########.########..######..########.########
  .......##.....##.##.......##.......##....##.##..........##...
  .......##.....##.##.......##.......##.......##..........##...
  .......##.....##.######...######....######..######......##...
  .......##.....##.##.......##.............##.##..........##...
  .......##.....##.##.......##.......##....##.##..........##...
  ........#######..##.......##........######..########....##...
  */
  txt('o1', {
    text: [
      {
        text: 'great',
        onClick: click('great'),
      },
      {
        text: 'question',
        offset: [0.05, 0.05],
        onClick: click('question'),
      },
      ' batman ',
      {
        text: 'its the',
        offset: [0, -0.05],
        onClick: click('its the'),
      },
      {
        text: 'crazy',
        offset: [-0.05, 0.1],
        inLine: false,
        onClick: click('crazy'),
      },
      {
        text: 'riddler',
        inLine: false,
        onClick: click('riddler'),
      },
    ],
    font: { size: 0.06 },
    xAlign: 'center',
  }),

  /*
  .##.....##.########..########.....###....########.########
  .##.....##.##.....##.##.....##...##.##......##....##......
  .##.....##.##.....##.##.....##..##...##.....##....##......
  .##.....##.########..##.....##.##.....##....##....######..
  .##.....##.##........##.....##.#########....##....##......
  .##.....##.##........##.....##.##.....##....##....##......
  ..#######..##........########..##.....##....##....########
  */
  txt('u1', { xAlign: 'center' }),
  txt('u2', { xAlign: 'center' }),
  txt('u3', {
    text: [
      'gG',
      { text: 'gB', location: [0.2, 0.2] },
    ],
    xAlign: 'center',
  }),
  txt('u4', { text: 'gG', xAlign: 'right' }),
  // txt('u5', { text: 'gG', xAlign: 'right' }),
];
figure.add(arrows);
figure.getElement('u1').custom.setText('updated ');
figure.getElement('u2').custom.setText({
  text: 'updated',
  touchBorder: [0, 0.1, 0.1, 0.1],
  font: { color: [0, 0.5, 0, 1], size: 0.2 },
  onClick: () => tools.misc.Console('Updated!!'),
}, 1);
figure.getElement('u3').custom.updateText({ text: 'hello' });
figure.getElement('u4').custom.updateText({
  text: [
    { text: 'updated ' },
    { text: 'now' },
  ],
  color: [0, 0, 1, 1],
  xAlign: 'right',
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
