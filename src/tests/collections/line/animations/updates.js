/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure */

let timeoutId;
let startUpdates;

const updates = {
  grow: (e) => {
    e.animations.new()
      .length({ start: 0, target: 0.5, duration: 2 })
      .start();
  },
  'pulse-defaults': (e) => {
    e.pulseWidth();
  },
  pulseWidth: (e) => {
    e.pulseWidth({
      line: 3, arrow: 1.5, label: 2, duration: 2,
    });
  },
  lengthAnimation: (e) => {
    e.animations.new()
      .length({ start: 0, target: 0.5, duration: 2 })
      .start();
  },
  lengthAnimationStep: (e) => {
    e.animations.new()
      .then(e.animations.length({ start: 0, target: 0.5, duration: 2 }))
      .start();
  },
};

if (typeof process === 'object') {
  module.exports = {
    updates,
  };
} else {
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
