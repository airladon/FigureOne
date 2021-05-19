/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
  var { tools } = require('../../../index').default;
  var { makeAngle } = require('./angle');
}


function getShapes(getPos) {
  const angle = (name, options, mods) => makeAngle(name, options, mods, getPos);

  /* eslint-disable object-curly-newline */
  return [
    angle('angleAnimation', { curve: { width: 0.02 }, arrow: 'triangle' }),
    angle('angleAnimationStep', { curve: { width: 0.02 }, arrow: 'triangle' }),
    angle('pulse-scale-default', { label: 'a', curve: { width: 0.02 }, arrow: 'triangle' }),
    angle('pulse-scale', { label: 'a', curve: { width: 0.02 }, arrow: 'triangle' }),
    angle('pulse-thick', { label: 'a', curve: { width: 0.02 }, arrow: 'triangle' }),
    angle('pulseAnimation', { label: 'a', curve: { width: 0.02 }, arrow: 'triangle' }),
    angle('pulseAnimationStep', { label: 'a', curve: { width: 0.02 }, arrow: 'triangle' }),
  ];
}

let timeoutId;
let startUpdates;

const updates = {
  angleAnimation: (e) => {
    e.animations.new()
      .angle({ start: 0, target: 1, duration: 2 })
      .start();
  },
  angleAnimationStep: (e) => {
    e.animations.new()
      .then(e.animations.angle({ start: 0, target: 1, duration: 2 }))
      .start();
  },
  'pulse-scale-default': (e) => {
    e.pulseAngle({ duration: 2 });
  },
  'pulse-scale': (e) => {
    e.pulseAngle({ curve: 1.3, corner: 1.5, label: 2, duration: 2 });
  },
  'pulse-thick': (e) => {
    e.pulseAngle({
      curve: 1.1,
      arrow: 1.2,
      duration: 2,
      thick: 4,
    });
  },
  pulseAnimation: (e) => {
    e.animations.new()
      .pulseAngle({
        curve: 1.3,
        corner: 1.5,
        label: 1.2,
        duration: 2,
      })
      .start();
  },
  pulseAnimationStep: (e) => {
    e.animations.new()
      .then(e.animations.pulseAngle({ duration: 2 }))
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

