import AnimationBuilder from './AnimationBuilder';
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

describe('AnimationBuilder API', () => {
  let element;
  let diagram;
  beforeEach(() => {
    diagram = makeDiagram();
    element = diagram.objects.line();
    element.transform = element.transform.zero();
  });
  test('Basic', () => {
    const builder = new AnimationBuilder({ element });
    const p1 = new Point(1, 1);
    const p2 = new Point(2, 2);
    builder
      .position({ target: p1, duration: 1, progression: 'linear' })
      .position({ target: p2, duration: 1, progression: 'linear' })
      .start();
    builder.nextFrame(100);
    builder.nextFrame(100.1);
    expect(element.getPosition().round()).toEqual(point(0.1));

    let remaining = builder.nextFrame(101.1);
    expect(element.getPosition().round()).toEqual(point(1.1));
    expect(math.round(remaining)).toBe(-0.9);

    remaining = builder.nextFrame(102.1);
    expect(element.getPosition().round()).toEqual(point(2));
    expect(math.round(remaining)).toBe(0.1);
  });
  test('Diagram', () => {
    diagram.elements.add('e', element);
    element.animations.new()
      .position({ target: point(1), duration: 1, progression: 'linear' })
      .whenFinished(() => {})
      .start();
    diagram.draw(0);
    diagram.draw(0.5);
    expect(element.getPosition().round()).toEqual(point(0.5));
  });
  test('Duplicate', () => {
    const builder = new AnimationBuilder({ element });
    const p1 = new Point(1, 1);
    const p2 = new Point(2, 2);
    builder
      .position({ target: p1, duration: 1, progression: 'linear' })
      .position({ target: p2, duration: 1, progression: 'linear' });
    const dup = builder._dup();
    expect(dup).not.toBe(builder);
    expect(dup).toEqual(builder);
    expect(dup.element).toBe(builder.element);
  });
});
