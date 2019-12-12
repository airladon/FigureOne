import {
  Point,
} from '../../../../tools/g2';
import {
  round,
} from '../../../../tools/math';
import * as tools from '../../../../tools/tools';
import makeDiagram from '../../../../__mocks__/makeDiagram';
import { EquationNew } from '../Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');

describe('Equation Symbols - Square Bracket', () => {
  let diagram;
  let eqn;
  let color1;
  let elements;
  let lineWidth;
  let endLineWidth;
  let width;
  let height;
  beforeEach(() => {
    width = 0.3;
    lineWidth = 0.1;
    endLineWidth = 0.05;
    height = 2;
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    elements = {
      a: 'a',
      left: {
        symbol: 'squareBracket',
        side: 'left',
        lineWidth,
        endLineWidth,
        width,
        staticSize: false,
      },
      right: {
        symbol: 'squareBracket',
        side: 'right',
        lineWidth: 0.01,
        endLineWidth: 0.01,
        width: 0.03,
        staticSize: true,
      },
      leftCurved: {
        symbol: 'squareBracket',
        side: 'right',
        lineWidth: 0.01,
        width: 0.03,
        radius: 0.03,
        sides: 10,
        staticSize: true,
      },
    };
    eqn = new EquationNew(diagram.shapes, { color: color1 });
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
    diagram.elements = eqn;
  });
  test('Snapshot Square Bracket', () => {
    // Snapshot test on most simple layout
    eqn.showForm('0');
    diagram.setFirstTransform();
    expect(round(eqn._left.drawingObject.points)).toMatchSnapshot();
    expect(round(eqn._right.drawingObject.points)).toMatchSnapshot();
  });
  test('Snapshot Rounded Square Bracket', () => {
    // Snapshot test on most simple layout
    eqn.showForm('1');
    diagram.setFirstTransform();
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
    diagram.setFirstTransform();
    const { points } = eqn._left.drawingObject;
    const allPoints = [];
    for (let i = 0; i < points.length; i += 2) {
      allPoints.push(new Point(points[i], points[i + 1]));
    }
    expect(allPoints[0].isEqualTo(new Point(width, 0))).toBe(true);
    expect(allPoints[1].isEqualTo(new Point(width, endLineWidth))).toBe(true);
    expect(allPoints[2].isEqualTo(new Point(0, 0))).toBe(true);
    expect(allPoints[3].isEqualTo(new Point(lineWidth, endLineWidth))).toBe(true);
    expect(allPoints[4].isEqualTo(new Point(0, height))).toBe(true);
    expect(allPoints[5].isEqualTo(new Point(lineWidth, height - endLineWidth))).toBe(true);
    expect(allPoints[6].isEqualTo(new Point(width, height))).toBe(true);
    expect(allPoints[7].isEqualTo(new Point(width, height - endLineWidth))).toBe(true);
  });
});
