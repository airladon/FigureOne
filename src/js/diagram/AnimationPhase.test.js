import {
  TransformAnimationUnit,
  AnimationSerial,
  AnimationParallel,
} from './AnimationPhase';
// import {
//   Transform,
// } from '../tools/g2';
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
    expect(unit.state).toBe('idle');
    unit.start();
    expect(unit.state).toBe('animating');
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
  test('Animation flow', () => {
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
  describe('Cancelling', () => {
    let step;
    let callbackFlag = 0;
    let start;
    let target;
    beforeEach(() => {
      start = element.transform.zero();
      target = element.transform.constant(1);
      step = new TransformAnimationUnit({
        element,
        duration: 1,
        progression: 'linear',
        type: 'transform',
        transform: { start, target },
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
describe('Serial Animation', () => {
  let element;
  let step1;
  let step2;
  let step3;
  let target1;
  let target2;
  let target3;
  let serial;
  let step1CallbackFlag;
  let step2CallbackFlag;
  let step3CallbackFlag;
  let serialCallbackFlag;
  const step1Callback = () => { step1CallbackFlag += 1; };
  const step2Callback = () => { step2CallbackFlag += 1; };
  const step3Callback = () => { step3CallbackFlag += 1; };
  const serialCallback = () => { serialCallbackFlag += 1; };
  beforeEach(() => {
    const diagram = makeDiagram();
    step1CallbackFlag = 0;
    step2CallbackFlag = 0;
    step3CallbackFlag = 0;
    serialCallbackFlag = 0;
    element = diagram.objects.line();
    target1 = element.transform.constant(1);
    target2 = element.transform.constant(2);
    target3 = element.transform.constant(3);
    step1 = new TransformAnimationUnit({
      element,
      duration: 1,
      progression: 'linear',
      type: 'transform',
      transform: {
        start: element.transform.zero(),
        target: target1,
      },
      onFinish: step1Callback,
    });
    step2 = new TransformAnimationUnit({
      element,
      duration: 1,
      progression: 'linear',
      type: 'transform',
      transform: { target: target2 },
      onFinish: step2Callback,
    });
    step3 = new TransformAnimationUnit({
      element,
      duration: 1,
      progression: 'linear',
      type: 'transform',
      transform: { target: target3 },
      onFinish: step3Callback,
    });
    serial = new AnimationSerial({
      animations: [step1, step2, step3],
      onFinish: serialCallback,
    });
  });
  test('3 step animation on same element', () => {
    let remainingTime;
    expect(step1.state).toBe('idle');
    expect(step2.state).toBe('idle');
    expect(step3.state).toBe('idle');
    expect(serial.state).toBe('idle');
    serial.start();
    serial.nextFrame(100);
    expect(serial.index).toBe(0);
    expect(element.transform.round()).toEqual(element.transform.constant(0));
    expect(step1.state).toBe('animating');
    expect(step2.state).toBe('waitingToStart');
    expect(step3.state).toBe('waitingToStart');
    expect(serial.state).toBe('animating');

    serial.nextFrame(100.1);
    expect(serial.index).toBe(0);
    expect(element.transform.round()).toEqual(element.transform.constant(0.1));
    expect(step1.state).toBe('animating');
    expect(step2.state).toBe('waitingToStart');
    expect(step3.state).toBe('waitingToStart');
    expect(serial.state).toBe('animating');

    serial.nextFrame(100.9);
    expect(serial.index).toBe(0);
    expect(element.transform.round()).toEqual(element.transform.constant(0.9));

    serial.nextFrame(101);
    expect(serial.index).toBe(0);
    expect(element.transform.round()).toEqual(element.transform.constant(1));
    expect(step1.state).toBe('animating');
    expect(step2.state).toBe('waitingToStart');
    expect(step3.state).toBe('waitingToStart');
    expect(serial.state).toBe('animating');

    serial.nextFrame(101.01);
    expect(serial.index).toBe(1);
    expect(element.transform.round()).toEqual(element.transform.constant(1.01));
    expect(step1.state).toBe('idle');
    expect(step2.state).toBe('animating');
    expect(step3.state).toBe('waitingToStart');
    expect(serial.state).toBe('animating');

    serial.nextFrame(101.5);
    expect(serial.index).toBe(1);
    expect(element.transform.round()).toEqual(element.transform.constant(1.5));

    serial.nextFrame(102.5);
    expect(serial.index).toBe(2);
    expect(element.transform.round()).toEqual(element.transform.constant(2.5));
    expect(step1.state).toBe('idle');
    expect(step2.state).toBe('idle');
    expect(step3.state).toBe('animating');
    expect(serial.state).toBe('animating');

    remainingTime = serial.nextFrame(103);
    expect(serial.index).toBe(2);
    expect(element.transform.round()).toEqual(element.transform.constant(3));
    expect(math.round(remainingTime)).toBe(0);

    remainingTime = serial.nextFrame(103.1);
    expect(serial.index).toBe(2);
    expect(element.transform.round()).toEqual(element.transform.constant(3));
    expect(math.round(remainingTime)).toBe(0.1);
    expect(step1.state).toBe('idle');
    expect(step2.state).toBe('idle');
    expect(step3.state).toBe('idle');
    expect(serial.state).toBe('idle');
  });
  describe('Cancelling', () => {
    test('Complete on cancel = true, no forcing', () => {
      step1.completeOnCancel = true;
      step2.completeOnCancel = true;
      step3.completeOnCancel = true;
      serial.start();
      serial.nextFrame(100);
      serial.nextFrame(100.1);
      serial.finish(true);
      expect(step1CallbackFlag).toBe(1);
      expect(step2CallbackFlag).toBe(1);
      expect(step3CallbackFlag).toBe(1);
      expect(serialCallbackFlag).toBe(1);
      expect(element.transform.round()).toEqual(target3);
    });
    // Testing to make sure we still end at the target of step3
    test('Complete on cancel = true except middle step, no forcing', () => {
      step1.completeOnCancel = true;
      step2.completeOnCancel = false;
      step3.completeOnCancel = true;
      serial.start();
      serial.nextFrame(100);
      serial.nextFrame(100.1);
      serial.finish(true);
      expect(step1CallbackFlag).toBe(1);
      expect(step2CallbackFlag).toBe(1);
      expect(step3CallbackFlag).toBe(1);
      expect(serialCallbackFlag).toBe(1);
      expect(element.transform.round()).toEqual(target3);
    });
    // Testing to make sure we end at the target of step 2
    test('Complete on cancel = true except end step, no forcing', () => {
      step1.completeOnCancel = true;
      step2.completeOnCancel = true;
      step3.completeOnCancel = false;
      serial.start();
      serial.nextFrame(100);
      serial.nextFrame(100.1);
      serial.finish(true);
      expect(step1CallbackFlag).toBe(1);
      expect(step2CallbackFlag).toBe(1);
      expect(step3CallbackFlag).toBe(1);
      expect(serialCallbackFlag).toBe(1);
      expect(element.transform.round()).toEqual(target2);
    });
    // Testing to make sure only one callback for 1st step is called
    test('Complete on cancel = true after 1st step complete, no forcing', () => {
      step1.completeOnCancel = true;
      step2.completeOnCancel = true;
      step3.completeOnCancel = true;
      serial.start();
      serial.nextFrame(100);
      serial.nextFrame(101.1);
      serial.finish(true);
      expect(step1CallbackFlag).toBe(1);
      expect(step2CallbackFlag).toBe(1);
      expect(step3CallbackFlag).toBe(1);
      expect(serialCallbackFlag).toBe(1);
      expect(element.transform.round()).toEqual(target3);
    });
    // Testing to make target remains at current
    test('Complete on cancel = true, force noComplete', () => {
      step1.completeOnCancel = true;
      step2.completeOnCancel = true;
      step3.completeOnCancel = true;
      serial.start();
      serial.nextFrame(100);
      serial.nextFrame(101.1);
      serial.finish(true, 'noComplete');
      expect(step1CallbackFlag).toBe(1);
      expect(step2CallbackFlag).toBe(1);
      expect(step3CallbackFlag).toBe(1);
      expect(serialCallbackFlag).toBe(1);
      expect(element.transform.round()).toEqual(target2.constant(1.1));
    });
    // Testing to make sure non completion works
    test('Complete on cancel = false, no forcing', () => {
      step1.completeOnCancel = false;
      step2.completeOnCancel = false;
      step3.completeOnCancel = false;
      serial.start();
      serial.nextFrame(100);
      serial.nextFrame(101.1);
      serial.finish(true);
      expect(step1CallbackFlag).toBe(1);
      expect(step2CallbackFlag).toBe(1);
      expect(step3CallbackFlag).toBe(1);
      expect(serialCallbackFlag).toBe(1);
      expect(element.transform.round()).toEqual(target2.constant(1.1));
    });
    // Testing to make sure complete override works
    test('Complete on cancel = false, force complete', () => {
      step1.completeOnCancel = false;
      step2.completeOnCancel = false;
      step3.completeOnCancel = false;
      serial.start();
      serial.nextFrame(100);
      serial.nextFrame(101.1);
      serial.finish(true, 'complete');
      expect(step1CallbackFlag).toBe(1);
      expect(step2CallbackFlag).toBe(1);
      expect(step3CallbackFlag).toBe(1);
      expect(serialCallbackFlag).toBe(1);
      expect(element.transform.round()).toEqual(target3);
    });
  });
});
describe('Parallel Animation', () => {
  let element1;
  let element2;
  let element3;
  let target1;
  let target2;
  let target3;
  let duration1;
  let duration2;
  let duration3;
  let step1;
  let step2;
  let step3;
  let parallel;
  let step1CallbackFlag;
  let step2CallbackFlag;
  let step3CallbackFlag;
  let parallelCallbackFlag;
  const step1Callback = () => { step1CallbackFlag += 1; };
  const step2Callback = () => { step2CallbackFlag += 1; };
  const step3Callback = () => { step3CallbackFlag += 1; };
  const parallelCallback = () => { parallelCallbackFlag += 1; };
  beforeEach(() => {
    step1CallbackFlag = 0;
    step2CallbackFlag = 0;
    step3CallbackFlag = 0;
    parallelCallbackFlag = 0;
    const diagram = makeDiagram();
    element1 = diagram.objects.line();
    element2 = diagram.objects.line();
    element3 = diagram.objects.line();
    element1.transform = element1.transform.zero();
    element2.transform = element2.transform.zero();
    element3.transform = element3.transform.zero();
    target1 = element1.transform.constant(1);
    target2 = element2.transform.constant(2);
    target3 = element3.transform.constant(3);
    duration1 = 1;
    duration2 = 2;
    duration3 = 3;
    step1 = new TransformAnimationUnit({
      element: element1,
      duration: duration1,
      progression: 'linear',
      type: 'transform',
      transform: { target: target1 },
      onFinish: step1Callback,
    });
    step2 = new TransformAnimationUnit({
      element: element2,
      duration: duration2,
      progression: 'linear',
      type: 'transform',
      transform: { target: target2 },
      onFinish: step2Callback,
    });
    step3 = new TransformAnimationUnit({
      element: element3,
      duration: duration3,
      progression: 'linear',
      type: 'transform',
      transform: { target: target3 },
      onFinish: step3Callback,
    });

    parallel = new AnimationParallel({
      animations: [step1, step2, step3],
      onFinish: parallelCallback,
    });
  });
  test('3 element animation', () => {
    let remainingTime;
    const t1 = element1.transform;
    const t2 = element2.transform;
    const t3 = element3.transform;

    parallel.start();
    remainingTime = parallel.nextFrame(100);
    expect(element1.transform.round()).toEqual(element1.transform.constant(0));
    expect(element2.transform.round()).toEqual(element2.transform.constant(0));
    expect(element3.transform.round()).toEqual(element3.transform.constant(0));
    expect(math.round(remainingTime)).toBe(0);

    remainingTime = parallel.nextFrame(100.5);
    expect(element1.transform.round()).toEqual(t1.constant(0.5));
    expect(element2.transform).toEqual(t2.constant(0.5));
    expect(element3.transform).toEqual(t3.constant(0.5));
    expect(math.round(remainingTime)).toBe(0);

    remainingTime = parallel.nextFrame(101.5);
    expect(element1.transform.round()).toEqual(t1.constant(1));
    expect(element2.transform).toEqual(t2.constant(1.5));
    expect(element3.transform).toEqual(t3.constant(1.5));
    expect(math.round(remainingTime)).toBe(0);

    remainingTime = parallel.nextFrame(102.5);
    expect(element1.transform.round()).toEqual(t1.constant(1));
    expect(element2.transform).toEqual(t2.constant(2));
    expect(element3.transform).toEqual(t3.constant(2.5));
    expect(math.round(remainingTime)).toBe(0);

    remainingTime = parallel.nextFrame(103);
    expect(element1.transform.round()).toEqual(t1.constant(1));
    expect(element2.transform).toEqual(t2.constant(2));
    expect(element3.transform).toEqual(t3.constant(3));
    expect(math.round(remainingTime)).toBe(0);

    remainingTime = parallel.nextFrame(103.1);
    expect(element1.transform.round()).toEqual(t1.constant(1));
    expect(element2.transform).toEqual(t2.constant(2));
    expect(element3.transform).toEqual(t3.constant(3));
    expect(math.round(remainingTime)).toBe(0.1);
  });
  describe('Cancelling', () => {
    test('Complete on cancel = true, no forcing', () => {
      step1.completeOnCancel = true;
      step2.completeOnCancel = true;
      step3.completeOnCancel = true;
      parallel.start();
      parallel.nextFrame(100);
      parallel.nextFrame(100.1);
      parallel.finish(true);
      expect(step1CallbackFlag).toBe(1);
      expect(step2CallbackFlag).toBe(1);
      expect(step3CallbackFlag).toBe(1);
      expect(parallelCallbackFlag).toBe(1);
      expect(element1.transform.round()).toEqual(target1);
      expect(element2.transform.round()).toEqual(target2);
      expect(element3.transform.round()).toEqual(target3);
    });
    test('Complete on cancel = true for step 2 only, no forcing', () => {
      step1.completeOnCancel = false;
      step2.completeOnCancel = true;
      step3.completeOnCancel = false;
      parallel.start();
      parallel.nextFrame(100);
      parallel.nextFrame(100.1);
      parallel.finish(true);
      expect(step1CallbackFlag).toBe(1);
      expect(step2CallbackFlag).toBe(1);
      expect(step3CallbackFlag).toBe(1);
      expect(parallelCallbackFlag).toBe(1);
      expect(element1.transform.round()).toEqual(target1.constant(0.1));
      expect(element2.transform.round()).toEqual(target2);
      expect(element3.transform.round()).toEqual(target3.constant(0.1));
    });
    test('Complete on cancel = false, no forcing', () => {
      step1.completeOnCancel = false;
      step2.completeOnCancel = false;
      step3.completeOnCancel = false;
      parallel.start();
      parallel.nextFrame(100);
      parallel.nextFrame(100.1);
      parallel.finish(true);
      expect(step1CallbackFlag).toBe(1);
      expect(step2CallbackFlag).toBe(1);
      expect(step3CallbackFlag).toBe(1);
      expect(parallelCallbackFlag).toBe(1);
      expect(element1.transform.round()).toEqual(target1.constant(0.1));
      expect(element2.transform.round()).toEqual(target2.constant(0.1));
      expect(element3.transform.round()).toEqual(target3.constant(0.1));
    });
    test('Complete on cancel = false, force complete', () => {
      step1.completeOnCancel = false;
      step2.completeOnCancel = false;
      step3.completeOnCancel = false;
      parallel.start();
      parallel.nextFrame(100);
      parallel.nextFrame(100.1);
      parallel.finish(true, 'complete');
      expect(step1CallbackFlag).toBe(1);
      expect(step2CallbackFlag).toBe(1);
      expect(step3CallbackFlag).toBe(1);
      expect(parallelCallbackFlag).toBe(1);
      expect(element1.transform.round()).toEqual(target1);
      expect(element2.transform.round()).toEqual(target2);
      expect(element3.transform.round()).toEqual(target3);
    });
    test('Complete on cancel = true, force no complete', () => {
      step1.completeOnCancel = true;
      step2.completeOnCancel = true;
      step3.completeOnCancel = true;
      parallel.start();
      parallel.nextFrame(100);
      parallel.nextFrame(100.1);
      parallel.finish(true, 'noComplete');
      expect(step1CallbackFlag).toBe(1);
      expect(step2CallbackFlag).toBe(1);
      expect(step3CallbackFlag).toBe(1);
      expect(parallelCallbackFlag).toBe(1);
      expect(element1.transform.round()).toEqual(target1.constant(0.1));
      expect(element2.transform.round()).toEqual(target2.constant(0.1));
      expect(element3.transform.round()).toEqual(target3.constant(0.1));
    });
  });
});
