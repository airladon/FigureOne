// eslint-disable-next-line no-undef
const { Figure, tools } = Fig;

const figure = new Figure({
  limits: [-4.5, -4.5, 9, 9],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

// figure.add([
//   {
//     name: 'origin',
//     make: 'polygon',
//     options: {
//       radius: 0.01,
//       line: { width: 0.01 },
//       sides: 10,
//       color: [0.7, 0.7, 0.7, 1],
//     },
//   },
//   {
//     name: 'grid',
//     make: 'grid',
//     options: {
//       bounds: [-4.5, -4.5, 9, 9],
//       yStep: 0.1,
//       xStep: 0.1,
//       color: [0.9, 0.9, 0.9, 1],
//       line: { width: 0.004 },
//     },
//   },
//   {
//     name: 'gridMajor',
//     make: 'grid',
//     options: {
//       bounds: [-4.5, -4.5, 9, 9],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.7, 0.7, 0.7, 1],
//       line: { width: 0.004 },
//     },
//   },
// ]);


// ***************************************************
// ***************************************************
// ***************************************************
const xValues = tools.math.range(-4, 3.5, 1);
const yValues = tools.math.range(3.5, -3.5, -1);
let index = 0;
const makeShape = (method, options, mods) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const name = `_${index}`;
  index += 1;
  return {
    name,
    method,
    options: tools.misc.joinObjects({}, {
      position: [x, y],
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(name),
    }, mods),
  };
};

const makeGrid = (options, mods = {}) => makeShape(
  'primitives.grid',
  tools.misc.joinObjects({}, {
    bounds: [-0.25, -0.25, 0.5, 0.5],
    xStep: 0.1,
    yStep: 0.1,
    line: { width: 0.02 },
    drawBorderBuffer: 0.05,
    color: [1, 0, 0, 0.6],
    touchBorder: 'buffer',
  }, options),
  mods,
);

/* eslint-disable object-curly-newline */
const arrows = [
  // Update
  makeGrid(),
  makeGrid(),

  // Definitions
  makeGrid(),
  makeGrid({ xNum: 3, yNum: 3 }),
  makeGrid({ line: { width: 0.01, dash: [0.04, 0.02] } }),

  // DrawBorder
  makeGrid({ drawBorder: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),

  // // DrawBorderBuffer
  makeGrid({ drawBorderBuffer: 0.2 }),
  makeGrid({ drawBorderBuffer: 0 }),
  makeGrid({
    drawBorderBuffer: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
  }),

  // border
  makeGrid({ border: 'draw' }),
  makeGrid({ border: 'buffer', touchBorder: 0.1 }),
  makeGrid({ border: 'rect' }),
  makeGrid({ border: 0.1 }),
  makeGrid({ border: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),
  makeGrid({
    border: [
      [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
      [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
    ],
  }),

  // touchBorder
  makeGrid({ touchBorder: 'draw' }),
  makeGrid({ touchBorder: 'buffer' }),
  makeGrid({ touchBorder: 'rect' }),
  makeGrid({ touchBorder: 0.1 }),
  makeGrid({ touchBorder: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),
  makeGrid({
    touchBorder: [
      [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
      [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
    ],
  }),
  makeGrid({ touchBorder: 'border', border: 0.1 }),

  // // Line Primitives
  makeGrid({ line: { linePrimitives: true, lineNum: 3 } }),
];
figure.add(arrows);

figure.getElement('_0').custom.updatePoints({ xNum: 3 });
figure.getElement('_1').custom.updatePoints({ drawBorderBuffer: 0.2 });

for (let i = 0; i < index; i += 1) {
  const element = figure.elements.elements[`_${i}`];
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
        dash: [0.05, 0.03],
        color: [0, 0, 1, 1],
        close: true,
        position: element.getPosition(),
      },
    });
  }
}

