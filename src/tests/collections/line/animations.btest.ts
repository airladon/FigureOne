const { testBrowserAnimation } = require('../../browserAnimationTester');

testBrowserAnimation(
  'Collections: Line - Animations',
  `http://localhost:8080/${__dirname.replace('/home/pwuser', '')}/animations.html`,
  2,
  0.25,
);
