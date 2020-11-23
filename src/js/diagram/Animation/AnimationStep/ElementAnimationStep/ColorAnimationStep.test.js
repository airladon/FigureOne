import * as tools from '../../../../tools/tools';
import * as math from '../../../../tools/math';
import makeDiagram from '../../../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Color Animation', () => {
  let elem1;
  let callback;
  let color;
  beforeEach(() => {
    const diagram = makeDiagram();
    elem1 = diagram.collections.line();
    color = [0.1, 0.1, 0.1, 0.1];
    elem1.setColor(color);
    callback = jest.fn(() => {});
  });
  test('Simple color change', () => {
    elem1.animations.new()
      .color({ target: [0.2, 0.2, 0.2, 0.2], duration: 1 })
      .whenFinished(callback)
      .start();

    expect(math.round(elem1.color)).toEqual([0.1, 0.1, 0.1, 0.1]);

    elem1.animations.nextFrame(0);
    expect(math.round(elem1.color)).toEqual([0.1, 0.1, 0.1, 0.1]);

    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.color)).toEqual([0.15, 0.15, 0.15, 0.15]);

    elem1.animations.nextFrame(1.0);
    expect(math.round(elem1.color)).toEqual([0.2, 0.2, 0.2, 0.2]);
    expect(callback.mock.calls.length).toBe(1);

    // elem1.animations.nextFrame(1.01);
    // expect(math.round(elem1.color)).toEqual([0.2, 0.2, 0.2, 0.2]);
    // expect(callback.mock.calls.length).toBe(1);
  });
  test('Color change defined by delta color change', () => {
    elem1.animations.new()
      .color({ delta: [-0.1, -0.1, -0.1, -0.1], duration: 1 })
      .whenFinished(callback)
      .start();

    expect(math.round(elem1.color)).toEqual([0.1, 0.1, 0.1, 0.1]);

    elem1.animations.nextFrame(0);
    expect(math.round(elem1.color)).toEqual([0.1, 0.1, 0.1, 0.1]);

    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.color)).toEqual([0.05, 0.05, 0.05, 0.05]);

    elem1.animations.nextFrame(1.0);
    expect(math.round(elem1.color)).toEqual([0, 0, 0, 0]);
    expect(callback.mock.calls.length).toBe(1);

    // elem1.animations.nextFrame(1.01);
    // expect(math.round(elem1.color)).toEqual([0, 0, 0, 0]);
    // expect(callback.mock.calls.length).toBe(1);
  });
});
