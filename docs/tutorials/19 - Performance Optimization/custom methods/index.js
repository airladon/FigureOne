/* globals Fig */
const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [1, 1, 0.9, 1],
});
const { rand } = Fig.tools.math;

for (let i = 0; i < 400; i += 1) {
  const r = rand(0.1, 0.2);
  const p = [rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)];
  const e = figure.add({
    make: 'polygon',
    radius: r,
    sides: 20,
    color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
    transform: [['t', p[0], p[1]]],
    mods: {
      simple: true,
      custom: { velocity: [rand(-0.15, 0.15), rand(-0.15, 0.15)]},
      state: {
        isChanging: true,
      },
    },
  });
  e.setupDraw = (now) => {
    if (e.customState.lastTime == null) {
      e.customState.lastTime = now;
    }
    // const now = now / 1000;
    const deltaTime = now - e.customState.lastTime;
    e.customState.lastTime = now;
    const { velocity } = e.custom;
    const { transform } = e;
    transform.order[0].x += velocity[0] * deltaTime;
    transform.order[0].y += velocity[1] * deltaTime;
    if (transform.order[0].x <= -3 + r) {
      velocity[0] = Math.abs(velocity[0]);
    }
    if (transform.order[0].x >= 3 - r) {
      velocity[0] = -Math.abs(velocity[0]);
    }
    if (transform.order[0].y <= -3 + r) {
      velocity[1] = Math.abs(velocity[1]);
    }
    if (transform.order[0].y >= 3 - r) {
      velocity[1] = -Math.abs(velocity[1]);
    }
  };

  e.draw = (now, parentTransform) => {
    const { x, y } = e.transform.order[0];
    const mat = Fig.tools.m2.mul(parentTransform[0].matrix(), [1, 0, x, 0, 1, y, 0, 0, 1]);
    e.drawingObject.drawWithTransformMatrix(
      mat, e.color,
    );
  };
}
figure.addFrameRate(20);
figure.elements.transform = new Fig.Transform();
figure.animateNextFrame();
