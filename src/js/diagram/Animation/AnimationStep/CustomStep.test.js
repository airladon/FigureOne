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
  let diagram;
  beforeEach(() => {
    diagram = makeDiagram();
    elem1 = diagram.collections.line();
    diagram.elements.add('elem1', elem1);
    elem1.setPosition(new Point(0, 0));
    percentComplete = 0;
    custom = jest.fn((p) => { percentComplete = p; });
    callback = jest.fn(() => {});
  });
  test('Simple', () => {
    elem1.animations.new()
      .custom({ duration: 1, callback: custom })
      .start();
    expect(percentComplete).toBe(0);
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.1);
    expect(percentComplete).toBe(0.1);
    elem1.animations.nextFrame(0.9);
    expect(percentComplete).toBe(0.9);
    elem1.animations.nextFrame(1);
    expect(percentComplete).toBe(1);
    elem1.animations.nextFrame(1.1);
    expect(percentComplete).toBe(1);
  });
  test('Simple from diagram', () => {
    elem1.animations.new()
      .custom({ duration: 1, callback: custom })
      .start();
    diagram.draw(0);
    diagram.draw(0.1);
    expect(percentComplete).toBe(0.1);
    diagram.draw(0.2);
    expect(percentComplete).toBe(0.2);
  });
  // A 25% start offset for 1 second duration will result in a start time
  // offset of 0.366s, and duration of 0.634.
  test('Start Offset for easeinout', () => {
    elem1.animations.new()
      .custom({
        duration: 1,
        callback: custom,
        progression: 'easeinout',
        startPercent: 0.25,
      })
      .start();
    expect(percentComplete).toBe(0);
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.1);
    expect(math.round(percentComplete, 3)).toBe(0.432);
    elem1.animations.nextFrame(1 - 0.366);
    expect(math.round(percentComplete)).toBe(1);
  });
  test('Cancel', () => {
    elem1.animations.new()
      .custom({ duration: 1, callback: custom })
      .whenFinished(callback)
      .ifCanceledThenComplete()
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    elem1.animations.cancelAll();
    expect(percentComplete).toBe(1);
    expect(callback.mock.calls.length).toBe(1);
  });
});
