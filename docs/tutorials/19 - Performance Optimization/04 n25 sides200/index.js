/* globals Fig */

const figure = new Fig.Figure({
  scene: [-3, -3, 3, 3],
  backgroundColor: [1, 1, 0.9, 1],
});
const { rand } = Fig;

const n = 25;
for (let i = 0; i < n; i += 1) {
  const r = rand(0.1, 0.2);
  const e = figure.add({
    make: 'polygon',
    radius: r,
    sides: 200,
    color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
    transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
    move: {
      freely: { deceleration: 0, bounceLoss: 0 },
      bounds: {
        left: -(3 - r), bottom: -(3 - r), right: 3 - r, top: 3 - r,
      },
    },
    mods: {
      state: {
        movement: { velocity: [rand(-0.3, 0.3), rand(-0.3, 0.3)] },
      },
    },
  });
  e.startMovingFreely();
}

figure.addFrameRate(10);
