/* global __duration __frames __timeStep __title, __width, __height */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

__title = 'Tutorial - Surface';
__width = 500;
__height = 500;
__duration = 1.6;
__timeStep = 0.2;
__frames = [
  [0.2, 'touchDown', [0, 0], 'touch down'],
  [0.2, 'touchMove', [0.1, 0], 'move right'],
  [0.2, 'touchMove', [0.2, 0], 'move right'],
  [0.2, 'touchMove', [0.2, 0.1], 'move up'],
  [0.2, 'touchMove', [0.2, 0.2], 'move up'],
  [0.2, 'touchMove', [0.1, 0.2], 'move up'],
  [0.2, 'touchMove', [0, 0.2], 'move up'],
  [0, 'touchUp', [0, 0.2], 'release'],
];
