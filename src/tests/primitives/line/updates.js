const updates = {
  Update1: { p2: [0, 0.3] },
};


if (typeof process === 'object') {
  module.exports = {
    updates,
  };
} else {
  Object.keys(updates).forEach((name) => {
    // eslint-disable-next-line no-undef
    figure.getElement(name).custom.updatePoints(updates[name]);
  });
}
