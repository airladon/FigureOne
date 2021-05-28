const { tester } = require('./tester');

tester(
  'morphprimitive',
  `${__dirname}/../../js/figure/FigurePrimitives/FigureElementPrimitiveMorph.js`,
  '',
  0,
  `
if (typeof image !== 'undefined') {
  sleepTime = 1000;
}
`,
);
