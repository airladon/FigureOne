/* global __duration __frames __timeStep __title, __width, __height */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

__title = 'Tutorial - 19 - Performance Optimization - 05 custom setupdraw';
__duration = 4;
__timeStep = 1;
__width = 500;
__height = 500;
__frames = [
  [0, `
    const elements = figure.elements.getAllElements();
    for (let i = 0; i < elements.length; i += 1) {
      const element = elements[i];
      if (element.name.startsWith('primitive')) {
        element.setPosition(rand(-2.8, 2.8), rand(-2.8, 2.8));
        element.state.movement.velocity = Fig.getTransform([['t', rand(-0.3, 0.3), rand(-0.3, 0.3)]]);
        element.state.movement.previousTime = null;
      }
    }
    figure.elements.__frameRate_.hide();
  `],
];

