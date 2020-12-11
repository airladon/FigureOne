const updates = {
  // 'Update-a': (e) => {
  //   e.getElement('a').custom.updatePoints({
  //     radius: 0.2,
  //   });
  // },
  // 'Update-touchBorder': (e) => {
  //   e.touchBorder = 'rect';
  // },
  'align-start': (e) => {
    e.setRotation(Math.PI / 4);
  },
  'align-center': (e) => {
    e.setRotation(Math.PI / 4);
  },
  'align-end': (e) => {
    e.setRotation(Math.PI / 4);
  },
  'align-neg': (e) => {
    e.setRotation(Math.PI / 4);
  },
  'label-autoForm': (e) => {
    e.label.eqn.showForm('1');
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
    figure.setFirstTransform();
  });
}
