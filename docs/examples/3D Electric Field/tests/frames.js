/* global __duration __frames __timeStep __title __width __height */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

__title = 'Example - 3D Electric field';
__duration = 50;
__timeStep = 1;
__width = 300;
__height = 300;
__frames = [
  [0],
  [1, 'touchDown', [0.7, 0.3], 'touch charge'],
  [0.5, 'touchMove', [1, 0.5], 'move charge'],
  [0.5, 'touchMove', [1.3, 0.8], 'move charge'],
  [0.5, 'touchMove', [1.3, 0.8], 'move charge'],
  [0, 'touchUp'],

  [1, 'touchDown', [0, 0], 'rotate scene'],
  [0.5, 'touchMove', [0, 0.1], 'elevation'],
  [0.5, 'touchMove', [0, 0.2], 'elevation'],
  [0.5, 'touchMove', [0.1, 0.2], 'azimuth'],
  [0.5, 'touchMove', [0.2, 0.2], 'azimuth'],
  [0, 'touchUp'],

  [1, 'touchDown', [-2.3, 2.5], 'reset'],
  [0, 'touchUp'],

  [1, 'touchDown', [-2.3, -2.5], 'touch y'],
  [0, 'touchUp'],

  [0],
  [1, 'touchDown', [-0.7, -0.3], 'touch charge'],
  [0.5, 'touchMove', [-1, -0.5], 'move charge'],
  [0.5, 'touchMove', [-1.3, -0.8], 'move charge'],
  [0.5, 'touchMove', [-1.3, -0.8], 'move charge'],
  [0, 'touchUp'],

  [1, 'touchDown', [-2.6, -2.5], 'touch x'],
  [0, 'touchUp'],

  [1, 'touchDown', [-1.3, -0.8], 'touch charge'],
  [0.5, 'touchMove', [-1, -0.5], 'move charge'],
  [0.5, 'touchMove', [-0.7, -0.2], 'move charge'],
  [0.5, 'touchMove', [-0.7, -0.2], 'move charge'],
  [0, 'touchUp'],

  [1, 'touchDown', [-2, -2.5], 'touch z'],
  [0, 'touchUp'],

  [1, 'touchDown', [0, -2.5], 'touch slider'],
  [0.5, 'touchMove', [-0.1, -2.5], 'move slider'],
  [0.5, 'touchMove', [-0.2, -2.5], 'move slider'],
  [0.5, 'touchMove', [-0.3, -2.5], 'move slider'],
  [0.5, 'touchMove', [-0.4, -2.5], 'move slider'],
  [0, 'touchUp'],

  [1, 'touchDown', [1.7, -2.5], 'touch axes'],
  [0, 'touchUp'],

  [1, 'touchDown', [2.5, -2.5], 'touch scale'],
  [0, 'touchUp'],

  [1, 'touchDown', [1.7, -2.5], 'touch axes off'],
  [0, 'touchUp'],

  [1, 'touchDown', [2.5, -2.5], 'touch scale off'],
  [0, 'touchUp'],

  [1, 'touchDown', [1.1, 2.5], 'touch 3'],
  [0, 'touchUp'],

  [5, 'touchDown', [1.5, 2.5], 'touch 4'],
  [0, 'touchUp'],

  [5, 'touchDown', [1.9, 2.5], 'touch 5'],
  [0, 'touchUp'],

  [3, 'touchDown', [2.3, 2.5], 'touch 6'],
  [0, 'touchUp'],

  [5, 'touchDown', [2.7, 2.5], 'touch 7'],
  [0, 'touchUp'],

  [5, 'touchDown', [0.3, 2.5], 'touch 1'],
  [0, 'touchUp'],

  [5, 'touchDown', [0.7, 2.5], 'touch 2'],
  [0, 'touchUp'],
];
