/* global __duration __frames __timeStep __title */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

__title = 'Tutorial - Collections';
__duration = 5;
__timeStep = 0.5;
__frames = [
  [0, `
    figure.getElement('c').animations.animations[0].startTime = null;
    figure.getElement('c').animations.animations[0].steps[0].startTime = null;
  `],
];
