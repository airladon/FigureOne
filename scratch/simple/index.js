// const figure = new Fig.Figure();

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [0, 0, 0, 1],
});

const vertexShader = `
attribute vec2 a_position;
attribute vec2 a_center;
uniform mat3 u_matrix;
uniform vec3 u_charge1;
uniform vec3 u_charge2;
uniform vec3 u_charge3;
uniform vec3 u_charge4;
uniform vec3 u_charge5;
uniform vec3 u_charge6;
uniform vec3 u_charge7;
uniform vec3 u_charge8;
uniform vec3 u_charge9;
uniform vec3 u_charge10;
varying vec4 v_col;

vec2 polarToRect(float mag, float angle) {
  return vec2(mag * cos(angle), mag * sin(angle));
}

vec2 rectToPolar(float x, float y) {
  return vec2(sqrt(x * x + y * y), atan(y, x));
}

vec2 fromCharge(vec3 charge) {
  float angle = atan(charge.y - a_center.y, charge.x - a_center.x);
  float dist = distance(charge.xy, a_center.xy);
  float q = charge.z / pow(dist, 2.0);
  return polarToRect(q, angle);
}

void main() {
  mat3 centerToOrigin = mat3(1, 0, 0, 0, 1, 0, -a_center.x, -a_center.y, 1);
  mat3 originToCenter = mat3(1, 0, 0, 0, 1, 0, a_center.x, a_center.y, 1);
  vec2 centerOffset = vec2(a_center.x - a_position.x, a_center.y - a_position.y);

  vec2 c1 = fromCharge(u_charge1);
  vec2 c2 = fromCharge(u_charge2);
  vec2 c3 = fromCharge(u_charge3);
  vec2 c4 = fromCharge(u_charge4);
  vec2 c5 = fromCharge(u_charge5);
  vec2 c6 = fromCharge(u_charge6);
  vec2 c7 = fromCharge(u_charge7);
  vec2 c8 = fromCharge(u_charge8);
  vec2 c9 = fromCharge(u_charge9);
  vec2 c10 = fromCharge(u_charge10);

  vec2 sum = c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8 + c9 + c10;
  vec2 charge = rectToPolar(sum.x, sum.y);
  float mag = charge.x;
  float angle = charge.y;
  // float mag = 10.0 * log(charge.x) / log(10.0) / 2.0;
  // float scale = max(min(mag / 2.0, 2.0), 0.5);
  // float scale = max(0.5, min(sqrt(mag), 1.5));
  float scale = 1.0;
  float normCharge = (max(0.0, min(sqrt(mag), 2.0))  - 0.0)/ 2.0;


  float s = sin(angle);
  float c = cos(angle);


  mat3 scaleRotation = mat3(c * scale, s * scale, 0, -s * scale, c * scale, 0, 0, 0, 1);
  vec3 final = originToCenter * scaleRotation * centerToOrigin * vec3(a_position.x, a_position.y, 1);

  gl_Position = vec4((u_matrix * vec3(final.x, final.y, 1)).xy, 0, 1);
  v_col = vec4(normCharge, 0.2, 1.0 - normCharge, 1);
}`;

const points = [];
const centers = [];
const tWidth = 0.01;
const tLength = 0.08;
const hWidth = 0.03;
const hLength = 0.05;
const step = 0.2;
const halfLength = (tLength + hLength) / 2;
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

const element = figure.add({
  make: 'gl',
  vertexShader: {
    src: vertexShader,
    vars: [
      'a_position', 'a_center', 'u_matrix', 'u_charge1',
      'u_charge2',
      'u_charge3',
      'u_charge4',
      'u_charge5',
      'u_charge6',
      'u_charge7',
      'u_charge8',
      'u_charge9',
      'u_charge10',
    ],
  },
  fragShader: 'vertexColor',
  vertices: { data: points },
  buffers: [
    { name: 'a_center', data: centers },
  ],
  uniforms: [
    { name: 'u_charge1', length: 3 },
    { name: 'u_charge2', length: 3 },
    { name: 'u_charge3', length: 3 },
    { name: 'u_charge4', length: 3 },
    { name: 'u_charge5', length: 3 },
    { name: 'u_charge6', length: 3 },
    { name: 'u_charge7', length: 3 },
    { name: 'u_charge8', length: 3 },
    { name: 'u_charge9', length: 3 },
    { name: 'u_charge10', length: 3 },
  ],
  // mods: { state: { isChanging: true } },
});

const charges = [];
for (let i = 1; i <= 10; i += 1) {
  const charge = figure.add({
    make: 'polygon',
    sides: 20,
    radius: 0.15,
    color: [1, 0, 0, 1],
    mods: {
      isMovable: true,
      move: { bounds: 'figure' },
      custom: { charge: 1 },
    },
  });
  charge.notifications.add('setTransform', () => {
    const p = charge.getPosition();
    element.custom.updateUniform(`u_charge${i}`, [p.x, p.y, -1]);
  });
  charges.push(charge);
  charge.setPosition(0, 0);
}

const goToCircle = () => {
  const radius = 1;
  const center = [0, 0];
  const angleStep = Math.PI * 2 / charges.length;
  for (let i = 0; i < charges.length; i += 1) {
    const charge = charges[i];
    charge.animations.new()
      .position({
        target: [
          radius * Math.cos(angleStep * i) + center[0],
          radius * Math.sin(angleStep * i) + center[1],
        ],
        duration: 2,
      })
      .start();
  }
};

const goToCapacitor = () => {
  const separation = 1;
  const length = 1.5;
  const lenStep = length / charges.length * 2;
  let start = -length / 2;
  let y = -separation / 2;
  let count = 0;
  for (let i = 0; i < charges.length; i += 1) {
    if (i === charges.length / 2) {
      start = -length / 2;
      y = separation / 2;
      count = 0;
    }
    const charge = charges[i];
    charge.animations.new()
      .position({
        target: [start + count * lenStep, y],
        duration: 2,
      })
      .start();
    count += 1;
  }
};
goToCapacitor();
// const charge2 = figure.add({
//   make: 'polygon',
//   sides: 20,
//   radius: 0.15,
//   color: [1, 0, 1, 1],
//   mods: {
//     isMovable: true,
//     move: { bounds: 'figure' },
//   },
// });

// const charge3 = figure.add({
//   make: 'polygon',
//   sides: 20,
//   radius: 0.2,
//   color: [1, 0, 1, 1],
//   mods: {
//     isMovable: true,
//     move: { bounds: 'figure' },
//   },
// });

// charge1.notifications.add('setTransform', () => {
//   const p = charge1.getPosition();
//   element.custom.updateUniform('u_charge1', [p.x, p.y, 1]);
// });

// charge2.notifications.add('setTransform', () => {
//   const p = charge2.getPosition();
//   element.custom.updateUniform('u_charge2', [p.x, p.y, -1]);
// });

// charge3.notifications.add('setTransform', () => {
//   const p = charge3.getPosition();
//   element.custom.updateUniform('u_charge3', [p.x, p.y, -1]);
// });

// charge1.setPosition(-0.7, 0);
// charge2.setPosition(0.7, 0);
// charge3.setPosition(0, 0);

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
