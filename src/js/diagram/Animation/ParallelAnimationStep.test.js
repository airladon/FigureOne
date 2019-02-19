import ParallelAnimationStep from './ParallelAnimationStep';
import TransformAnimationStep from './TransformAnimationStep';
import * as tools from '../../tools/tools';
import * as math from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

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
    step1 = new TransformAnimationStep({
      element: element1,
      duration: duration1,
      progression: 'linear',
      type: 'transform',
      transform: { target: target1 },
      onFinish: step1Callback,
    });
    step2 = new TransformAnimationStep({
      element: element2,
      duration: duration2,
      progression: 'linear',
      type: 'transform',
      transform: { target: target2 },
      onFinish: step2Callback,
    });
    step3 = new TransformAnimationStep({
      element: element3,
      duration: duration3,
      progression: 'linear',
      type: 'transform',
      transform: { target: target3 },
      onFinish: step3Callback,
    });

    parallel = new ParallelAnimationStep({
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
