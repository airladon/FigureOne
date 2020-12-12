/* global figure */

const updates = {
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
  'label-updateOff': (e) => {
    e.setRotation(Math.PI / 4);
  },
  'label-updateOn': (e) => {
    e.setRotation(Math.PI / 4);
  },
  setLength: (e) => {
    e.setLength(0.7);
  },
  'setLength-dash': (e) => {
    e.setLength(0.7);
  },
  setLabelToRealLength: (e) => {
    e.setLabelToRealLength();
  },
  setLabel: (e) => {
    e.setLabel('b');
  },
  setEndPoints: (e) => {
    const p = e.getPosition('figure');
    e.setEndPoints(
      [-0.2 + p.x, -0.2 + p.y],
      [-0.2 + p.x, 0.2 + p.y],
      -0.1,
    );
  },
};


if (typeof process === 'object') {
  module.exports = {
    updates,
  };
} else {
  Object.keys(updates).forEach((name) => {
    updates[name](figure.getElement(name));
    figure.setFirstTransform();
  });
}
