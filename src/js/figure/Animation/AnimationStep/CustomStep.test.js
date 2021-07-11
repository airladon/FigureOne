import * as tools from '../../../tools/tools';
import * as math from '../../../tools/math';
import makeFigure from '../../../__mocks__/makeFigure';
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
  let figure;
  beforeEach(() => {
    figure = makeFigure();
    elem1 = figure.collections.line();
    figure.elements.add('elem1', elem1);
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
  test('Simple from figure', () => {
    elem1.animations.new()
      .custom({ duration: 1, callback: custom })
      .start();
    figure.draw(0);
    figure.draw(0.1);
    expect(percentComplete).toBe(0.1);
    figure.draw(0.2);
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
  test.only('infinite duration with a cancel clause', () => {
    elem1.animations.new()
      .custom({
        duration: null,
        callback: (deltaTime) => {
          if (deltaTime > 20) {
            elem1.setPosition(20, 0);
            return true;
          }
          elem1.setPosition(deltaTime, 0);
          return false;
        },
      })
      .start();
    elem1.animations.nextFrame(0);
    expect(elem1.getPosition().round().x).toBe(0);
    elem1.animations.nextFrame(1.5);
    expect(elem1.getPosition().round().x).toBe(1.5);
    elem1.animations.nextFrame(10.5);
    expect(elem1.getPosition().round().x).toBe(10.5);
    expect(elem1.animations.state).toBe('animating');
    elem1.animations.nextFrame(30.5);
    expect(elem1.getPosition().round().x).toBe(20);
    expect(elem1.animations.state).toBe('idle');
  });
});
