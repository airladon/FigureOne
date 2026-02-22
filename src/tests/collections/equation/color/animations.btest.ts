const { testBrowserAnimation } = require('../../../browserAnimationTester');

testBrowserAnimation(
  'Collections: Equation - Animations',
  `file://${__dirname}/animations.html`,
  4,
  0.25,
);
