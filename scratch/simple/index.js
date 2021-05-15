// const figure = new Fig.Figure();

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [1, 1, 0.9, 1],
});
const { rand } = Fig.tools.math;

// const num = 10;
// for (let i = 0; i < num; i += 1) {
//   const r = rand(0.1, 0.2);
//   const e = figure.add({
//     make: 'polygon',
//     radius: r,
//     color: [rand(0, 1), rand(0, 1), rand(0, 1), 0.7],
//     rotation: Math.PI / 4,
//     // transform: [['t', rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)]],
//     position: [rand(-2.9 + r, 2.9 - r), rand(-2.7 + r, 2.9 - r)],
//     mods: {
//       move: {
//         freely: { deceleration: 0, bounceLoss: 0 },
//         bounds: 'figure',
//       },
//       state: {
//         movement: { velocity: [['s', 0, 0], ['r', 0], ['t', rand(-0.3, 0.3), rand(-0.3, 0.3)]] },
//       },
//     },
//   });
//   e.startMovingFreely();
// }
// figure.addFrameRate();
const element = figure.add({
  make: 'gl',
  mods: { state: { isChanging: true } },
});

const points = [];
const velocities = [];
const colors = [];
const centers = [];
const sides = 3;
const step = Math.PI * 2 / (sides);
for (let i = 0; i < 10; i += 1) {
  const r = rand(0.1, 0.2);
  const p = [rand(-3 + r, 3 - r), rand(-3 + r, 3 - r)];
  const v = [rand(-0.15, 0.15), rand(-0.15, 0.15)];
  const color = [rand(0, 1), rand(0, 1), rand(0, 1), rand(0, 1)];
  for (let j = 0; j < sides; j += 1) {
    points.push(p[0], p[1]);
    points.push(r * Math.cos(step * j) + p[0], r * Math.sin(step * j) + p[1]);
    points.push(r * Math.cos(step * (j + 1)) + p[0], r * Math.sin(step * (j + 1)) + p[1]);
    velocities.push(v[0], v[1], v[0], v[1], v[0], v[1]);
    centers.push(p[0], p[1], p[0], p[1], p[0], p[1]);
    colors.push(...color, ...color, ...color);
  }
}
element.drawingObject.addVertices(points);
// element.drawingObject.addVertices([0, 0, 1, 0, 1, 1]);
// element.color = [1, 0, 0, 1];
// console.log(points)
console.log(points)
console.log(centers)
element.drawingObject.addBuffer('a_col', 4, colors);
element.drawingObject.addBuffer('a_vel', 2, velocities);
element.drawingObject.addBuffer('a_center', 2, centers);
element.drawingObject.addUniform('u_time', [0]);
let startTime = null;
figure.notifications.add('beforeDraw', () => {
  if (startTime == null) {
    startTime = figure.timeKeeper.now();
  }
  const deltaTime = (figure.timeKeeper.now() - startTime) / 1000;
  // console.log(deltaTime)
  element.drawingObject.uniforms['u_time'] = [deltaTime];
});
figure.addFrameRate();
//   [
//     1, 0, 0, 1,
//     0, 1, 0, 1,
//     0, 0, 1, 1,
//   ],
// );
figure.animateNextFrame();


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
