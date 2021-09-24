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
    shape('labelColor', { colorLabel: [1, 1, 0, 1], label: { text: 'ab', color: [0, 0, 1, 1] } }),

    // Width/Height/Corner
    shape('width', { width: 0.7 }),
    shape('height', { height: 0.7 }),
    shape('width-heigth', { width: 0.7, height: 1 }),
    shape('corner-radius', { corner: { radius: 0.1 } }),
    shape('corner-sides', { corner: { radius: 0.1, sides: 1 } }),

    // Line
    shape('line-none', { line: null }),
    shape('line-width', { line: { width: 0.1 } }),
    shape('line-color', { line: { width: 0.1, color: [0, 1, 1, 1] } }),
    shape('line-color-override', { colorLine: [1, 1, 0, 1], line: { width: 0.1, color: [0, 1, 1, 1] } }),

    // Colors
    shape('color', { color: [0, 1, 1, 1], line: { width: 0.1 } }),
    shape('color-line-color-override', { color: [0, 1, 1, 1], line: { width: 0.1, color: [1, 1, 0, 1] } }),
    shape('color-lineColor-override', { color: [0, 1, 1, 1], colorLine: [1, 1, 0, 1] }),
    shape('fill', { colorFill: [1, 0, 0, 0.4] }),

    // States
    shape('states', { states: ['abc', 'def'], label: null }),
    shape('states-labels', { states: ['abc', 'def'], label: null }),
    shape('states-labels2', { states: ['abc', 'def'], label: null }),
    shape('states-colorFill0', { states: [{ colorFill: [1, 0, 0, 0.5] }, { colorFill: [0, 0, 1, 0.5] }] }),
    shape('states-colorFill1', { states: [{ colorFill: [1, 0, 0, 0.5] }, { colorFill: [0, 0, 1, 0.5] }] }),
    shape('states-colorFill2', { states: [{ colorFill: [1, 0, 0, 0.5] }, { colorFill: [0, 0, 1, 0.5] }] }),
    shape('states-colorLine0', { states: [{ colorLine: [1, 1, 0, 1] }, { colorLine: [0, 0, 1, 1] }] }),
    shape('states-colorLine1', { states: [{ colorLine: [1, 1, 0, 1] }, { colorLine: [0, 0, 1, 1] }] }),
    shape('states-colorLine2', { states: [{ colorLine: [1, 1, 0, 1] }, { colorLine: [0, 0, 1, 1] }] }),
    shape('states-colorLabel0', { states: [{ colorLabel: [1, 1, 0, 1] }, { colorLabel: [0, 0, 1, 1] }] }),
    shape('states-colorLabel1', { states: [{ colorLabel: [1, 1, 0, 1] }, { colorLabel: [0, 0, 1, 1] }] }),
    shape('states-colorLabel2', { states: [{ colorLabel: [1, 1, 0, 1] }, { colorLabel: [0, 0, 1, 1] }] }),
    shape('touchDown', { touchDown: { colorFill: [1, 0, 0, 1], colorLabel: [1, 1, 1, 1], colorLine: [0, 1, 0, 1] } }),
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
  'states-labels': {
    element: 'states-labels',
    events: [
      ['touchDown', [0, 0]],
      ['touchUp'],
    ],
  },
  'states-labels2': {
    element: 'states-labels2',
    events: [
      ['touchDown', [0, 0]],
      ['touchUp'],
      ['touchDown', [0, 0]],
      ['touchUp'],
    ],
  },
  'states-colorFill1': {
    element: 'states-colorFill1',
    events: [
      ['touchDown', [0, 0]],
      ['touchUp'],
    ],
  },
  'states-colorFill2': {
    element: 'states-colorFill2',
    events: [
      ['touchDown', [0, 0]],
      ['touchUp'],
      ['touchDown', [0, 0]],
      ['touchUp'],
    ],
  },
  'states-colorLine1': {
    element: 'states-colorLine1',
    events: [
      ['touchDown', [0, 0]],
      ['touchUp'],
    ],
  },
  'states-colorLine2': {
    element: 'states-colorLine2',
    events: [
      ['touchDown', [0, 0]],
      ['touchUp'],
      ['touchDown', [0, 0]],
      ['touchUp'],
    ],
  },
  'states-colorLabel1': {
    element: 'states-colorLabel1',
    events: [
      ['touchDown', [0, 0]],
      ['touchUp'],
    ],
  },
  'states-colorLabel2': {
    element: 'states-colorLabel2',
    events: [
      ['touchDown', [0, 0]],
      ['touchUp'],
      ['touchDown', [0, 0]],
      ['touchUp'],
    ],
  },
  touchDown: {
    element: 'touchDown',
    events: [
      ['touchDown', [0, 0]],
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
