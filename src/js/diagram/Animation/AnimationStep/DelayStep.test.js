import { DelayStep } from './DelayStep';
import * as tools from '../../../tools/tools';
import * as math from '../../../tools/math';
import makeDiagram from '../../../__mocks__/makeDiagram';
import {
  Point,
} from '../../../tools/g2';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');


describe('Transfrom Animation Unit', () => {
  let elem1;
  let elem2;
  beforeEach(() => {
    const diagram = makeDiagram();
    elem1 = diagram.objects.line();
    elem1.setPosition(new Point(0, 0));
    elem2 = diagram.objects.line();
    elem2.setPosition(new Point(0, 0));
  });
  test('Instantiation', () => {
    const onFinish = () => {};
    const completeOnCancel = false;
    const duration = 2;
    const step = new DelayStep({
      onFinish,
      completeOnCancel,
      duration,
    });
    expect(step.onFinish).toBe(onFinish);
    expect(step.duration).toBe(duration);
    expect(step.completeOnCancel).toBe(completeOnCancel);
  });
  test('Delay then move', () => {
    elem1.animations.new()
      .delay(1)
      .position({ target: new Point(1, 1), duration: 1, progression: 'linear' })
      .start();

    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.1);
    expect(elem1.getPosition().round()).toEqual(new Point(0, 0));

    elem1.animations.nextFrame(0.9);
    expect(elem1.getPosition().round()).toEqual(new Point(0, 0));

    elem1.animations.nextFrame(1.1);
    expect(elem1.getPosition().round()).toEqual(new Point(0.1, 0.1));
  });

  test('Delay 0 then move', () => {
    elem1.animations.new()
      .delay(0)
      .position({ target: new Point(1, 1), duration: 1, progression: 'linear' })
      .start();

    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.1);
    expect(elem1.getPosition().round()).toEqual(new Point(0.1, 0.1));

    elem1.animations.nextFrame(0.9);
    expect(elem1.getPosition().round()).toEqual(new Point(0.9, 0.9));

    elem1.animations.nextFrame(1.1);
    expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
  });

  test('Move, Delay, Move', () => {
    elem1.animations.new()
      .position({ target: new Point(1, 1), duration: 1, progression: 'linear' })
      .delay(1)
      .position({ target: new Point(2, 2), duration: 1, progression: 'linear' })
      .delay(1)
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    expect(elem1.getPosition().round()).toEqual(new Point(0.5, 0.5));

    elem1.animations.nextFrame(1);
    expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
    elem1.animations.nextFrame(1.5);
    expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
    elem1.animations.nextFrame(2);
    expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
    elem1.animations.nextFrame(2.5);
    expect(elem1.getPosition().round()).toEqual(new Point(1.5, 1.5));
    elem1.animations.nextFrame(3);
    expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
    elem1.animations.nextFrame(3.5);
    expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
    let remaining = elem1.animations.nextFrame(4);
    expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
    expect(math.round(remaining)).toBe(0);
    remaining = elem1.animations.nextFrame(4.1);
    expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
    expect(math.round(remaining)).toBe(0);
    expect(elem1.animations.animations).toHaveLength(0);
  });
  test('Delay separate elem1 in parallel method', () => {
    elem1.animations.new()
      .position({ target: new Point(1, 1), duration: 1, progression: 'linear' })
      .inParallel([
        elem1.anim.builder()
          .delay(1)
          .position({ target: new Point(2, 2), duration: 1, progression: 'linear' }),
        elem2.anim.position({ target: new Point(1, 1), duration: 1, progression: 'linear' }),
      ])
      .start();
    let remaining;
    remaining = elem1.animations.nextFrame(0);
    remaining = elem1.animations.nextFrame(0.5);
    expect(elem1.getPosition().round()).toEqual(new Point(0.5, 0.5));
    expect(elem2.getPosition().round()).toEqual(new Point(0, 0));
    expect(remaining).toBe(-0.5);

    remaining = elem1.animations.nextFrame(1.5);
    expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
    expect(elem2.getPosition().round()).toEqual(new Point(0.5, 0.5));

    remaining = elem1.animations.nextFrame(2.5);
    expect(elem1.getPosition().round()).toEqual(new Point(1.5, 1.5));
    expect(elem2.getPosition().round()).toEqual(new Point(1, 1));
    expect(remaining).toBe(-0.5);

    remaining = elem1.animations.nextFrame(3.5);
    expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
    expect(elem2.getPosition().round()).toEqual(new Point(1, 1));
    expect(math.round(remaining)).toBe(0.5);
  });
});
