/* global __duration __touches __timeStep __title*/
__title = 'Example - Interactive Angle';
__duration = 4;
__timeStep = 0.5;
__touches = [
  [0.1, 'touchDown', [-0.5, 0.5], 'Touch Down Angle Arm'],
  [0.5, 'touchMove', [-0.6, 0.4], 'Move Angle Arm 1'],
  [1, 'touchMove', [-0.7, 0.3], 'Move Angle Arm 2'],
  [1.1, 'touchMove', [-0.7, 0.3], 'End Angle'],
  [1.1, 'touchUp'],

  [1.5, 'touchDown', [0.5, 0], 'Touch Down Rot Arm'],
  [2, 'touchMove', [0.5, 0.1], 'Move Rot Arm 1'],
  [2.5, 'touchMove', [0.4, 0.2], 'Move Rot Arm 2'],
  [2.6, 'touchMove', [0.4, 0.2], 'End Rot'],
  [2.6, 'touchUp'],

  [3, 'touchDown', [0, 0], 'Touch Down Move Pad'],
  [3.5, 'touchMove', [0.1, 0.1], 'Translate 1'],
  [4, 'touchMove', [0.2, 0.2], 'Translate 2'],
  [4.1, 'touchMove', [0.2, 0.2], 'End Translate'],
  [4.1, 'touchUp'],
];
