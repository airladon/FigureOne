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
    shape('defaultTouch'),
    shape('width', { width: 0.2 }),
    shape('height', { height: 0.2 }),
    shape('backgroundHeight', { backgroundHeight: 0.2 }),
    shape('height-and-background', { height: 0.2, backgroundHeight: 0.1 }),
    shape('height-width-background', { height: 0.2, backgroundHeight: 0.1, width: 0.5 }),
    shape('color', { color: [1, 0, 0, 1] }),
    shape('off-color', { colorOff: [1, 0, 0, 1] }),
    shape('on-color', { colorOn: [1, 0, 0, 1] }),
    shape('colors', { color: [1, 0, 0, 1], colorOn: [0, 0, 1, 1], colorOff: [1, 1, 0, 1] }),
    shape('colors-switch', { color: [1, 0, 0, 1], colorOn: [0, 0, 1, 1], colorOff: [1, 1, 0, 1] }),
    shape('border-width', { circleBorder: { width: 0.05 } }),
    shape('border-width-color', { circleBorder: { width: 0.05, color: [1, 0, 0, 1] } }),
    shape('back-border-width', { backgroundBorder: { width: 0.05 } }),
    shape('back-border-width-color', { backgroundBorder: { width: 0.05, color: [1, 0, 0, 1] } }),
    shape('label-text', { label: 'label' }),
    shape('label-bottom', { label: { text: 'label', location: 'bottom' } }),
    shape('label-top', { label: { text: 'label', location: 'top' } }),
    shape('label-right', { label: { text: 'label', location: 'right' } }),
    shape('label-scale', { label: { text: 'label', scale: 1.5, location: 'bottom' } }),
    shape('label-font', { label: { text: 'label', font: { family: 'Times', size: 0.2 } } }),
    shape('label-eqn', { label: { text: { scale: 1, forms: { 0: { frac: ['a', 'vinculum', 'b'] } } } } }),
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
  defaultTouch: {
    element: 'defaultTouch',
    events: [
      ['touchDown', [0, 0]],
    ],
  },
  'on-color': {
    element: 'on-color',
    events: [
      ['touchDown', [0, 0]],
    ],
  },
  'colors-switch': {
    element: 'colors-switch',
    events: [
      ['touchDown', [0, 0]],
    ],
  },
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
