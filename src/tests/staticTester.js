/* eslint-disable import/prefer-default-export */
/* eslint-disable jest/no-export */
import makeFigure from '../js/__mocks__/makeFigure';
import { simpleElement } from './tools';

function staticTester(title, getShapes, updates, getValues) {
  const tests = getShapes(() => ({ x: 0, y: 0 })).map(s => [s.name, s]);
  const valueTitles = {};
  tests.forEach((test) => {
    const [name] = test;
    Object.keys(getValues).forEach((valueTitle) => {
      const { element } = getValues[valueTitle];
      if (element === name) {
        // valueTitles.push(title)
        if (valueTitles[name] == null) {
          valueTitles[name] = [];
        }
        valueTitles[name].push(valueTitle);
      }
    });
  });

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
        if (valueTitles[name] != null) {
          valueTitles[name].forEach((valueTitle) => {
            const result = getValues[valueTitle].when(element);
            const expected = getValues[valueTitle].expect;
            expect(result).toEqual(expected);
          });
        }
      },
    );
  });
}

export {
  staticTester,
};
