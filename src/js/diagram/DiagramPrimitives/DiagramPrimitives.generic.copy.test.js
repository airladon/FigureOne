// import {
//   Point,
// } from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import { Point } from '../../tools/g2';
import * as tools from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

function processPoints(points: Array<number>) {
  const out = [];
  for (let i = 0; i < points.length; i += 2) {
    out.push(new Point(points[i], points[i + 1]));
  }
  return out;
}

describe('Equation Functions - Box', () => {
  let diagram;
  let copy;
  let points;
  let addElement;
  beforeEach(() => {
    diagram = makeDiagram();
    addElement = (copyOption) => {
      diagram.addElement({
        name: 'a',
        method: 'shapes.generic',
        options: {
          points: [[0, 0]],
          copy: copyOption,
        },
      });
      diagram.initialize();
      points = processPoints(diagram.getElement('a').drawingObject.points);
    };

    copy = {
      xAxis: () => ({ num: 1, axis: 'x', step: 2 }),
    };
  });
  test('Simple Tri', () => {
    // const a = diagram.elements._a.getBoundingRect('diagram');
    addElement(copy.xAxis);
    // const a = diagram.getElement('a').drawingObject.points;
    console.log(points);
  });
});
