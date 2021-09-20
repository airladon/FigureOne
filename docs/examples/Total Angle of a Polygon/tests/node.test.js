import makeFigure from '../../../../src/js/__mocks__/makeFigure';
import * as g2 from  '../../../../src/js/tools/g2';
global.Fig = {
  Figure: () => makeFigure(),
  tools: { g2 },
  getPoints: g2.getPoints,
  threePointAngle: g2.threePointAngle,
};

global.figure = {};
require('../index.js');

test('tester', () => {
  // console.log(figure.elements.drawOrder)
  expect(true).toBe(true);
});