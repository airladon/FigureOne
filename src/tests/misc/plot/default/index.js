/* eslint-disable no-unused-vars */
/* global Fig __frames */
const figure = new Fig.Figure({
  scene: {
    left: -2,
    bottom: -1.5,
    right: 2,
    top: 1.5,
  },
  color: [1, 0, 0, 1],
});

const pow = (power = 2, stop = 10, step = 0.05) => {
  const xValues = Fig.tools.math.range(0, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** power));
};

figure.add({
  name: 'plot',
  make: 'collections.plot',
  options: {
    trace: pow(),
    position: [-1, -1],
    width: 2,
    height: 2,
  },
});

