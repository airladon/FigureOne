import PositionAnimationStep from './PositionAnimationStep';
import * as tools from '../../../../tools/tools';
import * as math from '../../../../tools/math';
import makeDiagram from '../../../../__mocks__/makeDiagram';
import {
  Point,
} from '../../../../tools/g2';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Transfrom Animation Unit', () => {
  let element;
  beforeEach(() => {
    const diagram = makeDiagram();
    element = diagram.objects.line();
  });
  test('Instantiation', () => {
    const onFinish = () => {};
    const finishOnCancel = false;
    const progression = 'easeinout';
    const start = new Point(0, 0);
    const target = new Point(1, 1);
    const duration = 2;
    const step = new PositionAnimationStep({
      onFinish,
      finishOnCancel,
      progression,
      duration,
      start,
      target,
      element,
    });
    expect(step.onFinish).toBe(onFinish);
    expect(step.type).toBe('position');
    expect(step.progression).toBe(math.easeinout);
    expect(step.position.start).toBe(start);
    expect(step.position.target).toBe(target);
    expect(step.position.delta).toBe(null);
    expect(step.duration).toBe(duration);
  });
  test('Delta calculation with start transform defined', () => {
    const start = new Point(0, 0);
    const target = new Point(1, 1);
    const step = new PositionAnimationStep({
      element,
      start,
      target,
    });
    expect(step.position.delta).toBe(null);
    expect(step.state).toBe('idle');
    step.start();
    expect(step.state).toBe('animating');
    expect(step.position.delta).toEqual(target);
    expect(step.startTime).toBe(-1);
  });
  test('Target calculation with start transform not defined', () => {
    const delta = new Point(1, 1);
    const step = new PositionAnimationStep({
      element,
      delta,
    });
    expect(step.position.start).toBe(null);
    expect(step.position.target).toBe(null);

    const start = new Point(0, 0);
    element.setPosition(start);
    step.start();
    expect(step.position.target).toEqual(delta);
    expect(step.position.start).toEqual(start);
  });
  test('Velocity calculation', () => {
    const start = new Point(0, 0);
    const target = new Point(3, 3);
    const velocity = new Point(0.5, 0.5);
    // const start = element.transform.zero();
    // const target = element.transform.constant(3);
    // const velocity = element.transform.constant(0.5);
    const step = new PositionAnimationStep({
      element, start, target, velocity,
    });
    step.start();
    expect(step.duration).toBe(6);
  });
  test('Animation flow', () => {
    const start = new Point(0, 0);
    const target = new Point(1, 1);
    const step = new PositionAnimationStep({
      element,
      duration: 1,
      progression: 'linear',
      start,
      target,
    });
    step.start();
    expect(step.startTime).toBe(-1);

    step.nextFrame(100);
    expect(step.startTime).toBe(100);
    expect(step.element.getPosition()).toEqual(start);

    let remainingTime;
    remainingTime = step.nextFrame(100.1);
    expect(step.element.getPosition().round()).toEqual(new Point(0.1, 0.1));
    expect(remainingTime).toBe(0);

    remainingTime = step.nextFrame(100.55);
    expect(step.element.getPosition().round()).toEqual(new Point(0.55, 0.55));
    expect(remainingTime).toBe(0);

    remainingTime = step.nextFrame(100.9);
    expect(step.element.getPosition().round()).toEqual(new Point(0.9, 0.9));
    expect(remainingTime).toBe(0);

    remainingTime = step.nextFrame(101.1);
    expect(step.element.getPosition().round()).toEqual(target);
    expect(math.round(remainingTime)).toBe(0.1);
  });
  test('Duplication', () => {
    const start = new Point(0, 0);
    const target = new Point(3, 3);
    const step = new PositionAnimationStep({
      element,
      duration: 1,
      progression: 'linear',
      start,
      target,
    });
    const dup = step._dup();
    expect(dup).toEqual(step);
    expect(dup).not.toBe(step);
    expect(dup.element).toBe(step.element);
  });
  describe('Cancelling', () => {
    let step;
    let callbackFlag = 0;
    let start;
    let target;
    beforeEach(() => {
      start = new Point(0, 0);
      target = new Point(1, 1);
      step = new PositionAnimationStep({
        element,
        duration: 1,
        progression: 'linear',
        start,
        target,
        onFinish: () => { callbackFlag = 1; },
      });
    });
    const point = value => new Point(value, value);

    test('CompleteOnCancel = true, Default Force', () => {
      step.completeOnCancel = true;
      step.start();
      step.nextFrame(0);
      step.nextFrame(0.5);
      expect(element.getPosition().round()).toEqual(point(0.5));

      step.finish(true);
      expect(element.getPosition().round()).toEqual(target);
      expect(callbackFlag).toBe(1);
    });
    test('CompleteOnCancel = false, Default Force', () => {
      step.completeOnCancel = false;
      step.start();
      step.nextFrame(0);
      step.nextFrame(0.5);
      expect(element.getPosition().round()).toEqual(point(0.5));

      step.finish(true);
      expect(element.getPosition().round()).toEqual(point(0.5));
      expect(callbackFlag).toBe(1);
    });
    test('CompleteOnCancel = true, Force no complete', () => {
      step.completeOnCancel = true;
      step.start();
      step.nextFrame(0);
      step.nextFrame(0.5);
      expect(element.getPosition().round()).toEqual(point(0.5));

      step.finish(true, 'noComplete');
      expect(element.getPosition().round()).toEqual(point(0.5));
      expect(callbackFlag).toBe(1);
    });
    test('CompleteOnCancel = false, Force complete', () => {
      step.completeOnCancel = false;
      step.start();
      step.nextFrame(0);
      step.nextFrame(0.5);
      expect(element.getPosition().round()).toEqual(point(0.5));

      step.finish(true, 'complete');
      expect(element.getPosition().round()).toEqual(target);
      expect(callbackFlag).toBe(1);
    });
  });
});
