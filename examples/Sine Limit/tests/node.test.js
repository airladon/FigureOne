import makeFigure from '../../../src/js/__mocks__/makeFigure';
import * as g2 from  '../../../src/js/tools/g2';
global.Fig = {
  Figure: () => makeFigure(),
  tools: { g2 },
  Point: g2.Point,
};

global.figure = {};
require('../index.js');

test('tester', () => {
  // console.log(figure.elements.drawOrder)
  expect(true).toBe(true);
});