/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition pow figureWidth figureHeight */
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
    ....###....##.....##.####..######.
    ...##.##....##...##...##..##....##
    ..##...##....##.##....##..##......
    .##.....##....###.....##...######.
    .#########...##.##....##........##
    .##.....##..##...##...##..##....##
    .##.....##.##.....##.####..######.
    */
    shape('default'),
    shape('sizeAndTitles', {
      width: 0.8,
      height: 0.8,
      title: 'Plot 1',
      x: { title: 'x Axis' },
      y: { title: 'y Axis' },
    }),
    shape('defaultFont', {
      width: 0.8,
      height: 0.8,
      font: { size: 0.1, color: [1, 0, 0, 1] },
      title: 'Plot 1',
      x: { title: 'x Axis', font: { size: 0.07, color: [0, 1, 0, 1] } },
      y: { title: 'y Axis' },
    }),
    shape('axisColorOverride', {
      width: 0.8,
      height: 0.8,
      font: { size: 0.1, color: [1, 0, 0, 1] },
      title: 'Plot 1',
      x: { color: [0, 0, 1, 1], title: 'x Axis', font: { size: 0.07, color: [0, 1, 0, 1] } },
      y: { color: [0, 0, 1, 1], title: 'y Axis' },
    }),
    shape('axisColorOverride1', {
      width: 0.8,
      height: 0.8,
      font: { size: 0.1, color: [1, 0, 0, 1] },
      title: 'Plot 1',
      x: {
        color: [0, 0, 1, 1],
        title: { text: 'x Axis', font: { color: [0, 1, 1, 1] } },
        font: { size: 0.07, color: [0, 1, 0, 1] },
      },
      y: {
        color: [0, 0, 1, 1],
        title: { text: 'x Axis', font: { color: [0, 1, 1, 1] } },
        font: { size: 0.07, color: [0, 1, 0, 1] },
        labels: { font: { color: [1, 0, 1, 1] } },
      },
    }),
    shape('axisCustomization', {
      x: {
        start: -2,
        stop: 2,
        step: 1,
        labels: 'top',
        ticks: 'top',
        title: { text: 'xAxis', location: 'top' },
      },
      y: {
        start: -10,
        stop: 10,
        step: 2,
        ticks: 'center',
        labels: 'right',
      },
    }, [-0.5, 0]),
    shape('fourAxes', { axes: [
      { axis: 'x', position: [0, 1], ticks: 'top', auto: [-1, 1], labels: 'top', title: { text: 'distance (m)', location: 'top' } },
      { axis: 'y', position: [1, 0], ticks: 'right', labels: 'right', title: { text: 'time (s)', location: 'right' } },
    ] }),
    shape('axisLocation', { axes: [
      { axis: 'x', location: 'top', auto: [-1, 1], title: 'distance (m)' },
      { axis: 'y', location: 'right', title: 'time (s)' },
    ] }),
    shape('axisLocationPositionOverride', { axes: [
      { axis: 'x', location: 'top', auto: [-1, 1], title: 'distance (m)' },
      { axis: 'y', location: 'right', title: 'time (s)', position: [0.5, 0] },
    ] }),
    shape('axisLocationOfXY', {
      x: { location: 'top', title: 'distance (m)', auto: [-10, 10] },
      y: { location: 'right', title: 'time (s)', auto: [-100, 100] },
    }),

    /*
    ..######..########...#######...######...######.
    .##....##.##.....##.##.....##.##....##.##....##
    .##.......##.....##.##.....##.##.......##......
    .##.......########..##.....##..######...######.
    .##.......##...##...##.....##.......##.......##
    .##....##.##....##..##.....##.##....##.##....##
    ..######..##.....##..#######...######...######.
    */
    shape('cross', {
      cross: [0, 0],
      y: { step: 500, labels: { hide: [0] } },
      x: { step: 5, labels: { valueOffset: { values: [0], offset: [-0.05, 0.05] } } },
    }),
    shape('crossMin', { cross: [-1000, -1000] }),
    shape('crossMax', { cross: [1000, 1000] }),

    /*
    ..######...########..####.########.
    .##....##..##.....##..##..##.....##
    .##........##.....##..##..##.....##
    .##...####.########...##..##.....##
    .##....##..##...##....##..##.....##
    .##....##..##....##...##..##.....##
    ..######...##.....##.####.########.
    */
    shape('gridOn', { grid: true }),
    shape('gridOff', { grid: false }),

    /*
    .########.####.########.##.......########
    ....##.....##.....##....##.......##......
    ....##.....##.....##....##.......##......
    ....##.....##.....##....##.......######..
    ....##.....##.....##....##.......##......
    ....##.....##.....##....##.......##......
    ....##....####....##....########.########
    */
    shape('title', { title: 'Plot Title' }),
    shape('subTitle', { title: { text: ['Plot Title', { text: 'Sub Title', font: { size: 0.05 }, lineSpace: 0.08 }] } }),
    shape('titleOffset', { title: { text: 'Plot Title', offset: [0.1, -0.1] } }),

    /*
    .########.########.....###.....######..########
    ....##....##.....##...##.##...##....##.##......
    ....##....##.....##..##...##..##.......##......
    ....##....########..##.....##.##.......######..
    ....##....##...##...#########.##.......##......
    ....##....##....##..##.....##.##....##.##......
    ....##....##.....##.##.....##..######..########
    */
    shape('singleTrace', { trace: {
      points: [[0, 0], [1, 1], [2, 0.5]],
      markers: {
        radius: 0.035,
        sides: 20,
        line: { width: 0.01 },
      },
    } }),
    shape('singlePoints', { trace: [[0, 0], [1, 1], [2, 0.5]] }),
    shape('twoTraces', { trace: [pow(2), pow(3)] }),

    /*
    .##.......########..######...########.##....##.########.
    .##.......##.......##....##..##.......###...##.##.....##
    .##.......##.......##........##.......####..##.##.....##
    .##.......######...##...####.######...##.##.##.##.....##
    .##.......##.......##....##..##.......##..####.##.....##
    .##.......##.......##....##..##.......##...###.##.....##
    .########.########..######...########.##....##.########.
    */
    shape('legend', { trace: [pow(2), pow(3)], legend: true }),
    shape('legendColorFont', { trace: [pow(2), pow(3)], legend: { fontColorIsLineColor: true } }),
    shape('legendNamesFrame', { trace: [
      { points: pow(2), name: 'squared' },
      { points: pow(3), name: 'cubed' },
    ], legend: { position: [0.2, 0.8], frame: [0, 1, 0, 0.3] } }),
    shape('legendLengthLineFrame', { trace: [
      { points: pow(2), name: 'squared' },
      { points: pow(3), name: 'cubed' },
    ], legend: { length: 0.3, frame: { line: { width: 0.01 } } } }),
    shape('legendFontSpace', { trace: [
      { points: pow(2), name: 'squared' },
      { points: pow(3), name: 'cubed' },
    ], legend: { font: { size: 0.05, family: 'Times New Roman' }, space: 0.2 } }),
    shape('legendOffset', { trace: [
      { points: pow(2), name: 'squared' },
      { points: pow(3), name: 'cubed' },
    ], legend: { offset: [0.6, 0], position: [0, 1] } }),
    shape('legendShow', { trace: [
      { points: pow(2), name: 'squared' },
      { points: pow(3), name: 'cubed' },
    ], legend: { show: [0] } }),
    shape('legendHide', { trace: [
      { points: pow(2), name: 'squared' },
      { points: pow(3), name: 'cubed' },
    ], legend: { hide: [0] } }),
    shape('legendCustom', { trace: [
      { points: pow(2), name: 'squared' },
      { points: pow(3), name: 'cubed' },
    ], legend: { position: [0, 1], custom: { 0: { space: 0.2 }, cubed: { text: 'asdf' } } } }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  // pan: e => e.panDeltaValue(0.5),
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
