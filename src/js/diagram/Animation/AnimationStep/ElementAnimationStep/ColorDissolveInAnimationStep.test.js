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
  beforeEach(() => {
    const diagram = makeDiagram();
    elem1 = diagram.objects.line();
    color = [0.5, 0.5, 0.5, 1];
    elem1.setColor(color);
    elem1.hide();
    callback = jest.fn(() => {});
  });
  test('Simple dissolve in', () => {
    expect(elem1.isShown).toBe(false);

    elem1.animator
      .dissolveIn(1)
      .whenFinished(callback)
      .start();

    expect(elem1.isShown).toBe(true);
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 0.001]);

    elem1.animator.nextFrame(0);
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 0.001]);

    elem1.animator.nextFrame(0.5);
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.5]);

    elem1.animator.nextFrame(0.9);
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.9]);

    elem1.animator.nextFrame(1.0);
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 1]);
    expect(callback.mock.calls.length).toBe(0);

    elem1.animator.nextFrame(1.01);
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 1]);
    expect(callback.mock.calls.length).toBe(1);
  });
  test('Dissolve in from semi-transparent start', () => {
    elem1.setColor([0.5, 0.5, 0.5, 0.5]);
    elem1.animator
      .dissolveIn(1)
      .whenFinished(callback)
      .start();
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 0.001]);
    elem1.animator.nextFrame(0);
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 0.001]);

    elem1.animator.nextFrame(1.01);
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.5]);
    expect(callback.mock.calls.length).toBe(1);
  });
  test('Dissolve when cancelled', () => {
    elem1.animator
      .dissolveIn(1)
      .whenFinished(callback)
      .start();
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 0.001]);
    elem1.animator.nextFrame(0);
    elem1.animator.nextFrame(0.5);
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.5]);
    elem1.animator.cancel();
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 1]);
    expect(callback.mock.calls.length).toBe(1);
  });
});
