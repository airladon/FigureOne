/* eslint-disable import/prefer-default-export */
/* eslint-disable jest/no-export */
import makeFigure from '../js/__mocks__/makeFigure';
import { simpleElement } from './tools';

function staticTester(title, getShapes, updates) {
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
  staticTester,
};
