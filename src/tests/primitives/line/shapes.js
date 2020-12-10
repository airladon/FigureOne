// eslint-disable-next-line no-undef
const { tools } = Fig;

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

const makeLine = (options, mods = {}) => makeShape(
  'primitives.line',
  tools.misc.joinObjects({}, {
    p1: [0, 0],
    p2: [0.3, 0],
    width: 0.05,
    drawBorderBuffer: 0.05,
    color: [1, 0, 0, 0.6],
    touchBorder: 'buffer',
  }, options),
  mods,
);

/* eslint-disable object-curly-newline */
const shapes = [
  // Updater
  makeLine(),

  // Definitions
  makeLine({ p1: [0, 0], p2: [0.3, 0.3] }),
  makeLine({ p1: [0, 0], length: 0.3, angle: Math.PI / 4 }),
  makeLine({ p1: [0, 0], p2: [0.3, 0], length: 0.3, angle: Math.PI / 4 }),

  // DrawBorder
  makeLine({ drawBorder: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.2], [-0.1, 0.2]] }),

  // DrawBorderBuffer
  makeLine({ drawBorderBuffer: 0.2 }),
  makeLine({ drawBorderBuffer: 0 }),
  makeLine({ drawBorderBuffer: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.2], [-0.1, 0.2]] }),

  // border
  makeLine({ border: 'draw' }),
  makeLine({ border: 'buffer', touchBorder: 0.1 }),
  makeLine({ border: 'rect' }),
  makeLine({ border: 0.1 }),
  makeLine({ border: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),
  makeLine({
    border: [
      [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
      [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
    ],
  }),

  // touchBorder
  makeLine({ touchBorder: 'draw', border: 0.1 }),
  makeLine({ touchBorder: 'buffer' }),
  makeLine({ touchBorder: 'rect' }),
  makeLine({ touchBorder: 0.1 }),
  makeLine({ touchBorder: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),
  makeLine({
    touchBorder: [
      [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
      [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
    ],
  }),
  makeLine({ touchBorder: 'border', border: 0.1 }),

  // Dash
  makeLine({ dash: [0.05, 0.02] }),
  makeLine({ dash: [0.025, 0.05, 0.02] }),
  makeLine({ dash: [0.05, 0.02], widthIs: 'negative' }),
  makeLine({ dash: [0.05, 0.02], widthIs: 'positive' }),
  makeLine({ dash: [0.05, 0.02], widthIs: 0.3 }),

  // WidthIs
  makeLine({ widthIs: 'mid' }),
  makeLine({ widthIs: 'positive' }),
  makeLine({ widthIs: 'negative' }),
  makeLine({ widthIs: 0.3 }),

  // // // Arrow
  makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'triangle' }),
  makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'barb' }),
  makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'reverseTriangle' }),
  makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'polygon' }),
  makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'circle' }),
  makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'bar' }),
  makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'line' }),

  // Line Primitives
  makeLine({ linePrimitives: true, lineNum: 5 }),
  makeLine({ linePrimitives: true, lineNum: 5, close: true }),
];

// module.exports = {
//   shapes,
// };
