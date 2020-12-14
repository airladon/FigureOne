/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
  var { tools } = require('../../../index.js').default;
  var { makeAngle } = require('./angle.js');
}


function getShapes(getPos) {
  const angle = (name, options, mods) => makeAngle(name, options, mods, getPos);

  /* eslint-disable object-curly-newline */
  return [
    angle('angleAnimation'),
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
  // 'pulse-defaults': (e) => {
  //   e.pulseWidth();
  // },
  // pulseWidth: (e) => {
  //   e.pulseWidth({
  //     line: 3, arrow: 1.5, label: 2, duration: 2,
  //   });
  // },
  // lengthAnimation: (e) => {
  //   e.animations.new()
  //     .length({ start: 0, target: 0.5, duration: 2 })
  //     .start();
  // },
  // lengthAnimationStep: (e) => {
  //   e.animations.new()
  //     .then(e.animations.length({ start: 0, target: 0.5, duration: 2 }))
  //     .start();
  // },
};


if (typeof process === 'object') {
  module.exports = {
    getShapes,
    updates,
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

