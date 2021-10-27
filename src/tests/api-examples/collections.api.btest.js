const { tester } = require('./tester');

tester(
  'collections',
  `${__dirname}/../../js/figure/FigureCollections`,
  `
const pow = (pow = 2, start = 0, stop = 10, step = 0.05) => {
  const xValues = Fig.tools.math.range(start, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** pow));
}
`,
);
