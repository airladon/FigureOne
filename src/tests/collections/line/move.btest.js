const { testBrowserAnimation } = require('../../browserAnimationTester');

testBrowserAnimation(
  'Collections: Line - Animations',
  `file:/${__dirname}/animations.html`,
  2,
  0.25,
);
