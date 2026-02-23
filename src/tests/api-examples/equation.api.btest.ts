const { tester } = require('./tester');

tester(
  'equation',
  `${__dirname}/../../js/figure/Equation`,
  `
  figure.primitives.equationScale = 2;
  `,
);
