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
    shape('minLimit', { min: 1 }),
    shape('panMinLimit', { min: -1 }),
    shape('maxLimit', { max: 1 }),
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

    // shape('defaultTouch'),
    // shape('width', { width: 0.2 }),
    // shape('height', { height: 0.2 }),
    // shape('barHeight', { barHeight: 0.2 }),
    // shape('height-and-bar', { height: 0.2, barHeight: 0.1 }),
    // shape('height-width-bar', { height: 0.2, barHeight: 0.1, width: 0.5 }),
    // shape('color', { color: [1, 0, 0, 1] }),
    // shape('off-color', { colorOff: [1, 0, 0, 1] }),
    // shape('on-color', { colorOn: [1, 0, 0, 1] }),
    // shape('colors', { color: [1, 0, 0, 1], colorOn: [0, 0, 1, 1], colorOff: [1, 1, 0, 1] }),
    // shape('colors-switch', { color: [1, 0, 0, 1], colorOn: [0, 0, 1, 1], colorOff: [1, 1, 0, 1] }),
    // shape('border-width', { circleBorder: { width: 0.05 } }),
    // shape('border-width-color', { circleBorder: { width: 0.05, color: [1, 0, 0, 1] } }),
    // shape('back-border-width', { barBorder: { width: 0.05 } }),
    // shape('back-border-width-color', { barBorder: { width: 0.05, color: [1, 0, 0, 1] } }),
    // shape('label-text', { label: 'label' }),
    // shape('label-bottom', { label: { text: 'label', location: 'bottom' } }),
    // shape('label-top', { label: { text: 'label', location: 'top' } }),
    // shape('label-right', { label: { text: 'label', location: 'right' } }),
    // shape('label-scale', { label: { text: 'label', scale: 1.5, location: 'bottom' } }),
    // shape('label-font', { label: { text: 'label', font: { family: 'Times', size: 0.2 } } }),
    // shape('label-eqn', { label: { text: { scale: 1, forms: { 0: { frac: ['a', 'vinculum', 'b'] } } } } }),
    // shape('label-top-offset', { label: { location: 'left', text: 'test', offset: [0.1, 0.2] } }),
    // shape('label-left-offset', { label: { location: 'top', text: 'test', offset: [0.1, 0.2] } }),
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
  // 'move-pad': (e) => {
  //   e.setPositionWithoutMoving(e.points[0]);
  // },
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
