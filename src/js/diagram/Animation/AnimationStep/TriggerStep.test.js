import { TriggerStep } from './TriggerStep';
import * as tools from '../../../tools/tools';
import makeDiagram from '../../../__mocks__/makeDiagram';
import {
  Point,
} from '../../../tools/g2';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');


describe('Animation Trigger', () => {
  let elem1;
  let elem2;
  let trigger1;
  let trigger2;
  let triggerFlag1;
  let triggerFlag2;
  beforeEach(() => {
    const diagram = makeDiagram();
    elem1 = diagram.objects.line();
    elem1.setPosition(new Point(0, 0));
    elem2 = diagram.objects.line();
    elem2.setPosition(new Point(0, 0));
    triggerFlag1 = 0;
    triggerFlag2 = 0;
    trigger1 = () => { triggerFlag1 = 1; };
    trigger2 = () => { triggerFlag2 = 1; };
  });
  test('Instantiation', () => {
    const onFinish = () => {};
    const completeOnCancel = false;
    const step = new TriggerStep({
      onFinish,
      completeOnCancel,
      callback: trigger1,
    });
    expect(step.onFinish).toBe(onFinish);
    expect(step.callback).toBe(trigger1);
    expect(step.completeOnCancel).toBe(completeOnCancel);
  });
  test('Delay then move', () => {
    elem1.animations.new()
      .delay(1)
      .trigger(trigger1)
      .position({ target: new Point(1, 1), duration: 1, progression: 'linear' })
      .trigger(trigger2)
      .delay(1)
      .start();

    elem1.animations.nextFrame(0);
    expect(triggerFlag1).toBe(0);
    expect(triggerFlag2).toBe(0);

    elem1.animations.nextFrame(0.5);
    expect(triggerFlag1).toBe(0);
    expect(triggerFlag2).toBe(0);

    elem1.animations.nextFrame(1);
    expect(triggerFlag1).toBe(0);
    expect(triggerFlag2).toBe(0);

    elem1.animations.nextFrame(1.01);
    expect(triggerFlag1).toBe(1);
    expect(triggerFlag2).toBe(0);
  });
  test('Zero duration', () => {
    expect(triggerFlag1).toBe(0);
    expect(triggerFlag2).toBe(0);
    elem1.animations.new()
      .trigger({ callback: trigger1, duration: 0 })
      .trigger({ callback: trigger2, duration: 0 })
      .start();
    expect(triggerFlag1).toBe(1);
    expect(triggerFlag2).toBe(1);
  });
});
