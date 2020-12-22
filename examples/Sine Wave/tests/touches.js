/* global __duration __touches __timeStep __title*/
__title = 'Example - Sine Wave';
__duration = 10;
__timeStep = 0.25;
__touches = [
  [1, 'touchDown', [-0.7, 0.3], 'touch arm'],
  [1.5, 'touchMove', [-0.8, 0.4], 'move arm'],
  [2, 'touchMove', [-0.9, 0.4], 'mave arm 2'],
  [2.1, 'touchMove', [-0.9, 0.4], 'stop arm move'],
  [2.1, 'touchUp'],
  [3, 'touchDown', [-1, -1.2], 'touch slow'],
  [6, 'touchDown', [0, -1.2], 'touch fast'],
  [9, 'touchDown', [1, -1.2], 'touch stop'],

  // [1.5, 'touchDown', [0.5, 0], 'Touch Down Rot Arm'],
  // [2, 'touchMove', [0.5, 0.1], 'Move Rot Arm 1'],
  // [2.5, 'touchMove', [0.4, 0.2], 'Move Rot Arm 2'],
  // [2.6, 'touchMove', [0.4, 0.2], 'End Rot'],
  // [2.6, 'touchUp'],

  // [3, 'touchDown', [0, 0], 'Touch Down Move Pad'],
  // [3.5, 'touchMove', [0.1, 0.1], 'Translate 1'],
  // [4, 'touchMove', [0.2, 0.2], 'Translate 2'],
  // [4.1, 'touchMove', [0.2, 0.2], 'End Translate'],
  // [4.1, 'touchUp'],
];
