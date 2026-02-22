import makeFigure from '../../../js/__mocks__/makeFigure';
import { simpleElement } from '../../tools';

const { shapes } = require('./shapes');
const { updates } = require('./updates');

const tests = shapes.map(s => [s.name, s]);

describe('Collection: Collection', () => {
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
        // element.custom.updatePoints(updates[name]);
      }
      // element.uid = '';
      // element.parent = null;
      // element.figure = null;
      // element.animations = null;
      // element.anim = null;
      // element.recorder = null;
      expect(simpleElement(element)).toMatchSnapshot();
    },
  );
});
