const { tester } = require('./tester.js');

tester(
  'collections',
  `${__dirname}/../../js/figure/FigureCollections`,
  `
const pow = (pow = 2, stop = 10, step = 0.05) => {
  const xValues = Fig.tools.math.range(0, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** pow));
}
`,
);
