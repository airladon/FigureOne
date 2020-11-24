// import {
//   FigureElementPrimitive,
//   FigureElementCollection,
//   // AnimationPhase,
// } from '../Element';
// import Figure from '../Figure';
import {
  Point, Rect,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
// import webgl from '../../__mocks__/WebGLInstanceMock';
// import DrawContext2D from '../../__mocks__/DrawContext2DMock';
import * as tools from '../../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');
// jest.mock('../../tools/tools');

describe('Figure Equations From Object', () => {
  let figure;
  let collection;
  let color1;
  let ways;

  beforeEach(() => {
    figure = makeFigure();
    collection = figure.shapes.collection();
    color1 = [0.95, 0, 0, 1];
    ways = {
      simple: () => {
        figure.equation.addEquation(collection, 'eqn', {
          color: color1,
          elements: {
            a: 'a',
            b: 'b',
            c: 'c',
            _2: '2',
            v: { symbol: 'vinculum' },
          },
          forms: {
            0: ['a', 'b', 'c'],
            1: [{ frac: ['a', 'v', '_2'] }, 'c'],
          },
          formSeries: ['0', '1'],
        });
        collection._eqn.showForm('1');
      },
      allOptions: () => {
        figure.equation.addEquation(collection, 'eqn', {
          color: color1,
          position: [1, 1],           // Points can be defined as arrays
          scale: 0.85,
          elements: {
            a: 'a',
            b: 'b',
            c: 'c',
            _2: '2',
            v: { symbol: 'vinculum' },
          },
          formDefaults: {
            alignment: {
              fixTo: { x: 2, y: 2 },    // Points can also be defined as objects
              xAlign: 'right',
              yAlign: 'top',
            },
          },
          forms: {
            0: ['a', 'b', 'c'],
            1: [{ frac: ['a', 'v', '_2'] }, 'c'],
          },
          formSeries: ['0', '1'],
        });
        collection._eqn.showForm('1');
      },
      navigator: () => {
        figure.equation.addEquation(collection, 'eqn', {
          color: color1,
          elements: {
            a: 'a',
            b: 'b',
            c: 'c',
            _2: '2',
            v: { symbol: 'vinculum' },
          },
          forms: {
            0: ['a', 'b', 'c'],
            1: [{ frac: ['a', 'v', '_2'] }, 'c'],
          },
          formSeries: ['0', '1'],
        });
        figure.equation.addNavigator(collection, 'nav', {
          equation: collection._eqn,
          offset: new Point(0.2, -0.5),
          navType: '2Line',
          xAlign: 'center',
          yAlign: 'middle',
          navTypeOptions: { arrows: true },
        });
        // spoof a the navigator drawingObject
        collection._nav._table.drawingObject.element = { style: { opacity: 1 } };
        collection._nav.showForm('1');
      },
      navigatorWithoutEquationSplit: () => {
        figure.equation.addNavigator(collection, 'test', {
          equation: collection._eqn,
          offset: [0.2, -0.5],
          navType: '2Line',
          xAlign: 'center',
          yAlign: 'middle',
          navTypeOptions: { arrows: true },
        });
        collection._testEqn.addElements({
          a: 'a',
          b: 'b',
          c: 'c',
          _2: '2',
          v: { symbol: 'vinculum' },
        });
        collection._testEqn.addForms({
          0: ['a', 'b', 'c'],
          1: [{ frac: ['a', 'v', '_2'] }, 'c'],
        });
        collection._testEqn.setFormSeries(['0', '1']);
        collection._testNav._table.drawingObject.element = { style: { opacity: 1 } };
        collection._testNav.showForm('1');
      },
      navigatorWithoutEquationAllInOne: () => {
        figure.equation.addNavigator(collection, 'test', {
          color: color1,
          elements: {
            a: 'a',
            b: 'b',
            c: 'c',
            _2: '2',
            v: { symbol: 'vinculum' },
          },
          forms: {
            0: ['a', 'b', 'c'],
            1: [{ frac: ['a', 'v', '_2'] }, 'c'],
          },
          formSeries: ['0', '1'],
          offset: new Point(0.2, -0.5),
          navType: '2Line',
          xAlign: 'center',
          yAlign: 'middle',
          navTypeOptions: { arrows: true },
        });
        collection._testNav._table.drawingObject.element = { style: { opacity: 1 } };
        collection._testNav.showForm('1');
      },
    };
  });
  test('Figure instantiation', () => {
    expect(figure.limits).toEqual(new Rect(-1, -1, 2, 2));
  });
  describe('Equation Creation', () => {
    test('Simple', () => {
      ways.simple();
      expect(collection).toHaveProperty('_eqn');
      expect(collection._eqn).toHaveProperty('_a');
      expect(collection._eqn).toHaveProperty('_b');
      expect(collection._eqn).toHaveProperty('_c');
      expect(collection._eqn).toHaveProperty('__2');
      expect(collection._eqn).toHaveProperty('_v');

      tools.cleanUIDs(collection._eqn);
      expect(round(collection._eqn._a.transform.mat)).toMatchSnapshot();
      expect(round(collection._eqn.__2.transform.mat)).toMatchSnapshot();
      expect(round(collection._eqn._c.transform.mat)).toMatchSnapshot();
      expect(round(collection._eqn._v.transform.mat)).toMatchSnapshot();
    });
    test('Equation with all options', () => {
      ways.allOptions();
      expect(collection).toHaveProperty('_eqn');
      expect(collection._eqn).toHaveProperty('_a');
      expect(collection._eqn).toHaveProperty('_b');
      expect(collection._eqn).toHaveProperty('_c');
      expect(collection._eqn).toHaveProperty('__2');
      expect(collection._eqn).toHaveProperty('_v');

      tools.cleanUIDs(collection._eqn);
      expect(round(collection._eqn._a.transform.mat)).toMatchSnapshot();
      expect(round(collection._eqn.__2.transform.mat)).toMatchSnapshot();
      expect(round(collection._eqn._c.transform.mat)).toMatchSnapshot();
      expect(round(collection._eqn._v.transform.mat)).toMatchSnapshot();
    });
    test('Navigator with all options', () => {
      ways.navigator();
      expect(collection).toHaveProperty('_eqn');
      expect(collection).toHaveProperty('_nav');
      expect(collection._eqn).toHaveProperty('_a');
      expect(collection._eqn).toHaveProperty('_b');
      expect(collection._eqn).toHaveProperty('_c');
      expect(collection._eqn).toHaveProperty('__2');
      expect(collection._eqn).toHaveProperty('_v');

      tools.cleanUIDs(collection._eqn);
      expect(round(collection._eqn._a.transform.mat)).toMatchSnapshot();
      expect(round(collection._eqn.__2.transform.mat)).toMatchSnapshot();
      expect(round(collection._eqn._c.transform.mat)).toMatchSnapshot();
      expect(round(collection._eqn._v.transform.mat)).toMatchSnapshot();
    });
    test('Navigator without equation Split', () => {
      ways.navigatorWithoutEquationSplit();
      expect(collection).toHaveProperty('_testEqn');
      expect(collection).toHaveProperty('_testNav');
      expect(collection._testEqn).toHaveProperty('_a');
      expect(collection._testEqn).toHaveProperty('_b');
      expect(collection._testEqn).toHaveProperty('_c');
      expect(collection._testEqn).toHaveProperty('__2');
      expect(collection._testEqn).toHaveProperty('_v');

      tools.cleanUIDs(collection._testEqn);
      expect(round(collection._testEqn._a.transform.mat)).toMatchSnapshot();
      expect(round(collection._testEqn.__2.transform.mat)).toMatchSnapshot();
      expect(round(collection._testEqn._c.transform.mat)).toMatchSnapshot();
      expect(round(collection._testEqn._v.transform.mat)).toMatchSnapshot();
    });
    test('Navigator without equation all in one object', () => {
      ways.navigatorWithoutEquationAllInOne();
      expect(collection).toHaveProperty('_testEqn');
      expect(collection).toHaveProperty('_testNav');
      expect(collection._testEqn).toHaveProperty('_a');
      expect(collection._testEqn).toHaveProperty('_b');
      expect(collection._testEqn).toHaveProperty('_c');
      expect(collection._testEqn).toHaveProperty('__2');
      expect(collection._testEqn).toHaveProperty('_v');

      tools.cleanUIDs(collection._testEqn);
      expect(round(collection._testEqn._a.transform.mat)).toMatchSnapshot();
      expect(round(collection._testEqn.__2.transform.mat)).toMatchSnapshot();
      expect(round(collection._testEqn._c.transform.mat)).toMatchSnapshot();
      expect(round(collection._testEqn._v.transform.mat)).toMatchSnapshot();
    });
  });
});