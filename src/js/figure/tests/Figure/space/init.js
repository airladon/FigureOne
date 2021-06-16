/* globals Fig */
const figure = new Fig.Figure();

figure.add([
  {
    name: 'xNeg',
    make: 'line',
    p1: [-1, 0, 0],
    p2: [0, 0, 0],
    width: 0.1,
    color: [0.5, 0, 0, 1],
    transform: [['r', Math.PI / 2, 0, 0]],
  },
  {
    name: 'xPos',
    make: 'line',
    p1: [0, 0, 0],
    p2: [1, 0, 0],
    width: 0.1,
    color: [1, 0, 0, 1],
    transform: [['r', Math.PI / 2, 0, 0]],
  },
  {
    name: 'yNeg',
    make: 'line',
    p1: [0, -1, 0],
    p2: [0, 0, 0],
    width: 0.1,
    color: [0, 0.5, 0, 1],
    transform: [['r', 0, Math.PI / 2, 0]],
  },
  {
    name: 'yPos',
    make: 'line',
    p1: [0, 0, 0],
    p2: [0, 1, 0],
    width: 0.1,
    color: [0, 1, 0, 1],
    transform: [['r', 0, Math.PI / 2, 0]],
  },
  {
    name: 'zNeg',
    make: 'line',
    p1: [-1, 0, 0],
    p2: [0, 0, 0],
    width: 0.1,
    color: [0, 0, 1, 1],
    transform: [['r', Math.PI / 2, -Math.PI / 2, 0]],
  },
  {
    name: 'zPos',
    make: 'line',
    p1: [0, 0, 0],
    p2: [1, 0, 0],
    width: 0.1,
    color: [0.3, 0.3, 1, 1],
    transform: [['r', Math.PI / 2, -Math.PI / 2, 0]],
  },
]);
