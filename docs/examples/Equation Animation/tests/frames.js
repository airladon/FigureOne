/* global __duration __frames __timeStep __title */
/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */

__title = 'Example - Equation Aniamtion';
__duration = 19;
__timeStep = 0.5;
__frames = [
  [0, `
  nextForm = () => {};
  eqn.stop('cancel');
  eqn.showForm('1')
  eqn.animations.new()
    .nextForm({ delay: 1 })
    .nextForm({ delay: 1 })
    .nextForm({ delay: 1 })
    .nextForm({ delay: 1 })
    .nextForm({ delay: 1 })
    .nextForm({ delay: 1 })
    .nextForm({ delay: 1 })
    .start();
`],
];
