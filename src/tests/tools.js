/* eslint-disable import/prefer-default-export */
import makeFigure from '../js/__mocks__/makeFigure';
import { round } from '../js/tools/math';

const simpleElement = (element) => {
  const out = {};
  const roundArray = b => b.map(bb => [round(bb.x, 3), round(bb.y, 3)]);
  const roundBorder = b => b.map(bb => roundArray(bb));
  out.border = roundBorder(element.getBorder('figure', 'border'));
  out.touchBorder = roundBorder(element.getBorder('figure', 'touchBorder'));
  if (element.elements != null) {
    out.elements = {};
    element.drawOrder.forEach((name) => {
      out.elements[name] = simpleElement(element.elements[name]);
    });
  }
  if (element.drawingObject != null && element.drawingObject.points != null) {
    out.points = round(element.drawingObject.points, 3);
  }
  return out;
};

function testElements(title, getShapes, updates) {
  const tests = getShapes(() => ({ x: 0, y: 0 })).map(s => [s.name, s]);
  describe(title, () => {
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
}

export {
  // simpleElement,
  testElements,
};
