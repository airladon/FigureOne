const updates = {
  'Update-a': (e) => {
    e.getElement('a').custom.updatePoints({
      radius: 0.2,
    });
  },
  'Update-touchBorder': (e) => {
    e.touchBorder = 'rect';
  },
};


if (typeof process === 'object') {
  module.exports = {
    updates,
  };
} else {
  Object.keys(updates).forEach((name) => {
    // eslint-disable-next-line no-undef
    updates[name](figure.getElement(name));
  });
}
