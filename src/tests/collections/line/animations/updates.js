/* globals figure */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "timeoutId" }] */

let timeoutId;
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
};

if (typeof process === 'object') {
  module.exports = {
    updates,
  };
} else {
  figure.globalAnimation.setManualFrames();
  figure.globalAnimation.frame(0);
  // figure.globalAnimation.requestNextAnimationFrame.call(
  //   window, figure.globalAnimation.frame.bind(figure.globalAnimation, 0),
  // );
  Object.keys(updates).forEach((name) => {
    updates[name](figure.getElement(name));
    figure.setFirstTransform();
  });
  timeoutId = setTimeout(() => {
    figure.globalAnimation.endManualFrames();
  }, (1000));
}
