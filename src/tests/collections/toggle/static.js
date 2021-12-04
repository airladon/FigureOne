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
    shape('barHeight', { barHeight: 0.2 }),
    shape('height-and-bar', { height: 0.2, barHeight: 0.1 }),
    shape('height-width-bar', { height: 0.2, barHeight: 0.1, width: 0.5 }),
    shape('color', { color: [1, 0, 0, 1] }),
    shape('off-color', { colorOff: [1, 0, 0, 1] }),
    shape('on-color', { colorOn: [1, 0, 0, 1] }),
    shape('colors', { color: [1, 0, 0, 1], colorOn: [0, 0, 1, 1], colorOff: [1, 1, 0, 1] }),
    shape('colors-switch', { color: [1, 0, 0, 1], colorOn: [0, 0, 1, 1], colorOff: [1, 1, 0, 1] }),
    shape('border-width', { circleBorder: { width: 0.05 } }),
    shape('border-width-color', { circleBorder: { width: 0.05, color: [1, 0, 0, 1] } }),
    shape('back-border-width', { barBorder: { width: 0.05 } }),
    shape('back-border-width-color', { barBorder: { width: 0.05, color: [1, 0, 0, 1] } }),
    shape('label-text', { label: 'label' }),
    shape('label-bottom', { label: { text: 'label', location: 'bottom' } }),
    shape('label-top', { label: { text: 'label', location: 'top' } }),
    shape('label-right', { label: { text: 'label', location: 'right' } }),
    shape('label-scale', { label: { text: 'label', scale: 1.5, location: 'bottom' } }),
    shape('label-font', { label: { text: 'label', font: { family: 'Times', size: 0.2 } } }),
    shape('label-eqn', { label: { text: { scale: 1, forms: { 0: { frac: ['a', 'vinculum', 'b'] } } } } }),
    shape('label-top-offset', { label: { location: 'left', text: 'test', offset: [0.1, 0.2] } }),
    shape('label-left-offset', { label: { location: 'top', text: 'test', offset: [0.1, 0.2] } }),
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
  checkText: {
    element: 'default',
    expect: true,
    when: e => {
      const gls = figure.elements.getAllPrimitives().filter(e => e.text != null);
      const d2s = figure.elements.getAllPrimitives().filter(e => e.drawingObject.text != null);
      figure.add({
        make: 'text',
        text: `gl: ${gls.length.toString()}`,
        position: [-4.5, 4.8],
        font: { size: 0.2 },
      });
      figure.add({
        make: 'text',
        text: `2d: ${d2s.length.toString()}`,
        position: [-3.5, 4.8],
        font: { size: 0.2 },
      });
      if (d2s.length > 0 && gls.length === 0) {
        return true;
      }
      return false;
    },
  },
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
