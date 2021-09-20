const { Figure, round } = Fig;
const figure = new Figure({ scene: { style: 'orthographic' } });

// Top grid
figure.add({
  name: 'topGrid',
  make: 'grid',
  step: 0.2,
  transform: ['r', Math.PI / 2, 1, 0, 0],
  width: 0.005,
  color: [1, 0.4, 0.4, 1],
  bounds: [-1.1, -1.1, 2.2, 2.2],
});

// Bottom grid
figure.add({
  make: 'grid',
  step: 0.2,
  transform: [['r', Math.PI / 2, 1, 0, 0], ['t', 0, -0.7, 0]],
  width: 0.005,
  color: [0.5, 0.5, 0.5, 1],
  bounds: [-1.1, -1.1, 2.2, 2.2],
});

const shaddow = figure.add({
  make: 'rectangle',
  width: 0.2,
  height: 0.2,
  color: [0, 0, 0, 0.5],
  transform: [['r', Math.PI / 2, 1, 0, 0], ['t', 0, -0.7, 0]],
});

const cube = figure.add({
  make: 'cube',
  side: 0.2,
  position: [0, 0.1, 0],
  color: [1, 0, 0, 1],
  move: {
    plane: [[0, 0.1, 0], [0, 1, 0]],
    bounds: {
      left: -1, right: 1, bottom: -1, top: 1, position: [0, 0.1, 0], normal: [0, 1, 0],
    },
  },
});

// When the cube is moved, update the shaddow, but quantize it so it
// never between grids
cube.notifications.add('setTransform', (t) => {
  const p = t[0].t();
  shaddow.setPosition([
    round(p.x * 5, 0) / 5, -0.7, round(p.z * 5, 0) / 5,
  ]);
});
