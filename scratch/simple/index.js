// const figure = new Fig.Figure();

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [1, 1, 0.9, 1],
});
const { rand } = Fig.tools.math;

/**
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
 */
const vertexShader = `
attribute vec2 a_position;
attribute vec2 a_center;
uniform mat3 u_matrix;
uniform vec3 u_charge1;

void main() {
  mat3 centerToOrigin = mat3(1, 0, 0, 0, 1, 0, -a_center.x, -a_center.y, 1);
  mat3 originToCenter = mat3(1, 0, 0, 0, 1, 0, a_center.x, a_center.y, 1);
  vec2 centerOffset = vec2(a_center.x - a_position.x, a_center.y - a_position.y);
  float angle = atan(u_charge1.y - a_center.y, u_charge1.x - a_center.x);
  float dist = distance(u_charge1.xy, a_center.xy);
  float scale = min(1.0 / (dist + 0.00001), 1.5);
  float s = sin(angle);
  float c = cos(angle);
  mat3 scaleRotation = mat3(c * scale, s * scale, 0, -s * scale, c * scale, 0, 0, 0, 1);
  vec3 final = originToCenter * scaleRotation * centerToOrigin * vec3(a_position.x, a_position.y, 1);

  gl_Position = vec4((u_matrix * vec3(final.x, final.y, 1)).xy, 0, 1);
}`;

const points = [];
const centers = [];
const tWidth = 0.02;
const tLength = 0.06;
const hWidth = 0.06;
const hLength = 0.08;
const step = 0.2;
const halfLength = (tLength + hLength) / 2;
// console.log(halfLength)
for (
  let x = -2.9;
  x < 2.9 + step / 2;
  x += step
) {
  for (let y = -2.9; y < 2.9 + step / 2; y += step) {
    points.push(
      // Head
      halfLength + x, y,
      halfLength + x - hLength, y + hWidth,
      halfLength + x - hLength, y - hWidth,
      // Tail 1
      halfLength + x - hLength, y + tWidth,
      halfLength + x - hLength - tLength, y + tWidth,
      halfLength + x - hLength - tLength, y - tWidth,
      // Tail 2
      halfLength + x - hLength, y + tWidth,
      halfLength + x - hLength - tLength, y - tWidth,
      halfLength + x - hLength, y - tWidth,
    );
    centers.push(
      x, y, x, y, x, y,
      x, y, x, y, x, y,
      x, y, x, y, x, y,
    );
  }
}
// for (let i = 0; i < 20000; i += 1) {
//   points.push()
//   const r = rand(0.1, 0.2);
//   const p = [rand(-3 + r, 3 - r), rand(-3 + r, 3 - r)];
//   const v = [rand(-0.15, 0.15), rand(-0.15, 0.15)];
//   const color = [rand(0, 255), rand(0, 255), rand(0, 255), 255];
//   for (let j = 0; j < sides; j += 1) {
//     points.push(p[0], p[1]);
//     points.push(r * Math.cos(step * j) + p[0], r * Math.sin(step * j) + p[1]);
//     points.push(r * Math.cos(step * (j + 1)) + p[0], r * Math.sin(step * (j + 1)) + p[1]);
//     velocities.push(v[0], v[1], v[0], v[1], v[0], v[1]);
//     centers.push(p[0], p[1], p[0], p[1], p[0], p[1]);
//     radii.push(r, r, r);
//     colors.push(...color, ...color, ...color);
//   }
// }

const element = figure.add({
  make: 'gl',
  vertexShader: {
    src: vertexShader,
    vars: ['a_position', 'a_center', 'u_matrix', 'u_charge1'],
  },
  vertices: { data: points },
  buffers: [
  //   {
  //     name: 'a_col', size: 4, data: colors, type: 'UNSIGNED_BYTE', normalize: true,
  //   },
  //   { name: 'a_vel', data: velocities },
    { name: 'a_center', data: centers },
  //   { name: 'a_radius', data: radii, size: 1 },
  ],
  uniforms: [
    { name: 'u_charge1', length: 3 },
  ],
  color: [0, 0, 1, 1],
  mods: { state: { isChanging: true } },
});

const charge1 = figure.add({
  make: 'polygon',
  sides: 20,
  radius: 0.2,
  color: [1, 0, 0, 1],
  mods: {
    isMovable: true,
    move: { bounds: 'figure' },
  },
});

charge1.notifications.add('setTransform', () => {
  const p = charge1.getPosition();
  element.custom.updateUniform('u_charge1', [p.x, p.y, 1]);
});

// let startTime = null;
// figure.notifications.add('beforeDraw', () => {
//   if (startTime == null) {
//     startTime = figure.timeKeeper.now();
//   }
//   const deltaTime = (figure.timeKeeper.now() - startTime) / 1000;
//   element.drawingObject.uniforms['u_time'].value = [deltaTime];
// });
figure.addFrameRate();
figure.animateNextFrame();


// const p = figure.add({
//   make: 'gl',
//   vertexShader: 'withTexture',
//   fragShader: 'withTexture',
// });
// p.drawingObject.addVertices([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 'DYNAMIC');
// p.drawingObject.addTexture('./texture.jpg');

// p.animations.new()
//   .custom({
//     callback: (percent) => {
//       p.drawingObject.updateVertices([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1].map(v => v + percent));
//     },
//     duration: 10,
//   })
//   .start();

// const q = figure.add({
//   make: 'polygon',
//   radius: 0.4,
//   sides: 6,
//   // texture: { src: './texture.jpg' },
// });

// q.animations.new()
//   .custom({
//     callback: (percent) => {
//       q.custom.updatePoints({ radius: percent, sides: Math.floor(percent * 10 + 3), sidesToDraw: Math.floor(percent * 10 + 3) });
//     },
//     duration: 10,
//   })
//   .start();

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
