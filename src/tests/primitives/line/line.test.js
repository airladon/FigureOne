// import { tools } from '../../../index';
import makeFigure from '../../../js/__mocks__/makeFigure';
// import { cleanUIDs } from '../../../js/tools/tools';

const { shapes } = require('./shapes.js');

let tests = shapes.map(s => [s.name, s]);
tests = tests.slice(0, 3);

describe('line tests', () => {
  let figure;
  beforeEach(() => {
    figure = makeFigure();
  });
  test.each(tests)(
    '%s',
    (name, shape) => {
      figure.add(shape);
      const element = figure.getElement(name);
      element.uid = '';
      element.parent = null;
      element.figure = null;
      element.animations = null;
      element.anim = null;
      element.recorder = null;
      expect(element).toMatchSnapshot();
    });
});
