import { ParallelAnimationStep } from './ParallelAnimationStep';
import TransformAnimationStep from './ElementAnimationStep/TransformAnimationStep';
import * as tools from '../../../tools/tools';
import * as math from '../../../tools/math';
import makeDiagram from '../../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

describe('Parallel Animation', () => {
  describe('Step only', () => {
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
        target: target1,
        onFinish: step1Callback,
      });
      step2 = new TransformAnimationStep({
        element: element2,
        duration: duration2,
        progression: 'linear',
        type: 'transform',
        target: target2,
        onFinish: step2Callback,
      });
      step3 = new TransformAnimationStep({
        element: element3,
        duration: duration3,
        progression: 'linear',
        type: 'transform',
        target: target3,
        onFinish: step3Callback,
      });

      parallel = new ParallelAnimationStep({
        steps: [step1, step2, step3],
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
    test('Duplication', () => {
      const dup = parallel._dup();
      expect(dup).toEqual(parallel);
      expect(dup).not.toBe(parallel);
    });
    describe('Cancelling', () => {
      test('Parallel complete on cancel = true forces all steps to complete', () => {
        step1.completeOnCancel = false;
        step2.completeOnCancel = false;
        step3.completeOnCancel = false;
        parallel.completeOnCancel = true;
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
      // checking override of step completeOnCancel
      test('Complete on cancel = false forces all steps to stop', () => {
        step1.completeOnCancel = true;
        step2.completeOnCancel = true;
        step3.completeOnCancel = true;
        parallel.completeOnCancel = false;
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
      test('Parallel complete on cancel = true with force noComplete', () => {
        step1.completeOnCancel = true;
        step2.completeOnCancel = true;
        step3.completeOnCancel = false;
        parallel.completeOnCancel = true;
        parallel.start();
        parallel.nextFrame(100);
        parallel.nextFrame(100.1);
        parallel.cancel('noComplete');
        expect(step1CallbackFlag).toBe(1);
        expect(step2CallbackFlag).toBe(1);
        expect(step3CallbackFlag).toBe(1);
        expect(parallelCallbackFlag).toBe(1);
        expect(element1.transform.round()).toEqual(target1.constant(0.1));
        expect(element2.transform.round()).toEqual(target2.constant(0.1));
        expect(element3.transform.round()).toEqual(target3.constant(0.1));
      });
      test('Complete on cancel = false forces with force complete', () => {
        step1.completeOnCancel = true;
        step2.completeOnCancel = true;
        step3.completeOnCancel = false;
        parallel.completeOnCancel = false;
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
  describe('From Diagram', () => {
    let elem1;
    let elem2;
    let diagram;
    beforeEach(() => {
      diagram = makeDiagram();
      elem1 = diagram.objects.line();
      elem2 = diagram.objects.line();
    });
    test('Zero duration two steps', () => {
      // elem1.setRotation(1);
      // elem2.setRotation(1);
      diagram.elements.animations.new()
        .inParallel([
          elem1.anim.rotation({ target: 1, duration: 0 }),
          elem2.anim.rotation({ target: 2, duration: 0 }),
        ])
        .whenFinished(() => {})
        .start();
      const animationManager = diagram.elements.animations;
      const builder = animationManager.animations[0];
      const inParallel = builder.steps[0];
      const e1 = inParallel.steps[0];
      const e2 = inParallel.steps[1];
      expect(animationManager.state).toBe('idle');
      expect(builder.state).toBe('finished');
      expect(inParallel.state).toBe('finished');
      expect(e1.state).toBe('finished');
      expect(e2.state).toBe('finished');
      expect(elem2.getRotation()).toBe(2);
      diagram.draw(0);
      expect(animationManager.animations).toHaveLength(0);
      // diagram.draw(0.01);
      // console.log(diagram.elements.animations.state)
      // diagram.draw(1);
      
      

      // elem1.animations.nextFrame(0.5);
      // expect(math.round(elem1.opacity, 2)).toEqual(0.5);

      // elem1.animations.nextFrame(0.9);
      // expect(math.round(elem1.opacity, 2)).toEqual(0.1);

      // elem1.animations.nextFrame(1.0);
      // expect(math.round(elem1.opacity)).toEqual(0.001);
      // expect(callback.mock.calls.length).toBe(0);

      // elem1.animations.nextFrame(1.01);
      // expect(math.round(elem1.opacity)).toEqual(1);
      // expect(callback.mock.calls.length).toBe(1);
      // expect(elem1.isShown).toBe(false);
    });
  });
});