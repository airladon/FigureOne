/* global page figure */
/* eslint-disable jest/no-export, no-await-in-loop */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { steps, title } = require('./steps.js');
const { exampleTester } = require('../../../src/tests/exampleTester.js')

exampleTester(title, `file:/${__dirname}/example.html`, steps);
