const { tester } = require('./tester');

tester(
  'morphprimitive',
  `${__dirname}/../../js/figure/FigurePrimitives/FigureElementPrimitiveMorph.ts`,
  '',
  0,
  `
if (typeof image !== 'undefined') {
  sleepTime = 3000;
}
`,
);
