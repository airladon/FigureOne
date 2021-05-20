/* globals Fig */
const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [1, 1, 0.9, 1],
});
const { rand } = Fig.tools.math;

for (let i = 0; i < 250; i += 1) {
  const r = rand(0.1, 0.2);
  const p = [rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)];
  const e = figure.add({
    make: 'polygon',
    radius: r,
    sides: 4,
    color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
    transform: [['t', p[0], p[1]]],
    mods: {
      // Setting an element to 'simple' reduces a FigureElements functionality:
      //   - Transforms set on the element will not be reflected in
      //     methods like `getPosition` until after the next draw frame
      simple: true,
      // A custom property that stores the initial velocity
      custom: { velocity: [rand(-0.15, 0.15), rand(-0.15, 0.15)] },
      state: {
        // Use isChanging property to indicate the element needs to be updated
        // every draw frame
        isChanging: true,
      },
    },
  });
  e.setupDraw = (now) => {
    // Get the delta time from the last frame
    if (e.customState.lastTime == null) {
      e.customState.lastTime = now;
    }
    const deltaTime = now - e.customState.lastTime;
    const { velocity } = e.custom;
    const { transform } = e;

    // Calculate the new position coordinates
    const x = transform.order[0].x + velocity[0] * deltaTime;
    const y = transform.order[0].y + velocity[1] * deltaTime;

    // Manually update the transform and resulting matrix for the new position
    transform.order[0].x = x;
    transform.order[0].y = y;
    transform.mat = [1, 0, transform.order[0].x, 0, 1, transform.order[0].y, 0, 0, 1];

    // If the shape is on or crossing a boundary, then set the
    // velocity sign so it bounces back into the figure.
    if (x <= -3 + r) { velocity[0] = Math.abs(velocity[0]); }
    if (x >= 3 - r) { velocity[0] = -Math.abs(velocity[0]); }
    if (y <= -3 + r) { velocity[1] = Math.abs(velocity[1]); }
    if (y >= 3 - r) { velocity[1] = -Math.abs(velocity[1]); }

    // Set lastTime for the next frame delta calculation
    e.customState.lastTime = now;
  };
}
figure.addFrameRate(20);
figure.elements.transform = new Fig.Transform();
figure.animateNextFrame();
