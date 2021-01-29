
/* globals Fig, Recorder, TimeKeeper */
const { Transform, Point } = Fig;
const { range, rand, randSign } = Fig.tools.math;
// const figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1] });


const figure = new Fig.Figure({
  limits: [-2, -1.5, 4, 3],
  color: [0.3, 0.3, 0.3, 1],
  font: { size: 0.1 },
});

figure.add({
  name: 'p',
  method: 'polygon',
  options: {
    radius: 0.5,
  },
  mods: {
    isMovable: true,
  },
});

figure.add({
  name: 'cursor',
  method: 'collections.cursor',
  options: {
    color: [1, 0.6, 0.6, 1],
  },
  mods: {
    isShown: false,
  },
});

