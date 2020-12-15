const { testBrowserAnimation } = require('../../browserAnimationTester');

testBrowserAnimation(
  'Collections: Angle - Animations',
  `file:/${__dirname}/animations.html`,
  2,
  0.25,
);
