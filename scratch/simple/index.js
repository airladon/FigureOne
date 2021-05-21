/* globals Fig */

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [0, 0, 0, 1],
});

const { rand } = Fig.tools.math;

/*
.##.....##.....######..##.....##....###....########..########.########.
.##.....##....##....##.##.....##...##.##...##.....##.##.......##.....##
.##.....##....##.......##.....##..##...##..##.....##.##.......##.....##
.##.....##.....######..#########.##.....##.##.....##.######...########.
..##...##...........##.##.....##.#########.##.....##.##.......##...##..
...##.##......##....##.##.....##.##.....##.##.....##.##.......##....##.
....###........######..##.....##.##.....##.########..########.##.....##
*/
// Each charge position and value is a uniform. There are 20 charges, and so
// there are 20 uniforms
const vertexShader = `
attribute vec2 a_position;
attribute vec2 a_pos2;
attribute vec2 a_pos3;
attribute vec2 a_pos4;
uniform mat3 u_matrix;
uniform float u_percent;
uniform int u_from;
uniform int u_to;

void main() {
  vec2 fromPos = a_position;
  vec2 toPos = a_pos2;
  vec2 positions[4];

  positions[0] = a_position;
  positions[1] = a_pos2;
  positions[2] = a_pos3;
  positions[3] = a_pos4;

  for (int i = 0; i < 4; i++) {
    if (u_from == i) {
      fromPos = positions[i];
      break;
    }
  }
  for (int i = 0; i < 4; i++) {
    if (u_to == i) {
      toPos = positions[i];
      break;
    }
  }

  vec2 newPosition = (toPos - fromPos) * u_percent + fromPos;
  gl_Position = vec4((u_matrix * vec3(newPosition.xy, 1)).xy, 0, 1);
}`;

const points1 = [];
const points2 = [];
const points3 = [];
const points4 = [];
const colors1 = [];
const colors2 = [];
const colors3 = [];
const colors4 = [];
const r = 0.02;
const makeShape = center => [
  center[0] - r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] + r / 2,
  center[0] - r / 2, center[1] - r / 2,
  center[0] + r / 2, center[1] + r / 2,
  center[0] - r / 2, center[1] + r / 2,
];
const n = 10000;
const s = 1;
for (let i = 0; i < n; i += 1) {
  const x = -Math.PI * 0.9 + Math.PI * 2 * 0.9 / n * i;
  // const center1 = [rand(-2, 2), rand(-2, 2)];
  // points1.push(...makeShape(center1));
  // const center1 = [rand(-2, 2), 0];
  const center1 = [x, 0];
  points1.push(...makeShape(center1));
  const center2 = [
    0.9 * Math.cos(Math.PI * 2 / n * i + Math.PI / 4),
    0.9 * Math.sin(Math.PI * 2 / n * i + Math.PI / 4),
  ];
  points2.push(...makeShape(center2));
  let center3;
  if (i < n / 4) {
    center3 = [s / 2 - s / (n / 4) * i, s / 2];
  } else if (i < n / 2) {
    center3 = [-s / 2, s / 2 - s / (n / 4) * (i % (n / 4))];
  } else if (i < n / 4 * 3) {
    center3 = [-s / 2 + s / (n / 4) * (i % (n / 4)), -s / 2];
  } else {
    center3 = [s / 2, -s / 2 + s / (n / 4) * (i % (n / 4))];
  }
  points3.push(...makeShape(center3));
  // points4.push(...makeShape([x, Math.sin(Math.PI * 2 / 4 * x)]));
  const p4 = Fig.tools.g2.polarToRect(rand(-3, 3), rand(-3, 3));
  points4.push(...makeShape([p4.x, p4.y]));
  colors1.push([1, 0, 0, 1]);
  colors2.push([0, 1, 0, 1]);
  colors3.push([0, 0, 1, 1]);
  colors4.push([0, 1, 1, 1]);
}

// The `field` FigureElement has the arrow grid within it.
// The vertex shader will orient and scale the arrows based on the
// superposition of charge contributions from each charge at the vertex the
// shader is operating on.
// const trace = figure.add({
//   make: 'gl',
//   vertexShader: {
//     src: vertexShader,
//     vars: [
//       'a_position',
//       'a_pos2',
//       'a_pos3',
//       'a_pos4',
//       'u_matrix',
//       'u_percent',
//       'u_from',
//       'u_to',
//     ],
//   },
//   fragShader: 'simple',
//   vertices: { data: points1 },
//   buffers: [
//     { name: 'a_pos2', data: points2 },
//     { name: 'a_pos3', data: points3 },
//     { name: 'a_pos4', data: points4 },
//   ],
//   uniforms: [
//     { name: 'u_percent', length: 1 },
//     { name: 'u_from', length: 1, type: 'INT' },
//     { name: 'u_to', length: 1, type: 'INT' },
//   ],
//   color: [1, 0, 0, 1],
// });

// trace.animations.new()
//   .custom(
//     {
//       callback: (p) => {
//         trace.custom.updateUniform('u_from', 3);
//         trace.custom.updateUniform('u_to', 2);
//         trace.custom.updateUniform('u_percent', p);
//       },
//       duration: 2,
//     },
//   )
//   .custom(
//     {
//       callback: (p) => {
//         trace.custom.updateUniform('u_from', 2);
//         trace.custom.updateUniform('u_to', 1);
//         trace.custom.updateUniform('u_percent', p);
//       },
//       duration: 2,
//     },
//   )
//   .custom(
//     {
//       callback: (p) => {
//         trace.custom.updateUniform('u_from', 1);
//         trace.custom.updateUniform('u_to', 0);
//         trace.custom.updateUniform('u_percent', p);
//       },
//       duration: 2,
//     },
//   )
//   .start();

// figure.addFrameRate(10, { font: { color: [1, 1, 1, 0]}});
// figure.animateNextFrame();

const m = figure.add({
  make: 'morph',
  points: {
    step0: points1,
    step1: points2,
    step2: points3,
    step3: points4,
  },
  // color: {
  //   step0: [],
  //   step1: [],
  //   step2: [],
  // },
  color: [1, 0, 0, 1],
});

m.animations.new()
  .delay(1)
  .morph({ start: 'step0', target: 'step1', duration: 1 })
  .morph({ start: 'step1', target: 'step2', duration: 1 })
  .morph({ start: 'step2', target: 'step3', duration: 1 })
  .morph({ start: 'step3', target: 'step0', duration: 1 })
  .start();
