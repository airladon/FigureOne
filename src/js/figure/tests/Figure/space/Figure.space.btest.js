const { browserScreenShot } = require('../../../../../tests/browserScreenShot');

browserScreenShot(
  'Figure Space',
  `file:/${__dirname}/space.html`,
  'basic',
  0,
  0.5,
);
