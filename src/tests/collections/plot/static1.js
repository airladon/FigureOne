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
    .########.########.....###....##.....##.########
    .##.......##.....##...##.##...###...###.##......
    .##.......##.....##..##...##..####.####.##......
    .######...########..##.....##.##.###.##.######..
    .##.......##...##...#########.##.....##.##......
    .##.......##....##..##.....##.##.....##.##......
    .##.......##.....##.##.....##.##.....##.########
    */
    shape('frameBool', { frame: true }),
    shape('frameColor', { frame: [1, 0.8, 1, 1] }),
    shape('frameLine', { frame: {
      line: { width: 0.02, color: [0, 0, 1, 1] },
      fill: [1, 1, 0.4, 1],
      corner: { radius: 0.1, sides: 10 },
      space: 0.2,
    } }),
    shape('frameWithTitles', { frame: true, title: 'Plot Title' }),

    /*
    ....###....########..########....###...
    ...##.##...##.....##.##.........##.##..
    ..##...##..##.....##.##........##...##.
    .##.....##.########..######...##.....##
    .#########.##...##...##.......#########
    .##.....##.##....##..##.......##.....##
    .##.....##.##.....##.########.##.....##
    */
    shape('plotAreaColor', { plotArea: [1, 1, 0, 1] }),
    shape('plotAreaColorLine', { plotArea: { line: { width: 0.01}, fill: [1, 1, 0, 1] } }),
    shape('plotAreaAndFrame', { plotArea: [1, 1, 0, 1], frame: [1, 0, 1, 1] }),

    /*
    .########..#######..##....##.########
    .##.......##.....##.###...##....##...
    .##.......##.....##.####..##....##...
    .######...##.....##.##.##.##....##...
    .##.......##.....##.##..####....##...
    .##.......##.....##.##...###....##...
    .##........#######..##....##....##...
    */
    shape('font', { font: { family: 'times' }, title: 'Title', legend: true, x: { title: 'x Axis' } }),

    /*
    ..######...#######..##........#######..########.
    .##....##.##.....##.##.......##.....##.##.....##
    .##.......##.....##.##.......##.....##.##.....##
    .##.......##.....##.##.......##.....##.########.
    .##.......##.....##.##.......##.....##.##...##..
    .##....##.##.....##.##.......##.....##.##....##.
    ..######...#######..########..#######..##.....##
    */
    shape('color', { color: [0, 0.5, 0.5, 1], title: 'Title', legend: true, x: { title: 'x Axis' } }),

    /*
    .########.##.....##.########.##.....##.########
    ....##....##.....##.##.......###...###.##......
    ....##....##.....##.##.......####.####.##......
    ....##....#########.######...##.###.##.######..
    ....##....##.....##.##.......##.....##.##......
    ....##....##.....##.##.......##.....##.##......
    ....##....##.....##.########.##.....##.########
    */
    shape('dark', { colorTheme: 'dark', title: 'Title', legend: true, x: { title: 'x Axis' }, trace: [pow(2), pow(2.2), pow(2.4), pow(2.6), pow(2.8), pow(3)] }),
    shape('light', { colorTheme: 'light', frame: [0, 0, 0, 1], title: 'Title', legend: true, x: { title: 'x Axis' }, trace: [pow(2), pow(2.2), pow(2.4), pow(2.6), pow(2.8), pow(3)] }),
    shape('box', { styleTheme: 'box' }),
    shape('numberLine', { styleTheme: 'numberLine' }),
    shape('positiveNumberLine', { styleTheme: 'positiveNumberLine' }),
    shape('numberLineThroughZero', { styleTheme: 'numberLine', x: { start: -10, stop: 10, step: 5 }, y: { start: -100, stop: 100, step: 50 }, grid: false }),
    /*
    .########..#######...#######..##.....##
    ......##..##.....##.##.....##.###...###
    .....##...##.....##.##.....##.####.####
    ....##....##.....##.##.....##.##.###.##
    ...##.....##.....##.##.....##.##.....##
    ..##......##.....##.##.....##.##.....##
    .########..#######...#######..##.....##
    */
    shape('zoomDelta', { zoom: true }),
    shape('zoomValue', { zoom: true }),
    shape('zoomX', { zoom: 'x' }),
    shape('zoomY', { zoom: 'y' }),
    shape('zoomEmptyOptions', { zoom: {} }),
    shape('zoomPoint', { zoom: { value: [0, 0] } }),
    shape('zoomPoint20', { zoom: { value: [0, 0] }, x: { labels: { precision: 4 } } }),
    shape('zoomPointOffCenter', { zoom: { value: [5, 100] } }),
    shape('zoomMin', { zoom: { axis: 'xy', min: 0.5, max: 2 } }),
    shape('zoomMinDelta', { zoom: { axis: 'xy', min: 0.5, max: 2 } }),
    shape('zoomMax', { zoom: { axis: 'xy', min: 0.5, max: 2 } }),
    shape('zoomMaxDelta', { zoom: { axis: 'xy', min: 0.5, max: 2 } }),
    shape('zoomAxisMaxMin', { zoom: 'xy', x: { min: -20, max: 20 } }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  zoomDelta: e => {
    e.zoomDelta([-6, -200], 2);
    e.zoomDelta([-6, -200], 2);
  },
  zoomValue: e => e.zoomValue([-6, -200], 4),
  zoomX: e => e.zoomValue([-6, -200], 4),
  zoomY: e => e.zoomValue([-6, -200], 4),
  zoomEmptyOptions: e => e.zoomValue([-6, -200], 4),
  zoomPoint: e => e.zoomValue([-6, -200], 4),
  zoomPoint20: e => e.zoomValue([-6, -200], 20),
  zoomPointOffCenter: e => e.zoomValue([-6, -200], 4),
  zoomMin: e => e.zoomValue([0, 0], 0.05),
  zoomMinDelta: e => e.zoomDelta([0, 0], 0.05),
  zoomMax: e => e.zoomValue([0, 0], 100),
  zoomMaxDelta: e => e.zoomValue([0, 0], 100),
  zoomAxisMaxMin: e => e.zoomValue([-6, -200], 0.001),
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
