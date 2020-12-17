const { testBrowserAnimation } = require('../../browserAnimationTester');

testBrowserAnimation(
  'Collections: Angle - Animations',
  `file:/${__dirname}/animations.html`,
  4,
  0.25,
);
