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
const vertexShader = `attribute vec2 a_position;
attribute vec4 a_col;
attribute vec2 a_vel;
attribute vec2 a_center;
attribute float a_radius;
varying vec4 v_col;
uniform mat3 u_matrix;
uniform float u_z;
uniform float u_time;
float calc(float limit, float pos, float center, float vel) {
  float xDirection = vel / abs(vel);
  float xOffset = abs(center - xDirection * limit);
  float xTotalDistance = abs(vel * u_time);
  float xNumBounces = 0.0;
  if (xTotalDistance > xOffset) {
    xNumBounces = 1.0;
  }
  xNumBounces = xNumBounces + floor(abs((xTotalDistance - xOffset)) / (2.0 * limit));
  float xLastDirection = (mod(xNumBounces, 2.0) == 0.0) ? xDirection : -xDirection;
  float xLastWall = center;
  float xRemainderDistance = xTotalDistance;
  if (xNumBounces > 0.0) {
    xLastWall = (mod(xNumBounces, 2.0) == 0.0) ? -xDirection * limit : xDirection * limit;
    xRemainderDistance = mod(xTotalDistance - xOffset, 2.0 * limit);
  }
  float x = xLastWall + xRemainderDistance * xLastDirection + pos - center;
  return x;
}
void main() {
  float x = calc(3.0 - a_radius, a_position.x, a_center.x, a_vel.x);
  float y = calc(3.0 - a_radius, a_position.y, a_center.y, a_vel.y);
  gl_Position = vec4((u_matrix * vec3(x, y, 1)).xy, u_z, 1);
  v_col = a_col;
}`;

const element = figure.add({
  make: 'gl',
  vertexShader: {
    src: vertexShader,
    vars: ['a_position', 'a_col', 'a_vel', 'a_center', 'a_radius', 'u_matrix', 'u_z', 'u_time'],
  },
  mods: { state: { isChanging: true } },
});

const points = [];
const velocities = [];
const colors = [];
const centers = [];
const radii = [];
const sides = 20;
const step = Math.PI * 2 / (sides);
for (let i = 0; i < 1000; i += 1) {
  const r = rand(0.1, 0.2);
  const p = [rand(-3 + r, 3 - r), rand(-3 + r, 3 - r)];
  const v = [rand(-0.15, 0.15), rand(-0.15, 0.15)];
  const color = [rand(0, 255), rand(0, 255), rand(0, 255), rand(0, 255)];
  for (let j = 0; j < sides; j += 1) {
    points.push(p[0], p[1]);
    points.push(r * Math.cos(step * j) + p[0], r * Math.sin(step * j) + p[1]);
    points.push(r * Math.cos(step * (j + 1)) + p[0], r * Math.sin(step * (j + 1)) + p[1]);
    velocities.push(v[0], v[1], v[0], v[1], v[0], v[1]);
    centers.push(p[0], p[1], p[0], p[1], p[0], p[1]);
    radii.push(r, r, r);
    colors.push(...color, ...color, ...color);
  }
}
element.drawingObject.addVertices(points);
element.drawingObject.addBuffer('a_col', 4, colors, 'UNSIGNED_BYTE', true);
element.drawingObject.addBuffer('a_vel', 2, velocities);
element.drawingObject.addBuffer('a_center', 2, centers);
element.drawingObject.addBuffer('a_radius', 1, radii);
element.drawingObject.addUniform('u_time');
let startTime = null;
figure.notifications.add('beforeDraw', () => {
  if (startTime == null) {
    startTime = figure.timeKeeper.now();
  }
  const deltaTime = (figure.timeKeeper.now() - startTime) / 1000;
  // console.log(deltaTime)
  element.drawingObject.uniforms['u_time'].value = [deltaTime];
});
figure.addFrameRate();
figure.animateNextFrame();


const p = figure.add({
  make: 'gl',
  vertexShader: 'withTexture',
  fragShader: 'withTexture',
});
p.drawingObject.addVertices([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 'DYNAMIC');
p.drawingObject.addTexture('./texture.jpg');

p.animations.new()
  .custom({
    callback: (percent) => {
      p.drawingObject.updateVertices([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1].map(v => v + percent));
    },
    duration: 10,
  })
  .start();

const q = figure.add({
  make: 'polygon',
  radius: 0.4,
  sides: 6,
  // texture: { src: './texture.jpg' },
});

q.animations.new()
  .custom({
    callback: (percent) => {
      q.custom.updatePoints({ radius: percent, sides: Math.floor(percent * 10 + 3), sidesToDraw: Math.floor(percent * 10 + 3) });
    },
    duration: 10,
  })
  .start();

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
