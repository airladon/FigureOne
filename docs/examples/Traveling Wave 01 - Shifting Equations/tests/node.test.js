import makeFigure from '../../../../src/js/__mocks__/makeFigure';
import * as g2 from  '../../../../src/js/tools/g2';
import * as math from  '../../../../src/js/tools/math';
global.Fig = {
  Figure: () => makeFigure(),
  tools: { g2, math },
  Point: g2.Point,
  range: math.range,
  round: math.round,
};

global.figure = {};
require('../index.js');

test('tester', () => {
  // console.log(figure.elements.drawOrder)
  expect(true).toBe(true);
});