/* global __duration __frames __timeStep __title*/
__title = 'Example - Sin Limit';
__duration = -1;
__timeStep = 0.2;
const s = 0.2;
const s1 = 1;
const s15 = 1.5;
const s2 = 2;
__frames = [
  [s, 'touchDown', [-0.4, 0.5], 'touch radius'],
  [s, 'touchMove', [-0.5, 0.6], 'move radius'],
  [s, 'touchMove', [-0.4, 0.5], 'move radius'],
  [s, 'touchMove', [-0.2, 0.2], 'move radius'],
  [s, 'touchMove', [0.1, -0.2], 'move radius'],
  [s, 'touchMove', [-0.2, 0.2], 'move radius'],
  [s, 'touchMove', [-0.4, 0.5], 'move radius'],
  [0, 'touchMove', [-0.4, 0.5], 'move radius'],
  [0, 'touchUp'],
  [s, 'touchDown', [0.2, -1.2], 'touch line'],
  [s, 'touchUp'],
  [s1, 'touchDown', [-0.7, -1.4], 'touch arc'],
  [s, 'touchUp'],
  [s1, 'touchDown', [-0.4, -1.4], 'touch vertical'],
  [s, 'touchUp'],

  [s1, 'touchDown', [1.5, -1.2], 'next'],
  [s, 'touchUp'],
  [s, 'touchDown', [-0.4, -1.2], 'touch angle'],
  [s, 'touchUp'],
  [s1, 'touchDown', [0.6, -1.2], 'touch arc'],
  [s, 'touchUp'],
  [s1, 'touchDown', [-0.6, -1.4], 'touch vertical'],
  [s, 'touchUp'],

  [s1, 'touchDown', [1.5, -1.2], 'next - eqn'],
  [s, 'touchUp'],
  [s, 'touchDown', [1.5, -1.2], 'next - divide both sides'],
  [s, 'touchUp'],
  [s, 'touchDown', [1.5, -1.2], 'next - eqn'],
  [s, 'touchUp'],
  [s15, 'touchDown', [1.5, -1.2], 'next - the right hand side'],
  [s, 'touchUp'],
  [s1, 'touchDown', [1.5, -1.2], 'next - eqn'],
  [s, 'touchUp'],

  [s15, 'touchDown', [1.5, -1.2], 'next - use math notation'],
  [s, 'touchUp'],
  [s, 'touchDown', [0.7, -1.2], 'touch limit'],
  [s, 'touchUp'],

  [s1, 'touchDown', [1.5, -1.2], 'next - eqn - goto limit'],
  [s, 'touchUp'],
  [s2, 'touchDown', [0.7, -1.2], 'touch limit'],
  [s, 'touchUp'],

  [s1, 'touchDown', [1.5, -1.2], 'next - the vertical line'],
  [s, 'touchUp'],
  [s1, 'touchDown', [-0.3, -1.2], 'touch vertical'],
  [s, 'touchUp'],
  [s1, 'touchDown', [0.7, -1.2], 'touch x'],
  [s, 'touchUp'],

  [s1, 'touchDown', [1.5, -1.2], 'next - eqn - sinx'],
  [s, 'touchUp'],
  [s1, 'touchDown', [1.5, -1.2], 'next - the radius is 1'],
  [s, 'touchUp'],
  [s1, 'touchDown', [-0.7, -1.2], 'touch radius'],
  [s, 'touchUp'],
  [s1, 'touchDown', [0.2, -1.2], 'touch arc'],
  [s, 'touchUp'],
  [s1, 'touchDown', [-0.7, -1.4], 'touch angle'],
  [s, 'touchUp'],

  [s1, 'touchDown', [1.5, -1.2], 'next - eqn - x'],
  [s, 'touchUp'],
  [s1, 'touchDown', [1.5, -1.2], 'next - summary'],
  [s, 'touchUp'],
  [s1, 'touchDown', [0.5, -1.2], 'touch x'],
  [s, 'touchUp'],
  [s1, 'touchDown', [-0.7, -1.4], 'touch sinx'],
  [s, 'touchUp'],

  [s1, 'touchDown', [-1.5, -1.2], 'prev'],
  [s, 'touchUp'],
];
