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
    elem.setColor([1, 0, 0, 1]);
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
    expect(elem.anim.sequences).toHaveLength(0);
  });
  test('Two parallel animations', () => {
    elem.anim.new()
      .moveTo({ target: p1, duration: 1, progression: 'linear' })
      .start();
    elem.anim.new()
      .dissolveOut(2)
      .start();
    elem.anim.nextFrame(0);
    expect(elem.getPosition().round()).toEqual(point(0));
    expect(math.round(elem.color, 2)).toEqual([1, 0, 0, 1]);

    elem.anim.nextFrame(0.5);
    expect(elem.getPosition().round()).toEqual(point(0.5));
    expect(math.round(elem.color, 2)).toEqual([1, 0, 0, 0.75]);
    expect(elem.isShown).toBe(true);
    expect(elem.anim.sequences).toHaveLength(2);

    elem.anim.nextFrame(1.5);
    expect(elem.getPosition().round()).toEqual(point(1));
    expect(math.round(elem.color, 2)).toEqual([1, 0, 0, 0.25]);
    expect(elem.anim.sequences).toHaveLength(1);

    elem.anim.nextFrame(2.1);
    expect(elem.getPosition().round()).toEqual(point(1));
    expect(math.round(elem.color, 2)).toEqual([1, 0, 0, 1]);
    expect(elem.isShown).toBe(false);
    expect(elem.anim.sequences).toHaveLength(0);
  });
});
