import * as tools from '../../../../tools/tools';
import * as math from '../../../../tools/math';
import makeDiagram from '../../../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Dissolve Out Aniamtion', () => {
  let elem1;
  let callback;
  let color;
  beforeEach(() => {
    const diagram = makeDiagram();
    elem1 = diagram.objects.line();
    color = [0.5, 0.5, 0.5, 1];
    elem1.setColor(color);
    callback = jest.fn(() => {});
  });
  test('Simple dissolve out', () => {
    elem1.animations.new()
      .dissolveOut(1)
      .whenFinished(callback)
      .start();
    expect(elem1.color).toEqual(color);
    expect(elem1.isShown).toBe(true);
    elem1.animations.nextFrame(0);
    expect(elem1.color).toEqual(color);

    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.5]);

    elem1.animations.nextFrame(0.9);
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.1]);

    elem1.animations.nextFrame(1.0);
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 0.001]);
    expect(callback.mock.calls.length).toBe(0);

    elem1.animations.nextFrame(1.01);
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 1]);
    expect(callback.mock.calls.length).toBe(1);
    expect(elem1.isShown).toBe(false);
  });
  test('Simple dissolve when cancelled', () => {
    elem1.animations.new()
      .dissolveOut(1)
      .whenFinished(callback)
      .start();
    expect(elem1.color).toEqual(color);

    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.5]);
    elem1.animations.cancelAll();
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 1]);
    expect(callback.mock.calls.length).toBe(1);
    expect(elem1.isShown).toBe(false);
  });
  test('Cancel dissolve: completeOnCancel = false, force = null', () => {
    elem1.animations.new()
      .dissolveOut(1).whenFinished(callback).ifCanceledThenStop()
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    elem1.animations.cancelAll();
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.5]);
    expect(callback.mock.calls.length).toBe(1);
    expect(elem1.isShown).toBe(true);
  });
  test('Cancel dissolve: completeOnCancel = false, force = complete', () => {
    elem1.animations.new()
      .dissolveOut(1).whenFinished(callback).ifCanceledThenStop()
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    elem1.animations.cancelAll('complete');
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 1]);
    expect(callback.mock.calls.length).toBe(1);
    expect(elem1.isShown).toBe(false);
  });
  test('Cancel dissolve: completeOnCancel = false, force = noComplete', () => {
    elem1.animations.new()
      .dissolveOut(1).whenFinished(callback).ifCanceledThenStop()
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    elem1.animations.cancelAll('noComplete');
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.5]);
    expect(callback.mock.calls.length).toBe(1);
    expect(elem1.isShown).toBe(true);
  });
  test('Cancel dissolve: completeOnCancel = true, force = complete', () => {
    elem1.animations.new()
      .dissolveOut(1).whenFinished(callback).ifCanceledThenComplete()
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    elem1.animations.cancelAll('complete');
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 1]);
    expect(callback.mock.calls.length).toBe(1);
    expect(elem1.isShown).toBe(false);
  });
  test('Cancel dissolve: completeOnCancel = true, force = noComplete', () => {
    elem1.animations.new()
      .dissolveOut(1).whenFinished(callback).ifCanceledThenComplete()
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    elem1.animations.cancelAll('noComplete');
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.5]);
    expect(callback.mock.calls.length).toBe(1);
    expect(elem1.isShown).toBe(true);
  });
});
