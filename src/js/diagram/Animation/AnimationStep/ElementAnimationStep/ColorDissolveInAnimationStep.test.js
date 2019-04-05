import * as tools from '../../../../tools/tools';
import * as math from '../../../../tools/math';
import makeDiagram from '../../../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Disolve In Animation', () => {
  let elem1;
  let callback;
  let color;
  let diagram;
  beforeEach(() => {
    diagram = makeDiagram();
    elem1 = diagram.objects.line();
    color = [0.5, 0.5, 0.5, 1];
    elem1.setColor(color);
    elem1.hide();
    callback = jest.fn(() => {});
  });
  test('Simple dissolve in', () => {
    expect(elem1.isShown).toBe(false);

    elem1.animations.new()
      .dissolveIn(1)
      .whenFinished(callback)
      .start();

    expect(elem1.isShown).toBe(true);
    expect(math.round(elem1.opacity)).toEqual(0.001);

    elem1.animations.nextFrame(0);
    expect(math.round(elem1.opacity)).toEqual(0.001);

    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.opacity, 2)).toEqual(0.5);

    elem1.animations.nextFrame(0.9);
    expect(math.round(elem1.opacity, 2)).toEqual(0.9);

    elem1.animations.nextFrame(1.0);
    expect(math.round(elem1.opacity)).toEqual(1);
    expect(callback.mock.calls.length).toBe(0);

    elem1.animations.nextFrame(1.01);
    expect(math.round(elem1.opacity)).toEqual(1);
    expect(callback.mock.calls.length).toBe(1);
  });
  test('Dissolve in from semi-transparent start', () => {
    elem1.setColor([0.5, 0.5, 0.5, 0.5]);
    elem1.opacity = 0.5;
    elem1.animations.new()
      .dissolveIn(1)
      .whenFinished(callback)
      .start();
    expect(math.round(elem1.opacity)).toEqual(0.001);
    elem1.animations.nextFrame(0);
    expect(math.round(elem1.opacity)).toEqual(0.001);

    elem1.animations.nextFrame(1.01);
    expect(math.round(elem1.opacity, 2)).toEqual(1);
    expect(callback.mock.calls.length).toBe(1);
  });
  test('Dissolve when cancelled', () => {
    elem1.animations.new()
      .dissolveIn(1)
      .whenFinished(callback)
      .start();
    expect(math.round(elem1.opacity)).toEqual(0.001);
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.opacity, 2)).toEqual(0.5);
    elem1.animations.cancelAll();
    expect(math.round(elem1.opacity)).toEqual(1);
    expect(callback.mock.calls.length).toBe(1);
  });
  test('Parallel dissolve in cancel', () => {
    diagram.elements.animations.new()
      .inParallel([
        elem1.anim.dissolveIn(1),
      ])
      .start();
    diagram.elements.animations.nextFrame(0);
    diagram.elements.animations.nextFrame(0.5);
    expect(math.round(elem1.opacity, 2)).toEqual(0.5);
    diagram.elements.animations.cancelAll();
    expect(math.round(elem1.opacity, 2)).toEqual(1);
  });
  test('Cancel dissolve: completeOnCancel = false, force = null', () => {
    elem1.animations.new()
      .dissolveIn(1).whenFinished(callback).ifCanceledThenStop()
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    elem1.animations.cancelAll();
    expect(math.round(elem1.opacity, 2)).toEqual(0.5);
    expect(callback.mock.calls.length).toBe(1);
  });
  test('Cancel dissolve: completeOnCancel = false, force = complete', () => {
    elem1.animations.new()
      .dissolveIn(1).whenFinished(callback).ifCanceledThenStop()
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    elem1.animations.cancelAll('complete');
    expect(math.round(elem1.opacity, 2)).toEqual(1);
    expect(callback.mock.calls.length).toBe(1);
  });
  test('Cancel dissolve: completeOnCancel = false, force = noComplete', () => {
    elem1.animations.new()
      .dissolveIn(1).whenFinished(callback).ifCanceledThenStop()
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    elem1.animations.cancelAll('noComplete');
    expect(math.round(elem1.opacity, 2)).toEqual(0.5);
    expect(callback.mock.calls.length).toBe(1);
  });
  test('Cancel dissolve: completeOnCancel = true, force = complete', () => {
    elem1.animations.new()
      .dissolveIn(1).whenFinished(callback).ifCanceledThenComplete()
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    elem1.animations.cancelAll('complete');
    expect(math.round(elem1.opacity, 2)).toEqual(1);
    expect(callback.mock.calls.length).toBe(1);
  });
  test('Cancel dissolve: completeOnCancel = true, force = noComplete', () => {
    elem1.animations.new()
      .dissolveIn(1).whenFinished(callback).ifCanceledThenComplete()
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);
    elem1.animations.cancelAll('noComplete');
    expect(math.round(elem1.opacity, 2)).toEqual(0.5);
    expect(callback.mock.calls.length).toBe(1);
  });
});
