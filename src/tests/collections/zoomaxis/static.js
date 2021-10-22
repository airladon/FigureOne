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


function getShapes(getPos) {
  const shape = (name, options, mods) => makeShape(name, options, mods, getPos);

  /* eslint-disable object-curly-newline */
  return [
    /*
    .##.....##
    ..##...##.
    ...##.##..
    ....###...
    ...##.##..
    ..##...##.
    .##.....##
    */
    shape('default'),
    shape('step', { step: 0.5 }),
    shape('startStopStep', { start: 3, stop: 9, step: 3 }),
    shape('offsetStart', { start: 2, stop: 9, step: 3 }),
    shape('length', { length: 0.8 }),
    shape('lineStyle', { line: { width: 0.03, dash: [0.01, 0.01], color: [0, 1, 0, 1] } }),
    shape('lineNone', { line: false }),
    shape('ticksNone', { ticks: false }),
    shape('ticksStyle', { ticks: { length: 0.03, offset: 0, width: 0.02, color: [0, 0, 1, 1] } }),
    shape('MultiTicks', { ticks: [true, true, true, true] }),
    shape('MultiTickStyle', { ticks: [true, { length: 0.07, width: 0.02, color: [0, 0, 1, 1], dash: [0.01, 0.005] }] }),
    shape('MultiStep', { ticks: [true, true], step: [1, 0.2] }),
    shape('grid', { grid: true }),
    shape('gridNone', { grid: false }),
    shape('gridStyle', { grid: { width: 0.02, color: [0, 0, 1, 1], length: 0.2, dash: [0.02, 0.02] } }),
    shape('MultiGrid', { grid: [true, true, true] }),
    shape('MultiGridStyle', { grid: [true, { width: 0.02, color: [0, 0, 1, 1], length: 0.2, dash: [0.02, 0.02] }] }),
    shape('MultiStepGrid', { grid: [true, true], step: [1, 0.2] }),
    shape('title', { title: 'time (s)' }),
    shape('titleOffset', { title: { text: 'time (s)', offset: [0.1, 0.05] } }),
    shape('titleRotation', { title: { text: 'time (s)', rotation: 0.5 } }),
    shape('titleTextLines', { title: { text: ['time', { text: '(s)', font: { size: 0.06, color: [0, 0, 1, 1] }, lineSpace: 0.05 }] } }),
    shape('labelsNoneTitle', { labels: false, title: 'time (s)' }),
    shape('labelsNone', { labels: false }),
    shape('labelsPrecision2', { labels: { precision: 2 }, start: 1, stop: 1.1, step: 0.05 }),
    shape('labelsPrecision1', { labels: { precision: 1 }, start: 1, stop: 1.1, step: 0.05 }),
    shape('labelsFixed', { labels: { fixed: true, precision: 2 } }),
    shape('labelsRotation', { labels: { fixed: true, precision: 3, rotation: Math.PI / 4 } }),
    shape('labelsxAlign', { labels: { xAlign: 'left', fixed: true } }),
    shape('labelsFont', { labels: { font: { size: 0.07, color: [0, 0, 1, 1] } } }),
    shape('labelsHide', { labels: { hide: [0] } }),
    shape('labelsCallback', { labels: values => values.values.map(v => `${v + 1}s`) }),
    shape('labelsSpace', { labels: { space: 0.09 } }),
    shape('showFalse', { show: false }),
    /*
    .##....##
    ..##..##.
    ...####..
    ....##...
    ....##...
    ....##...
    ....##...
    */
    shape('y', { axis: 'y' }),
    shape('yTicksStyle', { axis: 'y', ticks: { length: 0.03, offset: -0.05, width: 0.02, color: [0, 0, 1, 1] } }),
    shape('yMultiTicks', { axis: 'y', ticks: [true, true, true, true] }),
    shape('yGrid', { axis: 'y', grid: true }),
    shape('yGridStyle', { axis: 'y', grid: { width: 0.02, color: [0, 0, 1, 1], length: 0.2, dash: [0.02, 0.02] } }),
    shape('yMultiGrid', { axis: 'y', grid: [true, true, true] }),
    shape('yMultiGridStyle', { axis: 'y', grid: [true, { width: 0.02, color: [0, 0, 1, 1], length: 0.2, dash: [0.02, 0.02] }] }),
    shape('yTitle', { axis: 'y', title: 'time (s)' }),
    shape('yTitleOffset', { axis: 'y', title: { text: 'time (s)', offset: [0.1, 0.05] } }),
    shape('yTitleRotation', { axis: 'y', title: { text: 'time (s)', rotation: 0.5 } }),
    shape('yTitleTextLines', { axis: 'y', title: { text: ['time', { text: '(s)', font: { size: 0.06, color: [0, 0, 1, 1] }, lineSpace: 0.05 }] } }),
    shape('yLabelsNoneTitle', { axis: 'y', labels: false, title: 'time (s)' }),
    shape('yLabelsNone', { axis: 'y', labels: false }),
    shape('yLabelsRotation', { axis: 'y', labels: { fixed: true, precision: 3, rotation: Math.PI / 4 } }),
    shape('yLabelsAlign', { axis: 'y', labels: { xAlign: 'left', yALign: 'bottom' }, start: 0, stop: 1, step: 0.5 }),
    shape('yLabelsSpace', { axis: 'y', labels: { space: 0 } }),

    /*
    .########.....###....##....##
    .##.....##...##.##...###...##
    .##.....##..##...##..####..##
    .########..##.....##.##.##.##
    .##........#########.##..####
    .##........##.....##.##...###
    .##........##.....##.##....##
    */
    shape('pan'),
    shape('panNeg'),
    shape('panBig'),
    shape('panDraw'),
    shape('panDrawNeg'),
    shape('panTwo'),
    shape('panToPosition'),
    shape('panToNegPosition'),
    shape('panMinLimit', { min: -1 }),
    shape('panMaxLimit', { max: 4 }),

    /*
    .########..#######...#######..##.....##
    ......##..##.....##.##.....##.###...###
    .....##...##.....##.##.....##.####.####
    ....##....##.....##.##.....##.##.###.##
    ...##.....##.....##.##.....##.##.....##
    ..##......##.....##.##.....##.##.....##
    .########..#######...#######..##.....##
    */
    shape('zoomValueIn'),
    shape('zoomValueOut'),
    shape('zoomValueInMin', { labels: { precision: 2 } }),
    shape('zoomValueOutMax', { labels: { precision: 2 } }),
    shape('zoomValueDelta1', { labels: { precision: 2 } }),
    shape('zoomValueDelta2', { labels: { precision: 2 } }),
    shape('zoom', { labels: { precision: 2 } }),
    shape('zoom1', { labels: { precision: 2 } }),
    shape('zoomMin', { min: 0, lables: { precision: 2 } }),
    shape('zoomMax', { max: 2, lables: { precision: 2 } }),
    shape('zoomMinDelta', { min: -4, lables: { precision: 2 } }),
    shape('zoomMaxDelta', { max: 10, lables: { precision: 2 } }),

    /*
    ....###....##.....##.########..#######.
    ...##.##...##.....##....##....##.....##
    ..##...##..##.....##....##....##.....##
    .##.....##.##.....##....##....##.....##
    .#########.##.....##....##....##.....##
    .##.....##.##.....##....##....##.....##
    .##.....##..#######.....##.....#######.
    */
    shape('auto', { auto: [0, 5], start: -999, stop: -999, step: -999, length: 0.8 }),
    shape('auto1', { auto: [0, 1000], start: -999, stop: -999, step: -999, length: 0.8, labels: { format: 'exp', rotation: Math.PI / 2, yAlign: 'middle' } }),
    shape('auto2', { auto: [0, 0.01], start: -999, stop: -999, step: -999, length: 0.8, labels: { precision: 3, rotation: Math.PI / 4 } }),
    shape('auto3', { auto: [-1, 1], start: -999, stop: -999, step: -999, length: 0.8 }),
    shape('auto4', { auto: [-1, 1], start: -999, stop: -999, step: 0.5, length: 0.8 }),
    shape('auto5', { auto: [1, 9], start: -999, stop: -999, step: -999, length: 0.8 }),

    /*
    ....###....########..########...#######..##......##
    ...##.##...##.....##.##.....##.##.....##.##..##..##
    ..##...##..##.....##.##.....##.##.....##.##..##..##
    .##.....##.########..########..##.....##.##..##..##
    .#########.##...##...##...##...##.....##.##..##..##
    .##.....##.##....##..##....##..##.....##.##..##..##
    .##.....##.##.....##.##.....##..#######...###..###.
    */
    shape('arrow', { line: { arrow: 'triangle' } }),
    shape('yArrow', { line: { arrow: 'barb' }, axis: 'y' }),
    shape('arrowLength', { line: { arrow: 'triangle', arrowLength: 0.2 } }),
    shape('startArrow', { line: { arrow: { start: 'barb' } } }),
    shape('startArrow1', { line: { arrow: { start: { head: 'barb' } } } }),
    shape('endArrow', { line: { arrow: { end: 'barb' } } }),
    shape('endArrow1', { line: { arrow: { end: { head: 'barb' } } } }),
    shape('bothArrows', { line: { arrow: { head: 'circle' } } }),
    shape('arrowZoom', { line: { arrow: 'barb', arrowLength: 0.1 }, step: 0.5 }),
    shape('yStartArrow', { line: { arrow: { start: 'barb' } }, axis: 'y' }),
    shape('yEndArrow', { line: { arrow: { end: 'barb' } }, axis: 'y' }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  pan: e => e.panDeltaValue(0.5),
  panNeg: e => e.panDeltaValue(-0.5),
  panBig: e => e.panDeltaValue(1001),
  panDraw: e => e.panDeltaDraw(0.125),
  panDrawNeg: e => e.panDeltaDraw(-0.125),
  panTwo: (e) => { e.panDeltaValue(0.5); e.panDeltaValue(0.5); },
  panToPosition: e => e.pan(5, 0.25),
  panToNegPosition: e => e.pan(-5, 0.25),
  panMinLimit: e => e.panDeltaValue(-6),
  panMaxLimit: e => e.panDeltaValue(6),
  zoomValueIn: e => e.zoomValue(1, 2),
  zoomValueOut: e => e.zoomValue(1, 0.5),
  zoomValueInMin: (e) => { e.zoomValue(0, 4); e.zoomValue(0, 4); },
  zoomValueOutMax: e => e.zoomValue(2, 0.5),
  zoomValueDelta1: e => e.zoomValue(1, 2),
  zoomValueDelta2: (e) => { e.zoomDelta(1, 2); e.zoomDelta(1, 2); },
  zoom: e => e.zoom(10, 0.25, 2),
  zoom1: e => e.zoom(10, 0.5, 0.5),
  zoomMin: e => e.zoom(0, 0.25, 0.5),
  zoomMax: e => e.zoom(2, 0.5, 2),
  zoomMinDelta: (e) => { e.zoomDelta(1, 0.5); e.zoomDelta(1, 0.5); e.zoomDelta(1, 0.5); },
  zoomMaxDelta: (e) => { e.zoomDelta(1, 0.5); e.zoomDelta(1, 0.5); e.zoomDelta(1, 0.5); },
  arrowZoom: e => e.zoom(1, 0.25, 1.3),
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
  figure.add(getShapes(index => getPosition(index)));
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
