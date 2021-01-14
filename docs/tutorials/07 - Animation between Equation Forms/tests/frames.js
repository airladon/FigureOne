/* global __duration __frames __timeStep __title */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

__title = 'Tutorial - Animation Between Equation Forms';
__duration = 3;
__timeStep = 0.5;
__frames = [
  [0, `
    figure.getElement('eqn.a').animations.setTimeDelta(null)
    figure.getElement('eqn.v').animations.setTimeDelta(null)
    figure.getElement('eqn.b').animations.setTimeDelta(null)
    figure.getElement('eqn.c').animations.setTimeDelta(null)
  `],
];
