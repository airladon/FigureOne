/* global __duration __frames __timeStep __title __width __height __startSteps */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

__title = 'Example - Mandelbrot';
__duration = 6;
__timeStep = 1;
__width = 300;
__height = 300;
__startSteps = 10000;
__frames = [
  [0, `
figure.elements._primitive_000000003.move.freely = false;
`],
  [1, 'mousePan', [[0, 0], [0.3, 0.3]], 'pan'],
  [0.5, 'mouseWheelZoom', [[0, 500], [0, 0]], 'zoomIn'],
  [0.5, 'mouseWheelZoom', [[0, 500], [0, 0]], 'zoomIn'],
  [1, 'mousePan', [[-0.8, -0.9], [-0.8, -0.9]], 'iterations'],
  [0.5, 'mouseWheelZoom', [[0, -500], [-0.5, -0.5]], 'zoomOut'],
  [0.5, 'mouseWheelZoom', [[0, -500], [-0.5, -0.5]], 'zoomOut'],
  [0.5, 'mouseWheelZoom', [[-100, 0], [-0.5, -0.5]], 'panLeft should do nothing'],
];
