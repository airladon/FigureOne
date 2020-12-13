import makeFigure from '../../../../js/__mocks__/makeFigure';
import { simpleElement } from '../../../tools';

const { getShapes, updates } = require('./animations.js');

const tests = getShapes(() => ({ x: 0, y: 0 })).map(s => [s.name, s]);

describe('Collection: Line', () => {
  let figure;
  beforeEach(() => {
    figure = makeFigure();
  });
  test.each(tests)(
    '%s',
    (name, shape) => {
      figure.add(shape);
      const element = figure.getElement(name);
      if (updates[name] != null) {
        updates[name](element);
      }
      expect(simpleElement(element)).toMatchSnapshot();
    },
  );
});
