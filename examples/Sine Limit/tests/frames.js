/* global __duration __frames __timeStep __title*/
__title = 'Example - Sin Limit';
__duration = 34;
__timeStep = 0.5;
__frames = [
  [0.1, 'touchDown', [-0.4, 0.5], 'touch radius'],
  [0.5, 'touchMove', [-0.5, 0.6], 'move radius'],
  [1, 'touchMove', [-0.4, 0.5], 'move radius'],
  [1.5, 'touchMove', [-0.2, 0.2], 'move radius'],
  [2, 'touchMove', [0.1, -0.2], 'move radius'],
  [2.5, 'touchMove', [-0.2, 0.2], 'move radius'],
  [3, 'touchMove', [-0.4, 0.5], 'move radius'],
  [3.1, 'touchMove', [-0.4, 0.5], 'move radius'],
  [3.1, 'touchUp'],
  [3.5, 'touchDown', [0.2, -1.1], 'touch line'],
  [4.5, 'touchDown', [-0.7, -1.3], 'touch arc'],
  [5.5, 'touchDown', [-0.4, -1.3], 'touch vertical'],

  [6.5, 'touchDown', [1.5, -1.2], 'next'],
  [7.5, 'touchDown', [-0.4, -1.1], 'touch angle'],
  [8.5, 'touchDown', [0.6, -1.1], 'touch arc'],
  [9.5, 'touchDown', [-0.6, -1.3], 'touch vertical'],

  [10.5, 'touchDown', [1.5, -1.2], 'next - eqn'],
  [11.5, 'touchDown', [1.5, -1.2], 'next - divide both sides'],
  [12.5, 'touchDown', [1.5, -1.2], 'next - eqn'],
  [13.5, 'touchDown', [1.5, -1.2], 'next - the right hand side'],
  [14.5, 'touchDown', [1.5, -1.2], 'next - eqn'],

  [16, 'touchDown', [1.5, -1.2], 'next - use math notation'],
  [17, 'touchDown', [0.7, -1.3], 'touch limit'],

  [18, 'touchDown', [1.5, -1.2], 'next - eqn - goto limit'],
  [20, 'touchDown', [0.7, -1.3], 'touch limit'],

  [21, 'touchDown', [1.5, -1.2], 'next - the vertical line'],
  [22, 'touchDown', [-0.3, -1.3], 'touch vertical'],
  [23, 'touchDown', [0.7, -1.3], 'touch x'],

  [24, 'touchDown', [1.5, -1.2], 'next - eqn - sinx'],
  [25, 'touchDown', [1.5, -1.2], 'next - the radius is 1'],
  [26, 'touchDown', [-0.7, -1.1], 'touch radius'],
  [27, 'touchDown', [0.2, -1.1], 'touch arc'],
  [28, 'touchDown', [-0.7, -1.3], 'touch angle'],

  [29, 'touchDown', [1.5, -1.2], 'next - eqn - x'],
  [30, 'touchDown', [1.5, -1.2], 'next - summary'],
  [31, 'touchDown', [0.5, -1.1], 'touch x'],
  [32, 'touchDown', [-0.7, -1.3], 'touch sinx'],

  [33, 'touchDown', [-1.5, -1.2], 'prev'],
];
