// var { tools } = Fig;
let tools;
let Figure;
let figure;
if (typeof process === 'object') {
  /* eslint-disable global-require */
  tools = require('../../../index.js').default.tools;
  Figure = require('../../../index.js').default.Figure;
} else {
  /* global Fig */
  tools = Fig.tools;
  Figure = Fig.Figure;
  const canvas = document.getElementById('figureOneContainer');
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  const pixelsPerUnit = 200;
  const figureWidth = width / pixelsPerUnit;
  const figureHeight = height / pixelsPerUnit;

  figure = new Figure({
    limits: [-figureWidth / 2, -figureHeight / 2, figureWidth, figureHeight],
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
        bounds: [-figureWidth / 2, -figureHeight / 2, figureWidth, figureHeight],
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
        bounds: [-figureWidth / 2, -figureHeight / 2, figureWidth, figureHeight],
        yStep: 0.5,
        xStep: 0.5,
        color: [0.7, 0.7, 0.7, 1],
        line: { width: 0.004 },
      },
    },
  ]);
}

// const { Figure } = Fig;


// ***************************************************
// ***************************************************
// ***************************************************
const xValues = tools.math.range(-4, 3.5, 1);
const yValues = tools.math.range(3.5, -3.5, -1);
let index = 0;
const makeShape = (name, method, elements, options) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const indexName = `${index}`;
  index += 1;
  return {
    name,
    method,
    elements,
    options: tools.misc.joinObjects({}, {
      position: [x, y],
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    }),
  };
};

const elem = (name, options) => ({
  name,
  method: 'polygon',
  options: tools.misc.joinObjects({}, {
    radius: 0.1,
    position: [0, name === 'a' ? 0.2 : -0.2],
    drawBorderBuffer: 0.05,
  }, options),
  mods: {
    // isTouchable: true,
    touchBorder: 'buffer',
    // onClick: () => tools.misc.Console(name),
  },
});
const coll = (name, elements = {}, options = {}, mods = {}) => {
  const elems = tools.misc.joinObjects({}, {
    a: {},
    b: {},
  }, elements);
  const elemA = elem('a', elems.a);
  const elemB = elem('b', elems.b);
  return makeShape(
    name,
    'collections.collection',
    [elemA, elemB],
    tools.misc.joinObjects({}, {
      // drawBorderBuffer: 0.05,
      color: [1, 0, 0, 0.6],
      // touchBorder: 'children',
    }, options),
    mods,
  );
};

/* eslint-disable object-curly-newline */
// eslint-disable-next-line no-unused-vars
const shapes = [
  /*
  .......########...#######..########..########..########.########.
  .......##.....##.##.....##.##.....##.##.....##.##.......##.....##
  .......##.....##.##.....##.##.....##.##.....##.##.......##.....##
  .......########..##.....##.########..##.....##.######...########.
  .......##.....##.##.....##.##...##...##.....##.##.......##...##..
  .......##.....##.##.....##.##....##..##.....##.##.......##....##.
  .......########...#######..##.....##.########..########.##.....##
  */
  coll('default'),
  coll('border-children', {}, { border: 'children' }),
  coll('border-rect', {}, { border: 'rect' }),
  coll('border-number', {}, { border: 0.1 }),
  coll('border-custom', {}, { border: [[0, 0], [0.3, 0], [0, 0.3]] }),
  coll('border-rect-a-buffer', { a: { border: 'buffer' } }, { border: 'rect' }),

  coll('touchBorder-children', {}, { touchBorder: 'children' }),
  coll('touchBorder-border', {}, { touchBorder: 'border' }),
  coll('touchBorder-rect', {}, { touchBorder: 'rect' }),
  coll('touchBorder-number', {}, { touchBorder: 0.1 }),
  coll('touchBorder-custom', {}, { touchBorder: [[0, 0], [0.3, 0], [0, 0.3]] }),

  /*
  .......##.....##.########..########.....###....########.########
  .......##.....##.##.....##.##.....##...##.##......##....##......
  .......##.....##.##.....##.##.....##..##...##.....##....##......
  .......##.....##.########..##.....##.##.....##....##....######..
  .......##.....##.##........##.....##.#########....##....##......
  .......##.....##.##........##.....##.##.....##....##....##......
  ........#######..##........########..##.....##....##....########
  */
  coll('Update-a'),
  coll('Update-touchBorder'),
];

if (typeof process === 'object') {
  module.exports = {
    shapes,
  };
}
