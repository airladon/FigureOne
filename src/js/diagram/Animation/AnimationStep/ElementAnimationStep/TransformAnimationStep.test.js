import TransformAnimationStep from './TransformAnimationStep';
import * as tools from '../../../../tools/tools';
import * as math from '../../../../tools/math';
import makeDiagram from '../../../../__mocks__/makeDiagram';

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
    const type = 'transform';
    const progression = 'easeinout';
    const start = element.transform.zero();
    const target = element.transform.constant(1);
    const duration = 2;
    const step = new TransformAnimationStep({
      onFinish,
      finishOnCancel,
      type,
      progression,
      duration,
      start,
      target,
      element,
    });
    expect(step.onFinish).toBe(onFinish);
    expect(step.type).toBe(type);
    expect(step.progression).toBe(math.easeinout);
    expect(step.transform.start).toBe(start);
    expect(step.transform.target).toBe(target);
    expect(step.transform.delta).toBe(null);
    expect(step.duration).toBe(duration);
  });
  test('Delta calculation with start transform defined', () => {
    const start = element.transform.zero();
    const target = element.transform.constant(1);
    const step = new TransformAnimationStep({
      element,
      start,
      target,
    });
    expect(step.transform.delta).toBe(null);
    expect(step.state).toBe('idle');
    step.start();
    expect(step.state).toBe('animating');
    expect(step.transform.delta).toEqual(target);
    expect(step.startTime).toBe(-1);
  });
  test('Target calculation with start transform not defined', () => {
    const delta = element.transform.constant(1);
    const step = new TransformAnimationStep({
      element,
      type: 'transform',
      delta,
    });
    expect(step.transform.start).toBe(null);
    expect(step.transform.target).toBe(null);

    const start = element.transform.zero();
    element.transform = start;
    step.start();
    expect(step.transform.target).toEqual(delta);
    expect(step.transform.start).toEqual(start);
  });
  test('Velocity calculation', () => {
    const start = element.transform.zero();
    const target = element.transform.constant(3);
    const velocity = element.transform.constant(0.5);
    const step = new TransformAnimationStep({
      element,
      type: 'transform',
      start,
      target,
      velocity,
    });
    step.start();
    expect(step.duration).toBe(6);
  });
  test('Clip Rotation', () => {
    const start = element.transform.zero();
    const target = element.transform.constant(6.28);
    const step = new TransformAnimationStep({
      element,
      type: 'transform',
      start,
      target,
      clipRotationTo: '-180to180',
      rotDirection: 1,
      progression: 'linear',
      duration: 1,
    });
    step.start();
    step.nextFrame(0);
    step.nextFrame(0.75);
    expect(math.round(element.getRotation(), 2)).toBe(-3.14 / 2);
  });
  test('Animation flow', () => {
    const start = element.transform.zero();
    const target = element.transform.constant(1);
    const step = new TransformAnimationStep({
      element,
      duration: 1,
      progression: 'linear',
      type: 'transform',
      start,
      target,
    });
    step.start();
    expect(step.startTime).toBe(-1);

    step.nextFrame(100);
    expect(step.startTime).toBe(100);
    expect(step.element.transform).toEqual(start);

    let remainingTime;
    remainingTime = step.nextFrame(100.1);
    expect(step.element.transform.round()).toEqual(start.constant(0.1));
    expect(math.round(remainingTime)).toBe(-0.9);

    remainingTime = step.nextFrame(100.55);
    expect(step.element.transform.round()).toEqual(start.constant(0.55));
    expect(math.round(remainingTime)).toBe(-0.45);

    remainingTime = step.nextFrame(100.9);
    expect(step.element.transform.round()).toEqual(start.constant(0.9));
    expect(math.round(remainingTime)).toBe(-0.1);

    remainingTime = step.nextFrame(101.1);
    expect(step.element.transform.round()).toEqual(target);
    expect(math.round(remainingTime)).toBe(0.1);
  });
  test('Duplication', () => {
    const start = element.transform.zero();
    const target = element.transform.constant(1);
    const step = new TransformAnimationStep({
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
      start = element.transform.zero();
      target = element.transform.constant(1);
      step = new TransformAnimationStep({
        element,
        duration: 1,
        progression: 'linear',
        type: 'transform',
        start,
        target,
        onFinish: () => { callbackFlag = 1; },
      });
    });
    test('CompleteOnCancel = true, Default Force', () => {
      step.completeOnCancel = true;
      step.start();
      step.nextFrame(0);
      step.nextFrame(0.5);
      expect(element.transform.round()).toEqual(start.constant(0.5));

      step.finish(true);
      expect(element.transform.round()).toEqual(target);
      expect(callbackFlag).toBe(1);
    });
    test('CompleteOnCancel = false, Default Force', () => {
      step.completeOnCancel = false;
      step.start();
      step.nextFrame(0);
      step.nextFrame(0.5);
      expect(element.transform.round()).toEqual(start.constant(0.5));

      step.finish(true);
      expect(element.transform.round()).toEqual(start.constant(0.5));
      expect(callbackFlag).toBe(1);
    });
    test('CompleteOnCancel = true, Force no complete', () => {
      step.completeOnCancel = true;
      step.start();
      step.nextFrame(0);
      step.nextFrame(0.5);
      expect(element.transform.round()).toEqual(start.constant(0.5));

      step.finish(true, 'noComplete');
      expect(element.transform.round()).toEqual(start.constant(0.5));
      expect(callbackFlag).toBe(1);
    });
    test('CompleteOnCancel = false, Force complete', () => {
      step.completeOnCancel = false;
      step.start();
      step.nextFrame(0);
      step.nextFrame(0.5);
      expect(element.transform.round()).toEqual(start.constant(0.5));

      step.finish(true, 'complete');
      expect(element.transform.round()).toEqual(target);
      expect(callbackFlag).toBe(1);
    });
  });
});
