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
    shape('default'),
    // Labels
    shape('label-autosize', { label: { text: 'off', scale: 2 }, width: null, height: null }),
    shape('label-text', { label: 'off' }),
    shape('label-eqn', { label: {
      text: { forms: { 0: 'ab', 1: 'cd' } },
    } }),
    shape('label-eqn-touch-form', { label: {
      text: { forms: { 0: 'ab', 1: 'cd' } },
    }, states: ['0', '1'] }),
    shape('label-eqn-font', { label: {
      text: { textFont: { style: 'normal' }, forms: { 0: 'ab' } },
    } }),
    shape('label-font', { label: 'ab', font: { style: 'normal' } }),
    shape('label-font-color', { label: { text: 'ab', font: { color: [0, 1, 0, 1] } } }),
    shape('label-font-color-override', { label: { text: 'ab', color: [0, 0, 1, 1], font: { color: [0, 1, 0, 1] } } }),
    shape('label-color', { label: { text: 'ab', color: [0, 0, 1, 1] } }),
    shape('labelColor', { labelColor: [1, 1, 0, 1], label: { text: 'ab', color: [0, 0, 1, 1] } }),

    // Width/Height/Corner
    shape('width', { width: 0.7 }),
    shape('height', { height: 0.7 }),
    shape('width-heigth', { width: 0.7, height: 0.5 }),
    shape('corner-radius', { corner: { radius: 0.1 } }),
    shape('corner-sides', { corner: { radius: 0.1, sides: 1 } }),

    // Line
    shape('line-none', { line: null }),
    shape('line-width', { line: { width: 0.1 } }),
    shape('line-color', { line: { width: 0.1, color: [0, 1, 1, 1] } }),
    shape('line-color-override', { lineColor: [1, 1, 0, 1], line: { width: 0.1, color: [0, 1, 1, 1] } }),

    // Colors
    shape('color', { color: [0, 1, 1, 1], line: { width: 0.1 } }),
    shape('color-line-color-override', { color: [0, 1, 1, 1], line: { width: 0.1, color: [1, 1, 0, 1] } }),
    shape('color-lineColor-override', { color: [0, 1, 1, 1], lineColor: [1, 1, 0, 1] }),
    shape('fill', { fillColor: [1, 0, 0, 0.4] }),

    // shape('defaultTouch'),
    // shape('defaultMove'),
    // shape('moveBeyond1'),
    // shape('moveBeyond0'),
    // shape('width', { width: 0.7 }),
    // shape('height', { height: 0.3 }),
    // shape('barHeight', { barHeight: 0.1 }),
    // shape('height-and-bar', { height: 0.3, barHeight: 0.2 }),
    // shape('height-width-background', { height: 0.3, barHeight: 0.2, width: 0.7 }),
    // shape('color', { color: [1, 1, 0, 1] }),
    // shape('off-color', { colorOff: [1, 1, 0, 1] }),
    // shape('on-color', { colorOn: [1, 1, 0, 1] }),
    // shape('colors', { color: [1, 0, 0, 1], colorOn: [0, 0, 1, 1], colorOff: [1, 1, 0, 1] }),
    // shape('border-width', { circleBorder: { width: 0.03 }, barHeight: 0.1 }),
    // shape('border-width-color', { circleBorder: { width: 0.03, color: [1, 0, 0, 1] } }),
    // shape('back-border-width', { barBorder: { width: 0.03 }, barHeight: 0.1 }),
    // shape('back-border-width-color', { barBorder: { width: 0.03, color: [1, 0, 0, 1] }, barHeight: 0.1 }),
    // shape('rectMarker', { marker: 'rectangle' }),
    // shape('rectMarkerWide', { marker: { style: 'rectangle', width: 0.3 } }),
    // shape('rectMarkerNarrow', { marker: { style: 'rectangle', width: 0.01 } }),
    // shape('noMarker', { marker: 'none' }),
    // shape('themeLight', { theme: 'light' }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
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
  'label-eqn-touch': {
    element: 'label-eqn-touch-form',
    events: [
      ['touchDown', [0, 0]],
      ['touchUp'],
    ],
  },
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
