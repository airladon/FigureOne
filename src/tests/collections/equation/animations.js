/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
  var { tools } = require('../../../index').default;
  var { makeShape } = require('./common');
}


function getShapes(getPos) {
  const shape = (name, options, mods) => makeShape(name, options, mods, getPos);

  /* eslint-disable object-curly-newline */
  return [
    shape('gotToForm-single', {
      forms: {
        0: ['a', '_ + ', 'b', '_ - ', 'c'],
        1: ['a', '_ - ', 'c'],
      },
      formSeries: ['0', '1'],
      position: [-0.3, 0],
    }),
    shape('nextForm-multi', {
      forms: {
        0: ['a', '_ + b', '_ - c', '_ + d', '_ - e', '_ + f'],
        1: ['a', '_ - c', '_ + d', '_ - e', '_ + f'],
        2: ['a', '_ + d', '_ - e', '_ + f'],
        3: ['a', '_ - e', '_ + f'],
        4: ['a', '_ + f'],
      },
      formSeries: ['0', '1', '2', '3', '4'],
      position: [-0.3, 0],
    }),
    shape('translation-1', {
      formDefaults: {
        // animation: {
        translation: {
          '_ + f': { style: 'curved', mag: 1, direction: 'down' },
        },
        // },
      },
      forms: {
        0: ['a', '_ + b', '_ - c', '_ + d', '_ - e', '_ + f'],
        1: {
          content: ['a', '_ - c', '_ + d', '_ - e', '_ + f'],
          translation: {
            '_ + f': { style: 'curved', mag: 0.5 },
          },
        },
        2: {
          content: ['a', '_ + d', '_ - e', '_ + f'],
          fromForm: {
            1: {
              translation: {
                '_ + f': { style: 'curved', direction: 'up', mag: 0.5 },
              },
            },
          },
        },
        3: ['a', '_ - e', '_ + f'],
        4: ['a', '_ + f'],
      },
      formSeries: ['0', '1', '2', '3', '4'],
    }),
  ];
}

let timeoutId;
let startUpdates;

const updates = {
  'gotToForm-single': (e) => {
    e.showForm('0');
    e.animations.new()
      .goToForm({ target: '1', animate: 'move', delay: 0.5, duration: 1.5 })
      .start();
  },
  'nextForm-multi': (e) => {
    e.showForm('0');
    e.animations.new()
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .start();
  },
  'translation-1': (e) => {
    e.showForm('0');
    e.animations.new()
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .nextForm({ animate: 'move', delay: 0.5, duration: 1 })
      .start();
  },
};

// const getValues = {};
// const move = {};

if (typeof process === 'object') {
  module.exports = {
    getShapes,
    updates,
    // getValues,
    // move,
  };
} else {
  figure.add(getShapes(index => getPosition(index)));
  startUpdates = () => {
    Object.keys(updates).forEach((name) => {
      updates[name](figure.getElement(name));
      figure.setFirstTransform();
    });
  };

  timeoutId = setTimeout(() => {
    startUpdates();
  }, (1000));
}

