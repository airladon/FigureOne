/* global Fig */
const { Figure, tools, Scene } = Fig;

const figure = new Figure({
  scene: {
    style: 'orthographic',
    camera: {
      position: [0, 0, 1],
    },
    left: -4.5,
    bottom: -4.5,
    right: 4.5,
    top: 4.5,
    near: 0.1,
    far: 20,
    light: {
      directional: [1, 0.3, 0.5],
      ambient: 0.1,
      point: [1.85, 4.15, 0.3],
    },
  },
  color: [1, 0, 0, 1],
});

figure.add([
  {
    name: 'origin',
    make: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1],
    },
  },
  {
    name: 'grid',
    make: 'grid',
    options: {
      bounds: [-4.5, -4.5, 9, 9],
      step: 0.1,
      color: [0.9, 0.9, 0.9, 1],
      line: { width: 0.004 },
    },
  },
  {
    name: 'gridMajor',
    make: 'grid',
    options: {
      bounds: [-4.5, -4.5, 9, 9],
      step: 0.5,
      color: [0.7, 0.7, 0.7, 1],
      line: { width: 0.004 },
    },
  },
]);


// ***************************************************
// ***************************************************
// ***************************************************
const xValues = tools.math.range(-4, 4, 1);
const yValues = tools.math.range(4, -4, -1);
let index = 0;
const makeShape = (options, reverseLight) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const name = `_${index}`;
  index += 1;
  let scene;
  if (reverseLight) {
    scene = new Scene({
      style: 'orthographic',
      camera: {
        position: [0, 0, 1],
      },
      left: -4.5,
      bottom: -4.5,
      right: 4.5,
      top: 4.5,
      near: 0.1,
      far: 20,
      light: {
        directional: [-1, -0.5, 0.1],
        ambient: 0.2,
        point: [1.85, 4.15, 0.3],
      },
    });
  }
  // console.log(scene)
  return tools.misc.joinObjects({ name, make: 'prism' }, {
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${index}: ${name} - ${x}, ${y}`),
    }),
    base: [[0, 0], [0.5, 0], [0.5, 0.2], [0, 0.2]],
    lines: false,
    length: 0.3,
    scene,
    transform: [
      ['s', 1, 1, 1],
      ['r', -Math.PI / 10, 0, 1, 0],
      ['r', Math.PI / 5, 1, 0, 0],
      ['t', x, y, 0],
    ],
  }, options);
};

/* eslint-disable object-curly-newline */
const shapes = [
  // Definitions
  makeShape({}),
  makeShape({ length: 0.5 }),
  makeShape({ base: Fig.polygon({ sides: 6, radius: 0.3 }) }),
  makeShape({
    base: [[0, 0], [0.25, 0.1], [0.5, 0], [0.5, 0.3], [0.25, 0.2], [0, 0.3]],
    baseTriangles: [
      [0, 0], [0.25, 0.1], [0.25, 0.2],
      [0, 0], [0.25, 0.2], [0, 0.3],
      [0.25, 0.1], [0.5, 0], [0.5, 0.3],
      [0.25, 0.1], [0.5, 0.3], [0.25, 0.2],
    ],
  }),
  makeShape({ lines: true }),
];
figure.add(shapes);
