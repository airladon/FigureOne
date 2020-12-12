const updates = {
  grow: (e) => {
    e.animations.new()
      .length({ start: 0, target: 1, duration: 2 })
      .start();
  },
};


if (typeof process === 'object') {
  module.exports = {
    updates,
  };
} else {
  // figure.setFirstTransform();
  Object.keys(updates).forEach((name) => {
    // eslint-disable-next-line no-undef
    updates[name](figure.getElement(name));
    // eslint-disable-next-line no-undef
    figure.setFirstTransform();
    // figure.pause();
    figure.globalAnimation.setManualFrames();
    figure.globalAnimation.frame(0);
  });
}
