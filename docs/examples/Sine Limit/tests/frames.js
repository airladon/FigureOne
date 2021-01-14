/* global __duration __frames __timeStep __title*/
__title = 'Example - Sin Limit';
__duration = 32;
__timeStep = 0.5;
__frames = [
  [0.1, 'touchDown', [-0.4, 0.5], 'touch radius'],
  [0.5, 'touchMove', [-0.5, 0.6], 'move radius'],
  [0.5, 'touchMove', [-0.4, 0.5], 'move radius'],
  [0.5, 'touchMove', [-0.2, 0.2], 'move radius'],
  [0.5, 'touchMove', [0.1, -0.2], 'move radius'],
  [0.5, 'touchMove', [-0.2, 0.2], 'move radius'],
  [0.5, 'touchMove', [-0.4, 0.5], 'move radius'],
  [0, 'touchMove', [-0.4, 0.5], 'move radius'],
  [0, 'touchUp'],
  [0.5, 'touchDown', [0.2, -1.2], 'touch line'],
  [1, 'touchDown', [-0.7, -1.4], 'touch arc'],
  [1, 'touchDown', [-0.4, -1.4], 'touch vertical'],

  [1, 'touchDown', [1.5, -1.2], 'next'],
  [0.5, 'touchDown', [-0.4, -1.2], 'touch angle'],
  [1, 'touchDown', [0.6, -1.2], 'touch arc'],
  [1, 'touchDown', [-0.6, -1.4], 'touch vertical'],

  [1, 'touchDown', [1.5, -1.2], 'next - eqn'],
  [0.5, 'touchDown', [1.5, -1.2], 'next - divide both sides'],
  [0.5, 'touchDown', [1.5, -1.2], 'next - eqn'],
  [1.5, 'touchDown', [1.5, -1.2], 'next - the right hand side'],
  [1, 'touchDown', [1.5, -1.2], 'next - eqn'],

  [1.5, 'touchDown', [1.5, -1.2], 'next - use math notation'],
  [0.5, 'touchDown', [0.7, -1.2], 'touch limit'],

  [1, 'touchDown', [1.5, -1.2], 'next - eqn - goto limit'],
  [2, 'touchDown', [0.7, -1.2], 'touch limit'],

  [1, 'touchDown', [1.5, -1.2], 'next - the vertical line'],
  [1, 'touchDown', [-0.3, -1.2], 'touch vertical'],
  [1, 'touchDown', [0.7, -1.2], 'touch x'],

  [1, 'touchDown', [1.5, -1.2], 'next - eqn - sinx'],
  [1, 'touchDown', [1.5, -1.2], 'next - the radius is 1'],
  [1, 'touchDown', [-0.7, -1.2], 'touch radius'],
  [1, 'touchDown', [0.2, -1.2], 'touch arc'],
  [1, 'touchDown', [-0.7, -1.4], 'touch angle'],

  [1, 'touchDown', [1.5, -1.2], 'next - eqn - x'],
  [1, 'touchDown', [1.5, -1.2], 'next - summary'],
  [1, 'touchDown', [0.5, -1.2], 'touch x'],
  [1, 'touchDown', [-0.7, -1.4], 'touch sinx'],

  [1, 'touchDown', [-1.5, -1.2], 'prev'],
];
