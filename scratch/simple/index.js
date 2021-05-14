// const figure = new Fig.Figure();

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [1, 1, 0.9, 1],
});
const { rand } = Fig.tools.math;

const num = 10;
for (let i = 0; i < num; i += 1) {
  const r = rand(0.1, 0.2);
  const e = figure.add({
    make: 'polygon',
    radius: r,
    color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
    rotation: Math.PI / 4,
    // transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
    position: [rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)],
    mods: {
      move: {
        freely: { deceleration: 0, bounceLoss: 0 },
        bounds: 'figure',
      },
      state: {
        movement: { velocity: [['s', 0, 0], ['r', 0], ['t', rand(-0.3, 0.3), rand(-0.3, 0.3)]] },
      },
    },
  });
  e.startMovingFreely();
}
figure.addFrameRate();



// for (let i = 0; i < 100; i += 1) {
//   const r = rand(0.1, 0.2);
//   const e = figure.add({
//     make: 'polygon',
//     radius: r,
//     color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
//     transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
//     mods: {
//       simple: true,
//       state: {
//         movement: { velocity: [['t', rand(-0.3, 0.3), rand(-0.3, 0.3)]] },
//       },
//     },
//   });
//   e.decelerate = (deltaTime) => {
//     const velocity = e.state.movement.velocity._dup();
//     const transform = e.transform._dup();
//     transform.order[0].x += velocity.order[0].x * deltaTime;
//     transform.order[0].y += velocity.order[0].y * deltaTime;
//     if (transform.order[0].x <= -3 + r) {
//       velocity.order[0].x = Math.abs(velocity.order[0].x);
//     }
//     if (transform.order[0].x >= 3 - r) {
//       velocity.order[0].x = -Math.abs(velocity.order[0].x);
//     }
//     if (transform.order[0].y <= -2.7 + r) {
//       velocity.order[0].y = Math.abs(velocity.order[0].y);
//     }
//     if (transform.order[0].y >= 3 - r) {
//       velocity.order[0].y = -Math.abs(velocity.order[0].y);
//     }
//     return {
//       velocity,
//       transform,
//       duration: 0,
//     };
//   };

//   e.startMovingFreely();
//   // e.animations.new()
//   //   .custom({
//   //     callback: () => {
//   //       if (e.customState.lastTime == null) {
//   //         e.customState.lastTime = figure.timeKeeper.now() / 1000;
//   //       }
//   //       const now = figure.timeKeeper.now() / 1000;
//   //       const deltaTime = now - e.customState.lastTime;
//   //       e.customState.lastTime = now;
//   //       const { velocity } = e.state.movement;
//   //       const { transform } = e;

//   //       transform.order[0].x += velocity.order[0].x * deltaTime;
//   //       transform.order[0].y += velocity.order[0].y * deltaTime;
//   //       if (transform.order[0].x <= -3 + radius) {
//   //         velocity.order[0].x = Math.abs(velocity.order[0].x);
//   //       }
//   //       if (transform.order[0].x >= 3 - radius) {
//   //         velocity.order[0].x = -Math.abs(velocity.order[0].x);
//   //       }
//   //       if (transform.order[0].y <= -3 + radius) {
//   //         velocity.order[0].y = Math.abs(velocity.order[0].y);
//   //       }
//   //       if (transform.order[0].y >= 3 - radius) {
//   //         velocity.order[0].y = -Math.abs(velocity.order[0].y);
//   //       }
//   //     },
//   //     duration: 10,
//   //   })
//   //   .start();
// }
// figure.addFrameRate();
// figure.elements.transform = new Fig.Transform();
// figure.animateNextFrame();
