let tools;
if (typeof process === 'object') {
  // eslint-disable-next-line global-require
  tools = require('../../../index.js').default.tools;
} else {
  // eslint-disable-next-line no-undef
  tools = Fig.tools;
}


// ***************************************************
// ***************************************************
// ***************************************************
const xValues = tools.math.range(-4, 3.5, 1);
const yValues = tools.math.range(3.5, -3.5, -1);
let index = 0;
const makeShape = (name, make, options) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const indexName = `${index}`;
  index += 1;
  return {
    name,
    make,
    options: tools.misc.joinObjects({}, {
      position: [x, y],
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    }),
  };
};

const makeLine = (name, options, mods = {}) => makeShape(
  name,
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
// eslint-disable-next-line no-unused-vars
const shapes = [
  // Updater
  makeLine('Update1'),

  // Definitions
  makeLine('definition-points', { p1: [0, 0], p2: [0.3, 0.3] }),
  makeLine('definition-length', { p1: [0, 0], length: 0.3, angle: Math.PI / 4 }),
  makeLine('definition-override', { p1: [0, 0], p2: [0.3, 0], length: 0.3, angle: Math.PI / 4 }),

  // DrawBorder
  makeLine('drawBorder-custom', { drawBorder: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.2], [-0.1, 0.2]] }),

  // DrawBorderBuffer
  makeLine('drawBorderBuffer-number', { drawBorderBuffer: 0.2 }),
  makeLine('drawBorderBuffer-0', { drawBorderBuffer: 0 }),
  makeLine('drawBorderBuffer-custom', { drawBorderBuffer: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.2], [-0.1, 0.2]] }),

  // border
  makeLine('border-draw', { border: 'draw' }),
  makeLine('border-buffer', { border: 'buffer', touchBorder: 0.1 }),
  makeLine('border-rect', { border: 'rect' }),
  makeLine('border-num', { border: 0.1 }),
  makeLine('border-custom', { border: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),
  makeLine('border-custom2', {
    border: [
      [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
      [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
    ],
  }),

  // touchBorder
  makeLine('touchBorder-draw', { touchBorder: 'draw', border: 0.1 }),
  makeLine('touchBorder-buffer', { touchBorder: 'buffer' }),
  makeLine('touchBorder-rect', { touchBorder: 'rect' }),
  makeLine('touchBorder-num', { touchBorder: 0.1 }),
  makeLine('touchBorder-custom', { touchBorder: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),
  makeLine('touchBorder-custom2', {
    touchBorder: [
      [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
      [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
    ],
  }),
  makeLine('touchBorder-border', { touchBorder: 'border', border: 0.1 }),

  // Dash
  makeLine('dash', { dash: [0.05, 0.02] }),
  makeLine('dash-offset', { dash: [0.025, 0.05, 0.02] }),
  makeLine('dash-neg', { dash: [0.05, 0.02], widthIs: 'negative' }),
  makeLine('dash-pos', { dash: [0.05, 0.02], widthIs: 'positive' }),
  makeLine('dash-widthIsNum', { dash: [0.05, 0.02], widthIs: 0.3 }),

  // WidthIs
  makeLine('widthIs-mid', { widthIs: 'mid' }),
  makeLine('widthIs-pos', { widthIs: 'positive' }),
  makeLine('widthIs-neg', { widthIs: 'negative' }),
  makeLine('widthIs-num', { widthIs: 0.3 }),

  // Arrow
  makeLine('arrow-tri', { p2: [0.6, 0], width: 0.025, arrow: 'triangle' }),
  makeLine('arrow-barb', { p2: [0.6, 0], width: 0.025, arrow: 'barb' }),
  makeLine('arrow-revTri', { p2: [0.6, 0], width: 0.025, arrow: 'reverseTriangle' }),
  makeLine('arrow-poly', { p2: [0.6, 0], width: 0.025, arrow: 'polygon' }),
  makeLine('arrow-circ', { p2: [0.6, 0], width: 0.025, arrow: 'circle' }),
  makeLine('arrow-bar', { p2: [0.6, 0], width: 0.025, arrow: 'bar' }),
  makeLine('arrow-line', { p2: [0.6, 0], width: 0.025, arrow: 'line' }),

  // Line Primitives
  makeLine('linePrimitives-open', { linePrimitives: true, lineNum: 5 }),
  makeLine('linePrimitives-close', { linePrimitives: true, lineNum: 5, close: true }),
];

if (typeof process === 'object') {
  module.exports = {
    shapes,
  };
}
