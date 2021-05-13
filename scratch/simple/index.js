// const figure = new Fig.Figure();

const figure = new Fig.Figure({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 }, backgroundColor: [1, 1, 0.9, 1] });

const { rand } = Fig.tools.math;

for (let i = 0; i < 500; i += 1) {
  const radius = Fig.tools.math.rand(0.1, 0.2);
  const color = [rand(0, 1), rand(0, 1), rand(0, 1), 0.5];
  const position = [rand(-2.9 + radius, 2.9 - radius), rand(-2.9 + radius, 2.9 - radius)];
  const e = figure.add({
    make: 'polygon',
    radius,
    color,
    sides: 6,
    transform: [['r', 0], ['t', position[0], position[1]]],
    mods: {
    //   move: {
    //     freely: { deceleration: 0.00001, bounceLoss: 0.00001 },
    //     // bounds: 'figure',
    //   },
    //   isMovable: true,
      customState: { radius },
      state: {
        movement: { velocity: new Fig.Transform().rotate(rand(-0.7, 0.7)).translate(rand(-0.3, 0.3), rand(-0.3, 0.3)) },
      },
    },
  });
  // e.startMovingFreely();
  e.animations.new()
    .custom({
      callback: () => {
        if (e.customState.lastTime == null) {
          e.customState.lastTime = figure.timeKeeper.now() / 1000;
        }
        const now = figure.timeKeeper.now() / 1000;
        const deltaTime = now - e.customState.lastTime;
        e.customState.lastTime = now;

        // const currentPosition = e.transform.order[0].x;
        e.transform.order[1].x = e.transform.order[1].x + e.state.movement.velocity.order[1].x * deltaTime;
        e.transform.order[1].y = e.transform.order[1].y + e.state.movement.velocity.order[1].y * deltaTime;
        e.transform.order[0].r = e.transform.order[0].r + e.state.movement.velocity.order[0].r * deltaTime;
        if (e.transform.order[1].x <= -3 + radius) {
          e.state.movement.velocity.order[1].x = Math.abs(e.state.movement.velocity.order[1].x);
          e.state.movement.velocity.order[1].r = Math.abs(e.state.movement.velocity.order[1].r);
        }
        if (e.transform.order[1].x >= 3 - radius) {
          e.state.movement.velocity.order[1].x = -Math.abs(e.state.movement.velocity.order[1].x);
          e.state.movement.velocity.order[1].r = -Math.abs(e.state.movement.velocity.order[1].r);
        }
        if (e.transform.order[1].y <= -3 + radius) {
          e.state.movement.velocity.order[1].y = Math.abs(e.state.movement.velocity.order[1].y);
          e.state.movement.velocity.order[1].r = Math.abs(e.state.movement.velocity.order[1].r);
        }
        if (e.transform.order[1].y >= 3 - radius) {
          e.state.movement.velocity.order[1].y = -Math.abs(e.state.movement.velocity.order[1].y);
          e.state.movement.velocity.order[1].r = -Math.abs(e.state.movement.velocity.order[1].r);
        }
    }, duration: 100 })
    .start()
}
figure.animateNextFrame();
