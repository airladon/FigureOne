// eslint-disable-next-line no-undef
const { Figure, tools, Scene } = Fig;

const figure = new Figure({
  scene: {
    style: 'orthographic',
    left: -4.5,
    bottom: -4.5,
    right: 4.5,
    top: 4.5,
    near: 0.1,
    far: 20,
    // camera: {
    //   position: [2, 2, 5],
    //   up: [0, 1, 0],
    // },
    light: {
      directional: [1, 0.5, -0.1],
      ambient: 0.4,
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
const makeShape = (make, options, reverseLight) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const name = `_${index}`;
  index += 1;
  let scene;
  if (reverseLight) {
    scene = new Scene({
      style: 'orthographic',
      left: -4.5,
      bottom: -4.5,
      right: 4.5,
      top: 4.5,
      near: 0.1,
      far: 20,
      light: {
        directional: [-1, -0.5, 0.1],
        ambient: 0.4,
        point: [1.85, 4.15, 0.3],
      },
    });
  }
  // console.log(scene)
  return tools.misc.joinObjects({ name, make }, {
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${index}: ${name} - ${x}, ${y}`),
    }),
    scene,
    transform: [
      ['s', 1, 1, 1],
      ['r', Math.PI / 10, 0, 1, 0],
      ['r', Math.PI / 20, 1, 0, 0],
      ['t', x, y, 0],
    ],
  }, options);
};

const makeCube = (options, reverseLight) => makeShape(
  'primitives.cube',
  tools.misc.joinObjects({}, {
    side: 0.3,
    // color: [1, 0, 0, 0.6],
  }, options),
  reverseLight,
);

/* eslint-disable object-curly-newline */
const cubes = [
  // Definitions
  makeCube({}),
  makeCube({ side: 0.4 }),
  makeCube({ center: [0.1, 0.1] }),
  makeCube({ lines: true }),
  makeCube({ light: null }),
  makeCube({ light: 'ambient' }),
  makeCube({ light: 'point' }),
  makeCube({}, true),
];
figure.add(cubes);
