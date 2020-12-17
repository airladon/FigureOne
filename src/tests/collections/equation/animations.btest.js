const { testBrowserAnimation } = require('../../browserAnimationTester');

testBrowserAnimation(
  'Collections: Angle - Animations',
  `file:/${__dirname}/animations.html`,
  6,
  0.25,
);
