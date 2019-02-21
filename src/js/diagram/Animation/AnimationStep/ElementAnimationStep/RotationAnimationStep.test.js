import * as tools from '../../../../tools/tools';
import makeDiagram from '../../../../__mocks__/makeDiagram';
import * as math from '../../../../tools/math';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Animation Trigger', () => {
  let elem1;
  beforeEach(() => {
    const diagram = makeDiagram();
    elem1 = diagram.objects.line();
    elem1.setRotation(0);
  });
  test('Simple rotate', () => {
    elem1.animations.new()
      .rotateTo({ target: 1, duration: 1 })
      .start();

    elem1.animations.nextFrame(0);
    expect(math.round(elem1.getRotation())).toBe(0);

    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.getRotation())).toBe(0.5);

    elem1.animations.nextFrame(1.0);
    expect(math.round(elem1.getRotation())).toBe(1);

    elem1.animations.nextFrame(1.1);
    expect(math.round(elem1.getRotation())).toBe(1);
  });
  test('Simple rotate to delta', () => {
    elem1.animations.new()
      .rotateTo({ delta: 1, duration: 1 })
      .start();

    elem1.animations.nextFrame(0);
    expect(math.round(elem1.getRotation())).toBe(0);

    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.getRotation())).toBe(0.5);

    elem1.animations.nextFrame(1.0);
    expect(math.round(elem1.getRotation())).toBe(1);

    elem1.animations.nextFrame(1.1);
    expect(math.round(elem1.getRotation())).toBe(1);
  });
  test('Rotate counter clock wise', () => {
    elem1.animations.new()
      .rotateTo({
        start: 1, target: 0, rotDirection: 1, duration: 1,
      })
      .start();

    elem1.animations.nextFrame(0);
    expect(math.round(elem1.getRotation())).toBe(1);

    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.getRotation(), 2)).toBe(3.64);

    elem1.animations.nextFrame(1.0);
    expect(math.round(elem1.getRotation(), 2)).toBe(0);

    elem1.animations.nextFrame(1.1);
    expect(math.round(elem1.getRotation(), 2)).toBe(0);
  });
  test('Rotate clip to 0to360', () => {
    elem1.animations.new()
      .rotateTo({
        start: -1, target: 0, clipTo: '0to360', duration: 1,
      })
      .start();
    elem1.animations.nextFrame(0);
    expect(math.round(elem1.getRotation(), 2)).toBe(6.28 - 1);
    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.getRotation(), 2)).toBe(6.28 - 0.5);
    elem1.animations.nextFrame(1.0);
    expect(math.round(elem1.getRotation(), 2)).toBe(0);
    elem1.animations.nextFrame(1.1);
    expect(math.round(elem1.getRotation(), 2)).toBe(0);
  });
  test('Rotate clip to -180to180', () => {
    elem1.animations.new()
      .rotateTo({
        start: 0, target: 6.28, clipTo: '-180to180', duration: 1, rotDirection: 1, progression: 'linear',
      })
      .start();
    elem1.animations.nextFrame(0);
    expect(math.round(elem1.getRotation(), 2)).toBe(0);
    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.getRotation(), 2)).toBe(3.14);
    elem1.animations.nextFrame(0.75);
    expect(math.round(elem1.getRotation(), 2)).toBe(-3.14 / 2);
    elem1.animations.nextFrame(1.1);
    expect(math.round(elem1.getRotation(), 2)).toBe(0);
  });
});
