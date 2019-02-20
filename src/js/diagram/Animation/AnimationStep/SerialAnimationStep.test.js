import { SerialAnimationStep } from './SerialAnimationStep';
import TransformAnimationStep from './ElementAnimationStep/TransformAnimationStep';
import * as tools from '../../../tools/tools';
import * as math from '../../../tools/math';
import makeDiagram from '../../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

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
    step1 = new TransformAnimationStep({
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
    step2 = new TransformAnimationStep({
      element,
      duration: 1,
      progression: 'linear',
      type: 'transform',
      transform: { target: target2 },
      onFinish: step2Callback,
    });
    step3 = new TransformAnimationStep({
      element,
      duration: 1,
      progression: 'linear',
      type: 'transform',
      transform: { target: target3 },
      onFinish: step3Callback,
    });
    serial = new SerialAnimationStep({
      steps: [step1, step2, step3],
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
  test('Duplication', () => {
    const dup = serial._dup();
    expect(dup).toEqual(serial);
    expect(dup).not.toBe(serial);
  });
  describe('Cancelling', () => {
    test('Serial Complete on cancel = true forces all steps to cancel', () => {
      step1.completeOnCancel = false;
      step2.completeOnCancel = false;
      step3.completeOnCancel = false;
      serial.completeOnCancel = true;
      serial.start();
      serial.nextFrame(100);
      serial.nextFrame(100.1);
      serial.cancel();
      expect(element.transform.round()).toEqual(target3);
    });
    test('Serial Complete on cancel = false forces all steps to cancel', () => {
      step1.completeOnCancel = true;
      step2.completeOnCancel = true;
      step3.completeOnCancel = true;
      serial.completeOnCancel = false;
      serial.start();
      serial.nextFrame(100);
      serial.nextFrame(100.1);
      serial.cancel();
      expect(element.transform.round()).toEqual(target1.constant(0.1));
    });
    test('Serial Complete on cancel = false overridden by force', () => {
      step1.completeOnCancel = true;
      step2.completeOnCancel = true;
      step3.completeOnCancel = true;
      serial.completeOnCancel = false;
      serial.start();
      serial.nextFrame(100);
      serial.nextFrame(100.1);
      serial.cancel('complete');
      expect(element.transform.round()).toEqual(target3);
    });
    test('Serial Complete on cancel = true overriden by cancel', () => {
      step1.completeOnCancel = false;
      step2.completeOnCancel = false;
      step3.completeOnCancel = false;
      serial.completeOnCancel = true;
      serial.start();
      serial.nextFrame(100);
      serial.nextFrame(100.1);
      serial.cancel('noComplete');
      expect(element.transform.round()).toEqual(target1.constant(0.1));
    });
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
