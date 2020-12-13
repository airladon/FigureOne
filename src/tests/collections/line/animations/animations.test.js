import makeFigure from '../../../../js/__mocks__/makeFigure';

const { getShapes, updates } = require('./animations.js');

const tests = getShapes(() => ({ x: 0, y: 0 })).map(s => [s.name, s]);

const cleanElement = (elementIn) => {
  const element = elementIn;
  element.uid = '';
  element.parent = null;
  element.figure = null;
  element.animations = null;
  element.anim = null;
  element.recorder = null;
  // Object.keys(element).forEach((key) => {
  //   if (element[key] != null && typeof element[key] === 'object') {
  //     element[key] = cleanElement(element[key]);
  //   }
  // });
  if (element.drawOrder != null) {
    element.drawOrder.forEach(name => cleanElement(element.elements[name]));
  }
  return element;
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
