import makeFigure from '../../../../src/js/__mocks__/makeFigure';
import * as g2 from  '../../../../src/js/tools/g2';
import { range } from  '../../../../src/js/tools/math';
global.Fig = {
  Figure: () => makeFigure(),
  tools: { g2 },
  range,
};

global.figure = {};
require('../index.js');

test('tester', () => {
  // console.log(figure.elements.drawOrder)
  expect(true).toBe(true);
});