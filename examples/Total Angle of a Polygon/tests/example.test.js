// import Figure from '../../../js/figure/Figure';
import makeFigure from '../../../js/__mocks__/makeFigure';
import * as g2 from  '../../../js/tools/g2';
global.Fig = {
  Figure: () => makeFigure(),
  tools: { g2 },
};

global.figure = {};
require('../../../../examples/polygon/index.js');

test('tester', () => {
  console.log(figure.elements.drawOrder)
  expect(true).toBe(true);
});