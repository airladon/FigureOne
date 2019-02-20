import * as tools from '../../../../tools/tools';
import * as math from '../../../../tools/math';
import makeDiagram from '../../../../__mocks__/makeDiagram';
import {
  Point,
} from '../../../../tools/g2';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Transfrom Animation Unit', () => {
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
    elem1.animator
      .dissolveOut(1)
      .whenFinished(callback)
      .start();
    expect(elem1.color).toEqual(color);
    expect(elem1.isShown).toBe(true);
    elem1.animator.nextFrame(0);
    expect(elem1.color).toEqual(color);

    elem1.animator.nextFrame(0.5);
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.5]);

    elem1.animator.nextFrame(0.9);
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.1]);

    elem1.animator.nextFrame(1.0);
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 0.001]);
    expect(callback.mock.calls.length).toBe(0);

    elem1.animator.nextFrame(1.01);
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 1]);
    expect(callback.mock.calls.length).toBe(1);
    expect(elem1.isShown).toBe(false);
  });
  test('Simple dissolve when cancelled', () => {
    elem1.animator
      .dissolveOut(1)
      .whenFinished(callback)
      .start();
    expect(elem1.color).toEqual(color);

    elem1.animator.nextFrame(0);
    elem1.animator.nextFrame(0.5);
    expect(math.round(elem1.color, 2)).toEqual([0.5, 0.5, 0.5, 0.5]);
    elem1.animator.cancel();
    expect(math.round(elem1.color)).toEqual([0.5, 0.5, 0.5, 1]);
    expect(callback.mock.calls.length).toBe(1);
    expect(elem1.isShown).toBe(false);
  });
});
