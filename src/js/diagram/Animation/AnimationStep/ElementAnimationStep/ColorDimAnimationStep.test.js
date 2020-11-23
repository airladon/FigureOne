import * as tools from '../../../../tools/tools';
import * as math from '../../../../tools/math';
import makeDiagram from '../../../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Dim Animation', () => {
  let elem1;
  let callback;
  let color;
  let diagram;
  let dimColor;
  beforeEach(() => {
    diagram = makeDiagram();
    elem1 = diagram.collections.line();
    color = [1, 1, 1, 1];
    dimColor = [0.5, 0.5, 0.5, 1];
    elem1.setColor(color);
    elem1.setDimColor(dimColor);
    callback = jest.fn(() => {});
  });
  test('Simple dim', () => {
    elem1.animations.new()
      .dim(1)
      .whenFinished(callback)
      .start();

    expect(elem1.isShown).toBe(true);
    expect(math.round(elem1.color[0])).toEqual(1);

    elem1.animations.nextFrame(0);
    expect(math.round(elem1.color[0])).toEqual(1);

    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.color[0])).toEqual(0.75);

    elem1.animations.nextFrame(0.9);
    expect(math.round(elem1.color[0])).toEqual(0.55);

    elem1.animations.nextFrame(1.0);
    expect(math.round(elem1.color[0])).toEqual(0.5);
    expect(callback.mock.calls.length).toBe(1);
  });
  test('Simple undim', () => {
    elem1.animations.new()
      .dim(1)
      .start();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(1);

    elem1.animations.new()
      .undim(1)
      .whenFinished(callback)
      .start();

    expect(elem1.isShown).toBe(true);
    expect(math.round(elem1.color[0])).toEqual(0.5);

    elem1.animations.nextFrame(0);
    expect(math.round(elem1.color[0])).toEqual(0.5);

    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.color[0])).toEqual(0.75);

    elem1.animations.nextFrame(0.9);
    expect(math.round(elem1.color[0])).toEqual(0.95);

    elem1.animations.nextFrame(1.0);
    expect(math.round(elem1.color[0])).toEqual(1);
    expect(callback.mock.calls.length).toBe(1);
  });
});
