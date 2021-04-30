const { testBrowserAnimation } = require('../../browserAnimationTester');

testBrowserAnimation(
  'Collections: Angle - Animations',
  `file:/${__dirname}/animations.html`,
  8,
  0.25,
);
