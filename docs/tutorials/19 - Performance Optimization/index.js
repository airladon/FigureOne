/* globals Fig */
const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [1, 1, 0.9, 1],
});
const { rand } = Fig.tools.math;

// // Add n polygons, each of which has a random size, start position and
// // velocity. They move freely and bounce off the figure boundaries without
// // deceleration.
// const n = 1;
// for (let i = 0; i < n; i += 1) {
//   const r = rand(0.1, 0.2);
//   const e = figure.add({
//     make: 'polygon',
//     radius: r,
//     sides: 100,
//     color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
//     rotation: Math.PI / 4,
//     transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
//     mods: {
//       move: {
//         freely: { deceleration: 0, bounceLoss: 0 },
//         bounds: 'figure',
//       },
//       state: {
//         movement: { velocity: [['t', rand(-0.3, 0.3), rand(-0.3, 0.3)]] },
//       },
//     },
//   });
//   e.startMovingFreely();
// }

// for (let i = 0; i < 150; i += 1) {
//   const r = rand(0.1, 0.2);
//   figure.add({
//     make: 'polygon',
//     radius: r,
//     sides: 100,
//     color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
//     // position: [rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)],
//     transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
//   });
// }


// // Add a frame rate annotation to the figure showing average and worst case
// // frame rate in last 10 frames
// figure.addFrameRate(10);

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

for (let i = 0; i < 400; i += 1) {
  const r = rand(0.1, 0.2);
  const e = figure.add({
    make: 'polygon',
    radius: r,
    sides: 20,
    color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
    transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
    mods: {
      simple: true,
      state: {
        movement: { velocity: [['t', rand(-0.15, 0.15), rand(-0.15, 0.15)]] },
      },
    },
  });
  e.decelerate = (deltaTime) => {
    const velocity = e.state.movement.velocity._dup();
    const transform = e.transform._dup();
    transform.order[0].x += velocity.order[0].x * deltaTime;
    transform.order[0].y += velocity.order[0].y * deltaTime;
    if (transform.order[0].x <= -3 + r) {
      velocity.order[0].x = Math.abs(velocity.order[0].x);
    }
    if (transform.order[0].x >= 3 - r) {
      velocity.order[0].x = -Math.abs(velocity.order[0].x);
    }
    if (transform.order[0].y <= -2.7 + r) {
      velocity.order[0].y = Math.abs(velocity.order[0].y);
    }
    if (transform.order[0].y >= 3 - r) {
      velocity.order[0].y = -Math.abs(velocity.order[0].y);
    }
    // let k = 0;
    // for (let j = 0; j < 1000000; j += 1) {
    //   k += 1;
    // }
    return {
      velocity,
      transform,
      duration: 0,
    };
  };
  e.setupDraw = (now) => {
    if (e.customState.lastTime == null) {
      e.customState.lastTime = now;
    }
    // const now = now / 1000;
    const deltaTime = now - e.customState.lastTime;
    e.customState.lastTime = now;
    const { velocity } = e.state.movement;
    const { transform } = e;

    transform.order[0].x += velocity.order[0].x * deltaTime;
    transform.order[0].y += velocity.order[0].y * deltaTime;
    if (transform.order[0].x <= -3 + r) {
      velocity.order[0].x = Math.abs(velocity.order[0].x);
    }
    if (transform.order[0].x >= 3 - r) {
      velocity.order[0].x = -Math.abs(velocity.order[0].x);
    }
    if (transform.order[0].y <= -3 + r) {
      velocity.order[0].y = Math.abs(velocity.order[0].y);
    }
    if (transform.order[0].y >= 3 - r) {
      velocity.order[0].y = -Math.abs(velocity.order[0].y);
    }
  };
  e.decelerate = () => {
    return { duration: 0 };
  }

  e.draw = (now, parentTransform) => {
    const { x, y } = e.transform.order[0];
    const mat = Fig.tools.m2.mul(parentTransform[0].matrix(), [1, 0, x, 0, 1, y, 0, 0, 1]);
    // const mat = e.transform.matrix();
    // console.log(e.transform.t())
    e.drawingObject.drawWithTransformMatrix(
      mat, e.color, 0, e.drawingObject.numPoints,
    );
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
figure.addFrameRate(20);
figure.elements.transform = new Fig.Transform();
figure.animateNextFrame();
