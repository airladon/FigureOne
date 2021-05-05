import {
  Point,
} from '../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';
import { Equation } from '../Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

describe('Equation Symbols - Square Bracket', () => {
  let figure;
  let eqn;
  let color1;
  let elements;
  let lineWidth;
  let tipWidth;
  let width;
  let height;
  beforeEach(() => {
    width = 0.3;
    lineWidth = 0.1;
    tipWidth = 0.05;
    height = 2;
    figure = makeFigure();
    color1 = [0.95, 0, 0, 1];
    elements = {
      a: 'a',
      left: {
        symbol: 'squareBracket',
        side: 'left',
        lineWidth,
        tipWidth,
        width,
        draw: 'dynamic',
        radius: 0,
      },
      right: {
        symbol: 'squareBracket',
        side: 'right',
        lineWidth: 0.01,
        tipWidth: 0.01,
        width: 0.03,
        draw: 'dynamic',
      },
      leftCurved: {
        symbol: 'squareBracket',
        side: 'right',
        lineWidth: 0.01,
        width: 0.03,
        radius: 0.03,
        sides: 10,
        draw: 'static',
        staticHeight: 'first',
      },
    };
    eqn = new Equation(figure.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms({
      0: {
        brac: {
          content: 'a',
          left: 'left',
          right: 'right',
          height,
        },
      },
      1: {
        brac: {
          content: 'a',
          left: 'leftCurved',
          right: 'right',
          height,
        },
      },
    });
    figure.elements = eqn;
  });
  test('Snapshot Square Bracket', () => {
    // Snapshot test on most simple layout
    eqn.showForm('0');
    figure.setFirstTransform();
    expect(round(eqn._left.drawingObject.points)).toMatchSnapshot();
    expect(round(eqn._right.drawingObject.points)).toMatchSnapshot();
  });
  test('Snapshot Rounded Square Bracket', () => {
    // Snapshot test on most simple layout
    eqn.showForm('1');
    figure.setFirstTransform();
    expect(round(eqn._leftCurved.drawingObject.points)).toMatchSnapshot();
  });
  //
  //                4 ._______________________  6
  //                  |                       |
  //                  |                       |
  //                  |      .________________| 7
  //                  |      |
  //                  |      |  5
  //                  |      |
  //                  |      |
  //                  |      |
  //                  |      |
  //                  |      |
  //                  |      |
  //                  |      |  3
  //                  |      |________________  1
  //                  |                       |
  //                  |                       |
  //                2 |_______________________| 0
  //
  test('Points', () => {
    eqn.showForm('0');
    figure.setFirstTransform();
    const { points } = eqn._left.drawingObject;
    const allPoints = [];
    for (let i = 0; i < points.length; i += 2) {
      allPoints.push(new Point(points[i], points[i + 1]));
    }
    expect(allPoints[0].isEqualTo(new Point(width, 0))).toBe(true);
    expect(allPoints[1].isEqualTo(new Point(width, tipWidth))).toBe(true);
    expect(allPoints[2].isEqualTo(new Point(0, 0))).toBe(true);
    expect(allPoints[3].isEqualTo(new Point(lineWidth, tipWidth))).toBe(true);
    expect(allPoints[4].isEqualTo(new Point(0, height))).toBe(true);
    expect(allPoints[5].isEqualTo(new Point(lineWidth, height - tipWidth))).toBe(true);
    expect(allPoints[6].isEqualTo(new Point(width, height))).toBe(true);
    expect(allPoints[7].isEqualTo(new Point(width, height - tipWidth))).toBe(true);
  });
});
