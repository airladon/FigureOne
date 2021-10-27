/* global __duration __frames __timeStep __title __width __height __startSteps */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

__title = 'Example - Solar System';
__duration = 6;
__timeStep = 1;
__width = 600;
__height = 300;
__startSteps = 1000;
__frames = [
  [0, `
plot.__gesture.move.freely = false;
`],
  [0.5, 'mouseWheelZoom', [[0, 500], [-2.55, 0]], 'zoomIn'],
  [0.5, 'mouseWheelZoom', [[0, 500], [-2.55, 0]], 'zoomIn'],
  [0.5, 'mousePan', [[0, 0], [-0.3, 0]], 'pan'],
  [0.5, 'mousePan', [[0, 0], [0.3, 0]], 'pan'],
  [0.5, 'mouseWheelZoom', [[0, 50000], [-2.55, 0]], 'zoomIn'],
  [0.5, 'mouseClick', [[2.5, 1.2]], 'Click Scale Toggle'],
  [0.5, 'mouseClick', [[-2.4, -1.1]], 'Click Earth'],
  [0.5, 'mouseWheelZoom', [[0, 10000], [0, 0]], 'zoomIn'],
  [0.5, 'mouseWheelZoom', [[0, -100000], [0, 0]], 'zoomIn'],
  [0.5, 'mouseClick', [[2.5, 1.2]], 'Click Scale Toggle'],
];
