// const figure = new Fig.Figure();

const figure = new Fig.Figure({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 }, backgroundColor: [1, 1, 0.9, 1] });

const { rand } = Fig.tools.math;
figure.debug = true;
for (let i = 0; i < 100; i += 1) {
  const radius = rand(0.1, 0.2);
  const color = [rand(0, 1), rand(0, 1), rand(0, 1), 0.3];
  const position = [rand(-2.9 + radius, 2.9 - radius), rand(-2.7 + radius, 2.9 - radius)];
  const e = figure.add({
    make: 'polygon',
    radius,
    color,
    sides: 3,
    transform: [['t', position[0], position[1]]],
    mods: {
      simple: true,
    //   move: {
    //     freely: { deceleration: 0.00001, bounceLoss: 0.00001 },
    //     // bounds: 'figure',
    //   },
    //   isMovable: true,
      // customState: { radius },
      state: {
        movement: { velocity: new Fig.Transform().translate(rand(-0.3, 0.3), rand(-0.3, 0.3)) },
      },
    },
  });
  e.decelerate = (deltaTime) => {
    const velocity = e.state.movement.velocity._dup();
    const transform = e.transform._dup();
    transform.order[0].x += velocity.order[0].x * deltaTime;
    transform.order[0].y += velocity.order[0].y * deltaTime;
    if (transform.order[0].x <= -3 + radius) {
      velocity.order[0].x = Math.abs(velocity.order[0].x);
    }
    if (transform.order[0].x >= 3 - radius) {
      velocity.order[0].x = -Math.abs(velocity.order[0].x);
    }
    if (transform.order[0].y <= -2.7 + radius) {
      velocity.order[0].y = Math.abs(velocity.order[0].y);
    }
    if (transform.order[0].y >= 3 - radius) {
      velocity.order[0].y = -Math.abs(velocity.order[0].y);
    }
    // velocity.order[0].y *= 0.999;
    // velocity.order[0].x *= 0.9;
    return {
      velocity,
      transform,
      duration: 0,
    };
  };

  e.startMovingFreely();
  // e.animations.new()
  //   .custom({
  //     callback: () => {
  //       if (e.customState.lastTime == null) {
  //         e.customState.lastTime = figure.timeKeeper.now() / 1000;
  //       }
  //       const now = figure.timeKeeper.now() / 1000;
  //       const deltaTime = now - e.customState.lastTime;
  //       e.customState.lastTime = now;
  //       const { velocity } = e.state.movement;
  //       const { transform } = e;

  //       transform.order[0].x += velocity.order[0].x * deltaTime;
  //       transform.order[0].y += velocity.order[0].y * deltaTime;
  //       if (transform.order[0].x <= -3 + radius) {
  //         velocity.order[0].x = Math.abs(velocity.order[0].x);
  //       }
  //       if (transform.order[0].x >= 3 - radius) {
  //         velocity.order[0].x = -Math.abs(velocity.order[0].x);
  //       }
  //       if (transform.order[0].y <= -3 + radius) {
  //         velocity.order[0].y = Math.abs(velocity.order[0].y);
  //       }
  //       if (transform.order[0].y >= 3 - radius) {
  //         velocity.order[0].y = -Math.abs(velocity.order[0].y);
  //       }
  //     },
  //     duration: 10,
  //   })
  //   .start();
}
figure.addFrameRate(30);
figure.elements.transform = new Fig.Transform();
figure.animateNextFrame();
