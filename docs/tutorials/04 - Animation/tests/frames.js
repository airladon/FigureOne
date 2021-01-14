/* global __duration __frames __timeStep __title */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

__title = 'Tutorial - Animation';
__duration = 12;
__timeStep = 0.5;
__frames = [
  [0, `
    figure.getElement('hexagon').animations.animations[0].startTime = null;
    figure.getElement('hexagon').animations.animations[0].steps[0].startTime = null;
  `],
];
