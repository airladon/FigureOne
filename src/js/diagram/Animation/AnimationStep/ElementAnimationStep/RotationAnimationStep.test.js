import * as tools from '../../../../tools/tools';
import makeDiagram from '../../../../__mocks__/makeDiagram';
import * as math from '../../../../tools/math';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Rotation Animation Step', () => {
  let elem1;
  let diagram;
  beforeEach(() => {
    diagram = makeDiagram();
    elem1 = diagram.collections.line();
    elem1.setRotation(0);
    diagram.elements.add('elem1', elem1);
  });
  test('Simple rotate', () => {
    elem1.animations.new()
      .rotation({ target: 1, duration: 1 })
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
      .rotation({ delta: 1, duration: 1 })
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
      .rotation({
        start: 1, target: 0, direction: 1, duration: 1,
      })
      .start();

    elem1.animations.nextFrame(0);
    expect(math.round(elem1.getRotation())).toBe(1);

    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.getRotation(), 2)).toBe(3.64);

    elem1.animations.nextFrame(1.0);
    expect(math.round(elem1.getRotation(), 2)).toBe(0);

    // elem1.animations.nextFrame(1.1);
    // expect(math.round(elem1.getRotation(), 2)).toBe(0);
  });
  test('Rotate clip to 0to360', () => {
    elem1.animations.new()
      .rotation({
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
      .rotation({
        start: 0, target: 6.28, clipTo: '-180to180', duration: 1, direction: 1, progression: 'linear',
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
  test('Rotate with velocity', () => {
    elem1.animations.new()
      .rotation({
        start: 0, target: 1, velocity: 1, direction: 1, progression: 'linear',
      })
      .start();
    elem1.animations.nextFrame(0);
    expect(math.round(elem1.getRotation(), 2)).toBe(0);
    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.getRotation(), 2)).toBe(0.5);
    elem1.animations.nextFrame(1);
    expect(math.round(elem1.getRotation(), 2)).toBe(1);
  });
  test('Rotate with velocity, but no movement', () => {
    elem1.animations.new()
      .rotation({
        start: 1, target: 1, velocity: 1, direction: 1, progression: 'linear',
      })
      .start();
    expect(elem1.animations.state).toBe('idle');
    expect(elem1.animations.animations[0].state).toBe('finished');
    expect(math.round(elem1.getRotation(), 2)).toBe(1);
    diagram.draw(0);
    expect(elem1.animations.state).toBe('idle');
    expect(elem1.animations.animations).toHaveLength(0);
  });
});
