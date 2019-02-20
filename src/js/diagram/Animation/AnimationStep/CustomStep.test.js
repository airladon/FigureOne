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
  let custom;
  let percentComplete;
  let callback;
  beforeEach(() => {
    const diagram = makeDiagram();
    elem1 = diagram.objects.line();
    elem1.setPosition(new Point(0, 0));
    percentComplete = 0;
    custom = jest.fn((p) => { percentComplete = p; });
    callback = jest.fn(() => {});
  });
  test('Simple', () => {
    elem1.animator
      .custom({ duration: 1, callback: custom })
      .start();
    expect(percentComplete).toBe(0);
    elem1.animator.nextFrame(0);
    elem1.animator.nextFrame(0.1);
    expect(percentComplete).toBe(0.1);
    elem1.animator.nextFrame(0.9);
    expect(percentComplete).toBe(0.9);
    elem1.animator.nextFrame(1);
    expect(percentComplete).toBe(1);
    elem1.animator.nextFrame(1.1);
    expect(percentComplete).toBe(1);
  });
  // A 25% start offset for 1 second duration will result in a start time
  // offset of 0.366s, and duration of 0.634.
  test('Start Offset for easeinout', () => {
    elem1.animator
      .custom({
        duration: 1,
        callback: custom,
        progression: 'easeinout',
        startPercent: 0.25,
      })
      .start();
    expect(percentComplete).toBe(0);
    elem1.animator.nextFrame(0);
    elem1.animator.nextFrame(0.1);
    expect(math.round(percentComplete, 3)).toBe(0.432);
    elem1.animator.nextFrame(1 - 0.366);
    expect(math.round(percentComplete)).toBe(1);
  });
  test('Cancel', () => {
    elem1.animator
      .custom({ duration: 1, callback: custom })
      .whenFinished(callback)
      .ifCanceledThenComplete()
      .start();
    elem1.animator.nextFrame(0);
    elem1.animator.nextFrame(0.5);
    elem1.animator.cancel();
    expect(percentComplete).toBe(1);
    expect(callback.mock.calls.length).toBe(1);
  });
});
