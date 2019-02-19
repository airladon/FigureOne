import Animator from './Animator';
import {
  Point,
} from '../../tools/g2';
import * as tools from '../../tools/tools';
// import * as math from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

const point = value => new Point(value, value);

describe('Animator API', () => {
  let element;
  beforeEach(() => {
    const diagram = makeDiagram();
    element = diagram.objects.line();
    element.transform = element.transform.zero();
  });
  test('Basic', () => {
    const animator = new Animator(element);
    const p1 = new Point(1, 1);
    const p2 = new Point(2, 2);
    animator
      .moveTo({ target: p1, duration: 1 })
      .moveTo({ target: p2, duration: 1 })
      .start();
    animator.nextFrame(100);
    animator.nextFrame(100.1);
    // expect(element.getPosition().round()).toEqual(point(0.1));
  });
});
