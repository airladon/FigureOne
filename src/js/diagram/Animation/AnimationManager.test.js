import AnimationManager from './AnimationManager';
import {
  Point,
} from '../../tools/g2';
import * as tools from '../../tools/tools';
import * as math from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

const point = value => new Point(value, value);

describe('Animation Manager', () => {
  let elem;
  let p1;
  beforeEach(() => {
    const diagram = makeDiagram();
    elem = diagram.objects.line();
    elem.setPosition(new Point(0, 0));
    p1 = new Point(1, 1);
  });
  test('Basic', () => {
    elem.anim.new()
      .moveTo({ target: p1, duration: 1, progression: 'linear' })
      .start();
    elem.anim.nextFrame(0);
    expect(elem.getPosition().round()).toEqual(point(0));

    elem.anim.nextFrame(0.5);
    expect(elem.getPosition().round()).toEqual(point(0.5));

    elem.anim.nextFrame(1.1);
    expect(elem.getPosition().round()).toEqual(point(1));
  });
  // test('Duplicate', () => {
  //   const animator = new Animator({ element });
  //   const p1 = new Point(1, 1);
  //   const p2 = new Point(2, 2);
  //   animator
  //     .moveTo({ target: p1, duration: 1, progression: 'linear' })
  //     .moveTo({ target: p2, duration: 1, progression: 'linear' });
  //   const dup = animator._dup();
  //   expect(dup).not.toBe(animator);
  //   expect(dup).toEqual(animator);
  //   expect(dup.element).toBe(animator.element);
  // });
});
