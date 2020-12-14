/* eslint-disable import/prefer-default-export */
/* eslint-disable jest/no-export */
import makeFigure from '../js/__mocks__/makeFigure';
import { simpleElement } from './tools';
import { getPoint } from '../js/tools/g2';

function staticTester(title, getShapes, updates = {}, getValues = {}, move = {}) {
  const tests = getShapes(() => ({ x: 0, y: 0 })).map(s => [s.name, s]);
  const valueTests = [];
  const moveTests = [];
  tests.forEach((test) => {
    const [name] = test;
    Object.keys(getValues).forEach((valueTitle) => {
      const { element } = getValues[valueTitle];
      if (element === name) {
        valueTests.push([valueTitle, test[0], test[1]]);
      }
    });
  });
  tests.forEach((test) => {
    const [name] = test;
    Object.keys(move).forEach((moveTitle) => {
      const { element } = move[moveTitle];
      if (element === name) {
        moveTests.push([moveTitle, test[0], test[1]]);
      }
    });
  });

  describe(title, () => {
    let figure;
    beforeEach(() => {
      figure = makeFigure();
    });
    describe('Shape', () => {
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
    if (valueTests.length > 0) {
      describe('getValue', () => {
        test.each(valueTests)(
          '%s',
          (valueTitle, name, shape) => {
            figure.add(shape);
            const element = figure.getElement(name);
            if (updates[name] != null) {
              updates[name](element);
            }
            const result = getValues[valueTitle].when(element);
            const expected = getValues[valueTitle].expect;
            expect(result).toEqual(expected);
          },
        );
      });
    }
    if (moveTests.length > 0) {
      describe('Move', () => {
        test.each(moveTests)(
          '%s',
          (moveTitle, name, shape) => {
            figure.add(shape);
            const element = figure.getElement(name);
            if (move[name] != null) {
              const p = element.getPosition('figure');
              move[name].events.forEach((event) => {
                const [action] = event;
                const loc = getPoint(event[1] || [0, 0]);
                figure[action]([loc.x + p.x, loc.y + p.y]);
              });
            }
            expect(simpleElement(element)).toMatchSnapshot();
          },
        );
      });
    }
  });
}

export {
  staticTester,
};
