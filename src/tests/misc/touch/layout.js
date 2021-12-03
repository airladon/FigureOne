/* eslint-disable block-scoped-var */
/* global Fig */

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  var { tools } = require('../../../index').default;
}

const {
  Figure, joinObjects, range, misc,
} = Fig;

let figure;

function createFigure(style) {
  figure = new Figure({
    scene: {
      style,
      left: -4.5,
      bottom: -4.5,
      right: 4.5,
      top: 4.5,
      near: 0.1,
      far: 20,
      fieldOfView: Math.PI * 0.626,
      camera: {
        position: [0, 0, 3],
      },
      light: {
        directional: [1, 0.5, -0.1],
        ambient: 0.1,
        point: [1.85, 4.15, 0.3],
      },
    },
    color: [1, 0, 0, 1],
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
        step: 0.1,
        color: [0.9, 0.9, 0.9, 1],
        line: { width: 0.003 },
      },
    },
    {
      name: 'gridMajor',
      make: 'grid',
      options: {
        bounds: [-4.5, -4.5, 9, 9],
        step: 0.5,
        color: [0.7, 0.7, 0.7, 1],
        line: { width: 0.005 },
      },
    },
  ]);
}


// ***************************************************
// ***************************************************
// ***************************************************
const xValues = range(-4, 4, 1);
const yValues = range(4, -4, -1);
let index = 0;

function onClick(p, e) {
  misc.Console(`${e.custom.indexName}: ${e.name}`);
  e.custom.count += 1;
  figure.get(`${e.name}count`).setText({ text: `${e.custom.count}` });
  figure.animateNextFrame();
}

function makePrimitive(name, options, touch = true, offset = [0, 0]) {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const indexName = `${index}`;
  if (touch) {
    index += 1;
  }
  let touchOptions;
  if (touch === false) {
    touchOptions = undefined;
  } else {
    touchOptions = { onClick };
  }
  const o = joinObjects({}, {
    name,
    make: 'cube',
    color: [1, 0, 0, 1],
    side: 0.3,
    transform: [
      ['s', 1, 1, 1],
      ['r', -Math.PI / 5, 0, 1, 0],
      ['r', Math.PI / 10, 1, 0, 0],
      ['t', x + offset[0], y + offset[1], 0],
    ],
    touch: touchOptions,
    mods: {
      custom: {
        count: 0,
        name,
        indexName,
      },
    },
  }, options);
  if (touch) {
    figure.add({
      make: 'text',
      name: `${name}count`,
      text: '0',
      position: [x, y + 0.3],
    });
  }
  return o;
}

function makeCollection(name, options = {}) {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const indexName = `${index}`;
  const o = joinObjects({}, {
    make: 'collection',
    name,
    elements: [
      {
        make: 'collection',
        elements: [
          makePrimitive('cube1', { side: 0.2 }, false, [-0.2 - x, -y]),
          makePrimitive('cube2', { side: 0.2 }, false, [0.2 - x, -y]),
        ],
        position: [0, -0.2],
      },
    ],
    position: [x, y],
    touch: { onClick },
    mods: {
      custom: {
        count: 0,
        name,
        indexName,
      },
    },
  }, options);
  index += 1;
  figure.add({
    make: 'text',
    name: `${name}count`,
    text: '0',
    position: [x, y + 0.3],
  });
  return o;
}

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  module.exports = {
    makePrimitive,
    makeCollection,
    createFigure,
  };
}
