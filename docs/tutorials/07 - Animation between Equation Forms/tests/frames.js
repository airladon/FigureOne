/* global __duration __frames __timeStep __title, __width, __height */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

__title = 'Tutorial - Animation Between Equation Forms';
__width = 500;
__height = 500;
__duration = 3.5;
__timeStep = 0.5;
__frames = [
  [0, `
    eqn._a.animations.setTimeDelta(null)
    eqn._v.animations.setTimeDelta(null)
    eqn._b.animations.setTimeDelta(null)
    eqn._c.animations.setTimeDelta(null)
    eqn._times.animations.setTimeDelta(null)
  `],
];
