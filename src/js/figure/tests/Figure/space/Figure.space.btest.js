const { browserStaticTester } = require('../../../../../tests/browserAnimationTester');

browserStaticTester(
  'Figure Space',
  `file:/${__dirname}/space.html`,
  5,
  0.5,
);
