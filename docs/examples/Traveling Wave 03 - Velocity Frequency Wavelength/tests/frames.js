/* eslint-disable no-global-assign, no-unused-vars */
/* global __duration __frames __timeStep __title __width __height */
__title = 'Example - Velocity Frequency Wavelength';
// __duration = 54;
__timeStep = 0.5;

// __frames = [[0,
// `
// layout.time.setGetNow(() => new Fig.GlobalAnimation().now() / 1000);
// layout.reset();
// const medium = figure.getElement('medium');
// layout.unpause();
// medium.custom.recording.reset((timeStep, num) => {
//   const y = Array(num);
//   for (let i = 0; i < num; i += 1) {
//     y[i] = 0.6 * 0.8 * Math.sin(2 * Math.PI * 0.2 * (timeStep * i) + Math.PI);
//   }
//   return y.reverse();
// });
// `]];
// for (let i = 0; i < 70 + 34; i += 1) {
//   __frames.push([0.5, 'touchDown', [2.75, 1.5], 'Next']);
//   __frames.push([0.1, 'touchUp']);
// }
const s = 0.5;
const s1 = 1;
const s15 = 1.5;
const s3 = 3;
__frames = {
  start: 29,
  stop: null,
  nav: 'nav',
  next: 'nav.nextButton',
  slides: [
    // 0
    [
      [0,
        `
layout.time.setGetNow(() => new Fig.GlobalAnimation().now() / 1000);
layout.reset();
const medium = figure.getElement('medium');
layout.unpause();
medium.custom.recording.reset((timeStep, num) => {
  const y = Array(num);
  for (let i = 0; i < num; i += 1) {
    y[i] = 0.6 * 0.8 * Math.sin(2 * Math.PI * 0.2 * (timeStep * i) + Math.PI);
  }
  return y.reverse();
});
`,
      ],
    ],
    [
      [s1, 'tap', [1.3, 2.8], 'touch medium'],
      [s1, 'tap', [-1.3, 2.6], 'touch arc'],
      [s1, 'tap', [-1.3, 2.35], 'touch vertical'],
    ],
    [
      [s15],
      [s15, 'tap', [-1.5, 2.6], 'touch disturbance'],
    ],
    [
      [s15, 'tap', [-1.5, 2.7], 'touch disturbance'],
    ],
    [],
    // 5
    [],
    [
      [s15, 'tap', [-0.5, 2.8], 'touch disturbance'],
    ],
    [],
    [
      [s15],
      [0.5, 'touchDown', [0, 1.7], 'touch particle'],
      [0.5, 'touchMove', [0, 1.9], 'move particle up'],
      [0.5, 'touchMove', [0, 1.7], 'move particle down'],
      [0.5, 'touchUp'],
    ],
    [
      [s1, 'tap', [1.5, 2.7], 'touch first particle'],
    ],
    // 10
    [
      [s15],
      [0.5, 'touchDown', [0, 1.7], 'touch particle'],
      [0.5, 'touchMove', [0, 1.9], 'move particle up'],
      [0.5, 'touchMove', [0, 1.7], 'move particle down'],
      [0.5, 'touchUp'],
    ],
    [
      [s15],
      [s15, 'tap', [-1.5, 2.7], 'touch disturbance'],
      [s1, 'tap', [0.5, 2.7], 'touch particle'],
      [s1, 'tap', [1.5, 2.7], 'touch fast'],
      [s1, 'tap', [-2.2, 2.55], 'touch slow'],
      [s15, 'tap', [0, 2.55], 'touch slowing'],
      [s1, 'tap', [0.7, 2.55], 'touch freezing'],
      [s1, 'tap', [-1.5, 0.2], 'touch freezing button'],
      [s15, 'tap', [-0.5, 0.2], 'touch slow motion button'],
    ],
    [
      [s15],
      [s3, 'tap', [-1.5, 2.7], 'touch freeze'],
      [s1, 'tap', [0, 2.7], 'touch initial disturbance'],
      [s1, 'tap', [-1.5, 2.55], 'touch source'],
      [s1, 'tap', [0.2, 2.55], 'touch faster'],
      [0.5, 'touchDown', [0, 1.7], 'touch particle'],
      [0.5, 'touchMove', [0, 1.9], 'move particle up'],
      [0.5, 'touchMove', [0, 1.7], 'move particle down'],
      [0.5, 'touchUp'],
      [s1, 'tap', [-1, 2.35], 'touch slow motion text'],
      [s3, 'tap', [0, 2.7], 'touch initial disturbance'],
      [s1],
    ],
    [
      [s15],
      [s15, 'tap', [-1, 2.7], 'touch disturbance'],
      [s1, 'tap', [-2.2, 2.6], 'touch faster'],
    ],
    [
      [s15],
      [s15, 'tap', [0.5, 2.7], 'touch disturbance'],
      [s1, 'tap', [2, 2.7], 'touch position'],
      [0.5, 'touchDown', [-2, 0.9], 'touch particle'],
      [0.5, 'touchMove', [-2, 1.1], 'move particle up'],
      [0.5, 'touchMove', [-2, 0.9], 'move particle down'],
      [0.5, 'touchUp'],
    ],
    // 15
    [
      [s15, 'tap', [-1.5, 2.7], 'touch disturbance'],
      [s1, 'tap', [-1.2, 2.55], 'touch x1'],
    ],
    [
      [s1, 'tap', [0.25, 2.1], 'touch eqn x1'],
    ],
    [
      [s1, 'tap', [2.3, 0.55], 'touch side eqn x1'],
    ],
    [
      [s15, 'tap', [0, 2.7], 'touch disturbance'],
      [s1, 'tap', [1.9, 2.7], 'touch x0'],
    ],
    [
      [s1, 'tap', [-0.4, 1.9], 'touch x0 eqn'],
      [s1, 'tap', [0.2, 1.9], 'touch fx0 eqn'],
    ],
    // 20
    [
      [s15, 'tap', [-1.5, 2.7], 'touch disturbance'],
      [s1, 'tap', [-0.7, 2.7], 'touch x1'],
      [s1, 'tap', [0.8, 2.7], 'touch x0'],
      [s1, 'tap', [-0.4, 1.9], 'touch x0 eqn'],
      [s1, 'tap', [0.2, 1.9], 'touch fx0 eqn'],
    ],
    [
      [s1, 'tap', [-0.4, 2.3], 'touch x0 eqn'],
      [s1, 'tap', [0.2, 2.3], 'touch fx0 eqn'],
      [s1, 'tap', [-0.4, 1.9], 'touch x1 eqn'],
      [s1, 'tap', [0.2, 1.9], 'touch fx0 eqn'],
    ],
    [],
    [
      [s1, 'tap', [0, 2.7], 'touch (1)'],
    ],
    [
      [s1, 'tap', [0, 2.7], 'touch (1)'],
      [s1, 'tap', [0.65, 2.4], 'touch x1 sub'],
    ],
    // 25
    [
      [s1, 'tap', [-0.4, 1.9], 'touch x1 eqn'],
      [s1, 'tap', [0.2, 1.9], 'touch fx0 eqn'],
      [s1, 'tap', [0.7, 2.1], 'touch x1 right eqn'],
    ],
    [
      [s1, 'tap', [-2.35, 2.7], 'touch x1'],
    ],
    [],
    [
      [s1, 'tap', [0.6, 2.7], 'touch f'],
      [s1, 'tap', [0.85, 2.7], 'touch x0'],
      [s1, 'tap', [-2, 2.55], 'touch function'],
      [s1, 'tap', [1, 2.55], 'touch space'],
      [s1, 'tap', [1.9, 2.55], 'touch time'],
      [s1, 'tap', [0.2, 1.9], 'touch fx0 eqn'],
      [0.5, 'touchDown', [-2, 0.9], 'touch particle'],
      [0.5, 'touchMove', [-2, 1.1], 'move particle up'],
      [0.5, 'touchMove', [-2, 0.9], 'move particle down'],
      [0.5, 'touchUp'],
    ],
    [
      [s1, 'tap', [0, 2.7], 'touch initial disturbance'],
      [s1, 'tap', [0.2, 1.9], 'touch fx0 eqn'],
      [0.5, 'touchDown', [-2, 0.9], 'touch particle'],
      [0.5, 'touchMove', [-2, 1.1], 'move particle up'],
      [0.5, 'touchMove', [-2, 0.9], 'move particle down'],
      [0.5, 'touchUp'],
    ],
    [
      [s1, 'tap', [0.2, 2.3], 'touch fx0 eqn top'],
      [s1, 'tap', [-0.4, 1.8], 'touch fx0 eqn bottom'],
    ],
    [
      [s1, 'tap', [0.2, 2.3], 'touch fx0 eqn top'],
      [s1, 'tap', [-0.4, 1.8], 'touch fx0 eqn bottom'],
      [s1, 'tap', [-0.8, 2.7], 'touch any'],
      [s1, 'tap', [-1.4, 2.55], 'touch delay'],
    ],
  ],
  jest: [
    [0.5, 'touchDown', [-0.4, 0.5], 'touch radius'],
    [1, 'touchUp'],
  ],
};
