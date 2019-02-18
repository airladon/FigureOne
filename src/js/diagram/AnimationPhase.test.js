import { TransformAnimationUnit } from './AnimationPhase';
import {
  Transform,
} from '../tools/g2';
import * as tools from '../tools/tools';
import * as math from '../tools/math';
import makeDiagram from '../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('./Gesture');
jest.mock('./webgl/webgl');
jest.mock('./DrawContext2D');


describe('Transfrom Animation Unit', () => {
  let element;
  beforeEach(() => {
    const diagram = makeDiagram();
    element = diagram.objects.line(new Transform().scale(1, 1).rotate(0).translate(0, 0));
  });
  test('Instantiation', () => {
    const onFinish = () => {};
    const finishOnCancel = false;
    const type = 'transform';
    const progression = 'easeinout';
    const start = element.transform.zero();
    const target = element.transform.constant(1);
    const duration = 2;
    const unit = new TransformAnimationUnit({
      onFinish,
      finishOnCancel,
      type,
      progression,
      duration,
      transform: {
        start,
        target,
      },
      element,
    });
    expect(unit.onFinish).toBe(onFinish);
    expect(unit.type).toBe(type);
    expect(unit.progression).toBe(math.easeinout);
    expect(unit.transform.start).toBe(start);
    expect(unit.transform.target).toBe(target);
    expect(unit.transform.delta).toBe(null);
    expect(unit.duration).toBe(duration);
  });
  test('Delta calculation with start transform defined', () => {
    const start = element.transform.zero();
    const target = element.transform.constant(1);
    const unit = new TransformAnimationUnit({
      element,
      type: 'transform',
      transform: {
        start,
        target,
      },
    });
    expect(unit.transform.delta).toBe(null);
    unit.start();
    expect(unit.transform.delta).toEqual(target);
    expect(unit.startTime).toBe(-1);
  });
  test('Target calculation with start transform not defined', () => {
    const delta = element.transform.constant(1);
    const unit = new TransformAnimationUnit({
      element,
      type: 'transform',
      transform: {
        delta,
      },
    });
    expect(unit.transform.start).toBe(null);
    expect(unit.transform.target).toBe(null);

    const start = element.transform.zero();
    element.transform = start;
    unit.start();
    expect(unit.transform.target).toEqual(delta);
    expect(unit.transform.start).toEqual(start);
  });
  test('Velocity calculation', () => {
    const start = element.transform.zero();
    const target = element.transform.constant(3);
    const velocity = element.transform.constant(0.5);
    const unit = new TransformAnimationUnit({
      element,
      type: 'transform',
      transform: {
        start, target, velocity,
      },
    });
    unit.start();
    expect(unit.duration).toBe(6);
  });
  test.only('Animation flow', () => {
    const start = element.transform.zero();
    const target = element.transform.constant(1);
    const unit = new TransformAnimationUnit({
      element,
      duration: 1,
      progression: 'linear',
      type: 'transform',
      transform: { start, target },
    });
    unit.start();
    expect(unit.startTime).toBe(-1);

    unit.nextFrame(100);
    expect(unit.startTime).toBe(100);
    expect(unit.element.transform).toEqual(start);

    let remainingTime;
    remainingTime = unit.nextFrame(100.1);
    expect(unit.element.transform.round()).toEqual(start.constant(0.1));
    expect(remainingTime).toBe(0);

    remainingTime = unit.nextFrame(100.55);
    expect(unit.element.transform.round()).toEqual(start.constant(0.55));
    expect(remainingTime).toBe(0);

    remainingTime = unit.nextFrame(100.9);
    expect(unit.element.transform.round()).toEqual(start.constant(0.9));
    expect(remainingTime).toBe(0);

    remainingTime = unit.nextFrame(101.1);
    expect(unit.element.transform.round()).toEqual(target);
    expect(math.round(remainingTime)).toBe(0.1);
  });
});
