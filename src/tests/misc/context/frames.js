/* global __frames */
/* eslint-disable no-global-assign */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
__duration = 10;
__timeStep = 1;
__frames = [
  [0],
  [1, 'touchDown', [0, 0]],
  [0.5, 'touchUp'],
  [1, 'figure.loseContext()'],
  [1, 'touchDown', [0, 0]],
  [0.5, 'touchUp'],
  [1, 'figure.restoreContext()'],
  [3, 'touchDown', [0, 0]],
  [0.5, 'touchUp'],
];
