/* global __duration __frames __timeStep __title */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

__title = 'Example - Interactive Angle';
__duration = 4;
__timeStep = 0.5;
__frames = [
  [0],
  [0.5, 'touchDown', [-0.5, 0.5], 'Touch Down Angle Arm'],
  [0.5, 'touchMove', [-0.6, 0.4], 'Move Angle Arm 1'],
  [0.5, 'touchMove', [-0.7, 0.3], 'Move Angle Arm 2'],
  [0, 'touchMove', [-0.7, 0.3], 'End Angle'],
  [0, 'touchUp'],

  [0.5, 'touchDown', [0.5, 0], 'Touch Down Rot Arm'],
  [0.5, 'touchMove', [0.5, 0.1], 'Move Rot Arm 1'],
  [0.5, 'touchMove', [0.4, 0.2], 'Move Rot Arm 2'],
  [0, 'touchMove', [0.4, 0.2], 'End Rot'],
  [0, 'touchUp'],

  [0.5, 'touchDown', [0, 0], 'Touch Down Move Pad'],
  [0.5, 'touchMove', [0.1, 0.1], 'Translate 1'],
  [0.5, 'touchMove', [0.2, 0.2], 'Translate 2'],
  [0, 'touchMove', [0.2, 0.2], 'End Translate'],
  [0, 'touchUp'],
];
