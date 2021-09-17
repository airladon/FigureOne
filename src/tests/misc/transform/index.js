// eslint-disable-next-line no-undef
const { Figure, tools, Transform } = Fig;

const figure = new Figure({
  scene: {
    style: 'orthographic',
    left: -4.5,
    bottom: -4.5,
    right: 4.5,
    top: 4.5,
    near: 0.1,
    far: 20,
    light: {
      directional: [1, 0.5, -0.1],
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
const makeShape = (transform) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const name = `_${index}`;
  index += 1;
  // console.log(scene)
  // return tools.misc.joinObjects({ name, make: 'sphere' }, {
  //   mods: tools.misc.joinObjects({}, {
  //     isTouchable: true,
  //     onClick: () => tools.misc.Console(`${index}: ${name} - ${x}, ${y}`),
  //   }),
  //   sides: 10,
  //   radius: 0.2,
  //   normals: 'flat',
  //   center: [0, 0, 0],
  //   lines: false,
  //   scene,
  //   transform: [
  //     ['s', 1, 1, 1],
  //     ['r', Math.PI / 5, 0, 1, 0],
  //     ['r', Math.PI / 5, 1, 0, 0],
  //     ['t', x, y, 0],
  //   ],
  // }, options);

  return {
    make: 'collection',
    name,
    elements: [
      {
        make: 'cylinder',
        line: [[-0.5, 0, 0], [0.5, 0, 0]],
        radius: 0.01,
        color: [1, 0, 0, 1],
      },
      {
        make: 'cylinder',
        line: [[0, -0.5, 0], [0, 0.5, 0]],
        radius: 0.01,
        color: [0, 1, 0, 1],
      },
      {
        make: 'cylinder',
        line: [[0, 0, -0.5], [0, 0, 0.5]],
        radius: 0.01,
        color: [0, 0, 1, 1],
      },
      {
        make: 'collection',
        elements: [
          {
            make: 'line3',
            p1: [0, 0, 0],
            p2: [0.3, 0, 0],
            arrow: { ends: 'end', length: 0.1, width: 0.05 },
            color: [1, 0, 0, 1],
            width: 0.03,
          },
          {
            make: 'line3',
            p1: [0, 0, 0],
            p2: [0, 0.3, 0],
            arrow: { ends: 'end', length: 0.1, width: 0.05 },
            color: [0, 1, 0, 1],
            width: 0.03,
          },
          {
            make: 'line3',
            p1: [0, 0, 0],
            p2: [0, 0, 0.3],
            arrow: { ends: 'end', length: 0.1, width: 0.05 },
            color: [0, 0, 1, 1],
            width: 0.03,
          },
        ],
        transform,
      },
    ],
    transform: [
      ['s', 1, 1, 1],
      ['r', -Math.PI / 5, 0, 1, 0],
      ['r', Math.PI / 5, 1, 0, 0],
      ['t', x, y, 0],
    ],
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${index}: ${name} - ${x}, ${y}`),
    }),
  };
};

/* eslint-disable object-curly-newline */
const shapes = [
  // Definitions
  makeShape([]),

  // Translation
  makeShape(['t', 0, 0, 0.1]),
  makeShape(['t', 0, 0.1]),
  makeShape([['t', 0.1, 0, 0]]),
  makeShape(new Transform().translate(0.1, 0, 0)),
  makeShape(new Transform().translate([0.1, 0, 0])),
  makeShape(new Transform(['t', 0.1, 0, 0])),
  makeShape(new Transform([['t', 0.1, 0, 0]])),
  makeShape(new Transform().translate(0.1, 0).translate(0.1, 0)),

  // Scale
  makeShape(['s', 1.4]),
  makeShape(['s', 1.4, 0.8]),
  makeShape(['s', 1.4, 0.8, 0.3]),
  makeShape([['s', 1.4, 1.4, 1.4]]),
  makeShape(new Transform().scale(0.7)),
  makeShape(new Transform().scale(0.7, 1.4)),
  makeShape(new Transform().scale(0.7, 1.4, 2)),
  makeShape(new Transform(['s', 1.4])),
  makeShape(new Transform([['s', 1.4, 0.7]])),

  // Rotate
  makeShape(['r', Math.PI / 4]),
  makeShape(['r', Math.PI / 4, 0, 1, 0]),
  makeShape([['r', Math.PI / 4, 1, 0, 0]]),
  makeShape(new Transform().rotate(Math.PI / 4)),
  makeShape(new Transform().rotate(Math.PI / 4, 1, 0, 0)),
  makeShape(new Transform().rotate(Math.PI / 2).rotate(Math.PI / 4, [0, 1, 0])),
  makeShape(new Transform([['r', Math.PI / 2], ['r', Math.PI / 4, 0, 1, 0]])),
  makeShape(new Transform(['r', Math.PI / 2])),
  makeShape(new Transform(['r', Math.PI / 2, 1, 0, 0])),

  // Direction
  makeShape(['d', 0, 1, 0]),
  makeShape(['d', 0, 0, 1]),
  makeShape(['d', -1, 0, 0]),
  makeShape([['d', -1, -1, 1]]),
  makeShape(new Transform().direction([0, 0, -1])),
  makeShape(new Transform().direction(1, 0, -1)),
  makeShape(new Transform(['d', -1, 0, 1])),
  makeShape(new Transform([['d', -1, 0, -1]])),
  makeShape(new Transform().direction(0, 1, 0).direction(0, 0, 1)),

  // basis
  // Rotation around z axis
  makeShape(['b', 0, 1, 0, -1, 0, 0, 0, 0, 1]),
  // Flip x
  makeShape([['b', -1, 0, 0, 0, 1, 0, 0, 0, 1]]),
  // Rotation around y axis
  makeShape(new Transform().basis({ x: [0, 0, -1], y: [0, 1, 0] })),
  // Squish x
  makeShape(new Transform().basis({ x: [0.5, 0, 0], z: [0, 0, 1] })),
  // Not orthogonal
  makeShape(['b', 1, 0.5, 0, 0.5, 1, 0, 0.5, 0.5, 1]),
  // Not orthogonal
  makeShape(new Transform().basis({ x: [1, 0.5, 0], y: [0.5, 1, 0], z: [0.5, 0.5, 1] })),
  // rotate around x π/2 then around z π/2
  makeShape(new Transform().basis({ x: [0, 1, 0], y: [1, 0, 0] })),
  // flip y
  makeShape([['b', { y: [0, -1, 0], x: [1, 0, 0] }]]),
  // flip z and y
  makeShape(['b', { y: [0, -1, 0], x: [1, 0, 0], z: [0, 0, 1] }]),

  // basis to basis
  // Rotate π/2 around z
  makeShape(['bb', 0, 1, 0, -1, 0, 0, 0, 0, 1, -1, 0, 0, 0, -1, 0, 0, 0, 1]),
  makeShape([['bb', 0, 1, 0, -1, 0, 0, 0, 0, 1, -1, 0, 0, 0, -1, 0, 0, 0, 1]]),
  makeShape([['bb', { x: [0, 1, 0], y: [-1, 0, 0], z: [0, 0, 1] }, { x: [-1, 0, 0], y: [0, -1, 0], z: [0, 0, 1] }]]),
  makeShape([['bb', { x: [0, 1, 0], y: [-1, 0, 0] }, { x: [-1, 0, 0], y: [0, -1, 0] }]]),
  makeShape(new Transform().basisToBasis(
    { x: [0, 1, 0], y: [-1, 0, 0] }, { x: [-1, 0, 0], y: [0, -1, 0] },
  )),
  makeShape(new Transform().basisToBasis(
    { x: [0, 1, 0], y: [-1, 0, 0] }, { x: [-1, 0, 0], y: [0, -1, 0], z: [0, 0, -1] },
  )),

];
figure.add(shapes);
