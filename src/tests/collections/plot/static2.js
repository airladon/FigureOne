/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var, object-property-newline */

if (typeof process === 'object') {
  /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
  var { tools } = require('../../../index').default;
  var { makeShape } = require('./common');
}

const xValues1 = tools.math.range(-figureWidth / 2 + 0.5, figureWidth / 2 - 0.5, 2);
const yValues1 = tools.math.range(figureHeight / 2 - 1, -figureHeight / 2 + 1, -2);

function getP(index) {
  return new tools.g2.Point(
    xValues1[index % xValues1.length],
    yValues1[Math.floor(index / xValues1.length)],
  );
}

function getShapes(getPos) {
  const shape = (name, options, pos) => makeShape(name, options, pos, getPos);

  /* eslint-disable object-curly-newline */
  return [
    /*
    .########..##....##
    .##.....##.###...##
    .##.....##.####..##
    .########..##.##.##
    .##........##..####
    .##........##...###
    .##........##....##
    */
    shape('pan', { pan: true }),
    shape('panxy', { pan: 'xy' }),
    shape('panx', { pan: 'x' }),
    shape('pany', { pan: 'y' }),
    shape('panEmptyOptions', { pan: {} }),
    shape('panAxisMin', { pan: 'xy', x: { min: -20, max: 20 }, y: { min: -2000, max: 2000 } }),
    shape('panAxisMax', { pan: 'xy', x: { min: -20, max: 20 }, y: { min: -2000, max: 2000 } }),
    shape('panDeltaDraw', { pan: { axis: 'xy' } }),

    /*
    .##.....##.####.########..########....###....##.....##.########..######.
    .##.....##..##..##.....##.##.........##.##....##...##..##.......##....##
    .##.....##..##..##.....##.##........##...##....##.##...##.......##......
    .#########..##..##.....##.######...##.....##....###....######....######.
    .##.....##..##..##.....##.##.......#########...##.##...##.............##
    .##.....##..##..##.....##.##.......##.....##..##...##..##.......##....##
    .##.....##.####.########..########.##.....##.##.....##.########..######.
    */
    shape('hidex', { x: { show: false } }),
    shape('hidey', { y: { show: false } }),
    shape('hide', { x: { show: false }, y: { show: false } }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  pan: e => e.panDeltaValue([6, 200]),
  panxy: e => e.panDeltaValue([6, 200]),
  panx: e => e.panDeltaValue([6, 200]),
  pany: e => e.panDeltaValue([6, 200]),
  panEmptyOptions: e => e.panDeltaValue([6, 200]),
  panAxisMin: e => e.panDeltaValue([-5000, -5000]),
  panAxisMax: e => e.panDeltaValue([5000, 5000]),
  panDeltaDraw: e => e.panDeltaDraw([0.5, 0.5]),
};

const getValues = {
  // getAngle: {
  //   element: 'border-children',
  //   expect: 1,
  //   when: e => tools.math.round(e.getAngle(), 3),
  // },
};


const move = {
  // defaultTouch: {
  //   element: 'defaultTouch',
  //   events: [
  //     ['touchDown', [0, 0]],
  //   ],
  // },
  // 'on-color': {
  //   element: 'on-color',
  //   events: [
  //     ['touchDown', [0, 0]],
  //   ],
  // },
  // 'colors-switch': {
  //   element: 'colors-switch',
  //   events: [
  //     ['touchDown', [0, 0]],
  //   ],
  // },
  // movePad: {
  //   element: 'move-pad',
  //   events: [
  //     ['touchDown', [0, 0]],
  //     ['touchMove', [-0.1, -0.1]],
  //     ['touchMove', [-0.1, -0.1]],
  //     ['touchUp'],
  //     ['touchDown', [0.3, 0]],
  //     ['touchMove', [0.4, 0.1]],
  //     ['touchMove', [0.4, 0.1]],
  //     ['touchUp'],
  //     ['touchDown', [0, 0.3]],
  //     ['touchMove', [-0.1, 0.4]],
  //     ['touchMove', [-0.1, 0.4]],
  //     ['touchUp'],
  //   ],
  // },
};

if (typeof process === 'object') {
  module.exports = {
    getShapes,
    updates,
    getValues,
    move,
  };
} else {
  figure.add(getShapes(index => getP(index)));
  startUpdates = () => {
    Object.keys(updates).forEach((name) => {
      updates[name](figure.getElement(name));
      figure.setFirstTransform();
    });
  };
  startUpdates();

  startGetValues = () => {
    if (getValues == null || Object.keys(getValues).length === 0) {
      return;
    }
    // tools.misc.Console('');
    // tools.misc.Console('Get Values');
    Object.keys(getValues).forEach((title) => {
      const value = getValues[title].when(figure.getElement(getValues[title].element));
      const expected = getValues[title].expect;
      const result = JSON.stringify(expected) === JSON.stringify(value);
      if (result) {
        tools.misc.Console(`pass: ${title}`);
      } else {
        tools.misc.Console(`fail: ${title}: Expected: ${getValues[title].expect} - Got: ${value}`);
      }
    });
  };
  startGetValues();

  startMove = () => {
    if (move == null || Object.keys(move).length === 0) {
      return;
    }
    Object.keys(move).forEach((name) => {
      const element = figure.getElement(move[name].element);
      const p = element.getPosition('figure');
      move[name].events.forEach((event) => {
        const [action] = event;
        const loc = tools.g2.getPoint(event[1] || [0, 0]);
        figure[action]([loc.x + p.x, loc.y + p.y]);
      });
    });
    figure.setFirstTransform();
  };
  startMove();
}
