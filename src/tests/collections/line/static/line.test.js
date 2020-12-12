import makeFigure from '../../../../js/__mocks__/makeFigure';

const { shapes } = require('./shapes.js');
const { updates } = require('./updates.js');

const tests = shapes.map(s => [s.name, s]);

const cleanElement = (elementIn) => {
  const element = elementIn;
  element.uid = '';
  element.parent = null;
  element.figure = null;
  element.animations = null;
  element.anim = null;
  element.recorder = null;
  if (element.drawOrder != null) {
    element.drawOrder.forEach(name => cleanElement(element.elements[name]));
  }
};

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
      expect(cleanElement(element)).toMatchSnapshot();
    },
  );
});
