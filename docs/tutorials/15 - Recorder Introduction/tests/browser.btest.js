/* eslint no-unused-vars: ["error", { "vars": "local" }] */
/* eslint-disable no-global-assign */
/* globals __width, __height, __title */

const { tester } = require('../../../../src/tests/ividTester/tester.js');

__width = 500;
__height = 600;
__title = 'Tutorial 15';

tester(
  `http://localhost:8080/${__dirname}/example.html`,
  __dirname,
  1,
  [0, 5, 12],
);
