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
    elem1.animator
      .delay(1)
      .moveTo({ target: new Point(1, 1), duration: 1, progression: 'linear' })
      .start();

    elem1.animator.nextFrame(0);
    elem1.animator.nextFrame(0.1);
    expect(elem1.getPosition().round()).toEqual(new Point(0, 0));

    elem1.animator.nextFrame(0.9);
    expect(elem1.getPosition().round()).toEqual(new Point(0, 0));

    elem1.animator.nextFrame(1.1);
    expect(elem1.getPosition().round()).toEqual(new Point(0.1, 0.1));
  });
  test('Move, Delay, Move', () => {
    elem1.animator
      .moveTo({ target: new Point(1, 1), duration: 1, progression: 'linear' })
      .delay(1)
      .moveTo({ target: new Point(2, 2), duration: 1, progression: 'linear' })
      .delay(1)
      .start();
    elem1.animator.nextFrame(0);
    elem1.animator.nextFrame(0.5);
    expect(elem1.getPosition().round()).toEqual(new Point(0.5, 0.5));

    elem1.animator.nextFrame(1);
    expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
    elem1.animator.nextFrame(1.5);
    expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
    elem1.animator.nextFrame(2);
    expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
    elem1.animator.nextFrame(2.5);
    expect(elem1.getPosition().round()).toEqual(new Point(1.5, 1.5));
    elem1.animator.nextFrame(3);
    expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
    elem1.animator.nextFrame(3.5);
    expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
    let remaining = elem1.animator.nextFrame(4);
    expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
    expect(math.round(remaining)).toBe(0);
    remaining = elem1.animator.nextFrame(4.1);
    expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
    expect(math.round(remaining)).toBe(0.1);
  });
  test('Delay separate elem1 in parallel method', () => {
    elem1.animator
      .moveTo({ target: new Point(1, 1), duration: 1, progression: 'linear' })
      .inParallel([
        elem1.sequence()
          .delay(1)
          .moveTo({ target: new Point(2, 2), duration: 1, progression: 'linear' }),
        elem2.moveTo({ target: new Point(1, 1), duration: 1, progression: 'linear' }),
      ])
      .start();
    // console.log(elem1.animator)
    // console.log(elem1.animator.steps[1])
    // console.log(elem1.animator.steps[1].steps)
    let remaining;
    remaining = elem1.animator.nextFrame(0);
    remaining = elem1.animator.nextFrame(0.5);
    expect(elem1.getPosition().round()).toEqual(new Point(0.5, 0.5));
    expect(elem2.getPosition().round()).toEqual(new Point(0, 0));
    expect(remaining).toBe(0);

    remaining = elem1.animator.nextFrame(1.5);
    expect(elem1.getPosition().round()).toEqual(new Point(1, 1));
    expect(elem2.getPosition().round()).toEqual(new Point(0.5, 0.5));

    remaining = elem1.animator.nextFrame(2.5);
    expect(elem1.getPosition().round()).toEqual(new Point(1.5, 1.5));
    expect(elem2.getPosition().round()).toEqual(new Point(1, 1));
    expect(remaining).toBe(0);

    remaining = elem1.animator.nextFrame(3.5);
    expect(elem1.getPosition().round()).toEqual(new Point(2, 2));
    expect(elem2.getPosition().round()).toEqual(new Point(1, 1));
    expect(math.round(remaining)).toBe(0.5);
  });
  // test('Target calculation with start transform not defined', () => {
  //   const delta = new Point(1, 1);
  //   const step = new PositionAnimationStep({
  //     elem1,
  //     delta,
  //   });
  //   expect(step.position.start).toBe(null);
  //   expect(step.position.target).toBe(null);

  //   const start = new Point(0, 0);
  //   elem1.setPosition(start);
  //   step.start();
  //   expect(step.position.target).toEqual(delta);
  //   expect(step.position.start).toEqual(start);
  // });
  // test('Velocity calculation', () => {
  //   const start = new Point(0, 0);
  //   const target = new Point(3, 3);
  //   const velocity = new Point(0.5, 0.5);
  //   // const start = elem1.transform.zero();
  //   // const target = elem1.transform.constant(3);
  //   // const velocity = elem1.transform.constant(0.5);
  //   const step = new PositionAnimationStep({
  //     elem1, start, target, velocity,
  //   });
  //   step.start();
  //   expect(step.duration).toBe(6);
  // });
  // test('Animation flow', () => {
  //   const start = new Point(0, 0);
  //   const target = new Point(1, 1);
  //   const step = new PositionAnimationStep({
  //     elem1,
  //     duration: 1,
  //     progression: 'linear',
  //     start,
  //     target,
  //   });
  //   step.start();
  //   expect(step.startTime).toBe(-1);

  //   step.nextFrame(100);
  //   expect(step.startTime).toBe(100);
  //   expect(step.elem1.getPosition()).toEqual(start);

  //   let remainingTime;
  //   remainingTime = step.nextFrame(100.1);
  //   expect(step.elem1.getPosition().round()).toEqual(new Point(0.1, 0.1));
  //   expect(remainingTime).toBe(0);

  //   remainingTime = step.nextFrame(100.55);
  //   expect(step.elem1.getPosition().round()).toEqual(new Point(0.55, 0.55));
  //   expect(remainingTime).toBe(0);

  //   remainingTime = step.nextFrame(100.9);
  //   expect(step.elem1.getPosition().round()).toEqual(new Point(0.9, 0.9));
  //   expect(remainingTime).toBe(0);

  //   remainingTime = step.nextFrame(101.1);
  //   expect(step.elem1.getPosition().round()).toEqual(target);
  //   expect(math.round(remainingTime)).toBe(0.1);
  // });
  // test('Duplication', () => {
  //   const start = new Point(0, 0);
  //   const target = new Point(3, 3);
  //   const step = new PositionAnimationStep({
  //     elem1,
  //     duration: 1,
  //     progression: 'linear',
  //     start,
  //     target,
  //   });
  //   const dup = step._dup();
  //   expect(dup).toEqual(step);
  //   expect(dup).not.toBe(step);
  //   expect(dup.elem1).toBe(step.elem1);
  // });
  // describe('Cancelling', () => {
  //   let step;
  //   let callbackFlag = 0;
  //   let start;
  //   let target;
  //   beforeEach(() => {
  //     start = new Point(0, 0);
  //     target = new Point(1, 1);
  //     step = new PositionAnimationStep({
  //       elem1,
  //       duration: 1,
  //       progression: 'linear',
  //       start,
  //       target,
  //       onFinish: () => { callbackFlag = 1; },
  //     });
  //   });
  //   const point = value => new Point(value, value);

  //   test('CompleteOnCancel = true, Default Force', () => {
  //     step.completeOnCancel = true;
  //     step.start();
  //     step.nextFrame(0);
  //     step.nextFrame(0.5);
  //     expect(elem1.getPosition().round()).toEqual(point(0.5));

  //     step.finish(true);
  //     expect(elem1.getPosition().round()).toEqual(target);
  //     expect(callbackFlag).toBe(1);
  //   });
  //   test('CompleteOnCancel = false, Default Force', () => {
  //     step.completeOnCancel = false;
  //     step.start();
  //     step.nextFrame(0);
  //     step.nextFrame(0.5);
  //     expect(elem1.getPosition().round()).toEqual(point(0.5));

  //     step.finish(true);
  //     expect(elem1.getPosition().round()).toEqual(point(0.5));
  //     expect(callbackFlag).toBe(1);
  //   });
  //   test('CompleteOnCancel = true, Force no complete', () => {
  //     step.completeOnCancel = true;
  //     step.start();
  //     step.nextFrame(0);
  //     step.nextFrame(0.5);
  //     expect(elem1.getPosition().round()).toEqual(point(0.5));

  //     step.finish(true, 'noComplete');
  //     expect(elem1.getPosition().round()).toEqual(point(0.5));
  //     expect(callbackFlag).toBe(1);
  //   });
  //   test('CompleteOnCancel = false, Force complete', () => {
  //     step.completeOnCancel = false;
  //     step.start();
  //     step.nextFrame(0);
  //     step.nextFrame(0.5);
  //     expect(elem1.getPosition().round()).toEqual(point(0.5));

  //     step.finish(true, 'complete');
  //     expect(elem1.getPosition().round()).toEqual(target);
  //     expect(callbackFlag).toBe(1);
  //   });
  // });
});
