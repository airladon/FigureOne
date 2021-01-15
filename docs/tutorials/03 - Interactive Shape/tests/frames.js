/* global __duration __frames __timeStep __title */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

__title = 'Tutorial - Interactive Shape';
__duration = 3;
__timeStep = 0.2;
__frames = [
  [0.2, 'touchDown', [0, 0], 'touch down'],
  [0.2, 'touchMove', [0.5, 0], 'move right'],
  [0.2, 'touchMove', [0.5, 0.5], 'move up'],
  [0.2, 'touchMove', [0, 0.5], 'move left'],
  [0, 'touchUp', [0.5, 0.5], 'release'],
];
