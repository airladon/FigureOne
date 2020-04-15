import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';
import * as math from '../tools/math';

tools.isTouchDevice = jest.fn();

jest.mock('./Gesture');
jest.mock('./webgl/webgl');
jest.mock('./DrawContext2D');

describe('Animation Step State', () => {
  let elem1;
  let diagram;
  let now;
  beforeEach(() => {
    diagram = makeDiagram();
    elem1 = diagram.objects.line();
    diagram.elements.add('elem1', elem1);
    global.performance.now = () => now * 1000;
  });
  test('Rotation', () => {
    elem1.setRotation(0);
    elem1.animations.new()
      .rotation({ target: 3, duration: 3, progression: 'linear' })
      .start();
    now = 0;
    diagram.draw(now);
    now = 0.5;
    diagram.draw(now);
    expect(elem1.getRotation()).toBe(0.5);
    const state = diagram.getState();
    now = 1;
    diagram.draw(now);
    expect(elem1.getRotation()).toBe(1);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.5);

    now = 11.1;
    diagram.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.6);

    now = 11.5;
    diagram.draw(now);
    expect(math.round(elem1.getRotation())).toBe(1);
  });
  test('Position', () => {
    elem1.animations.new()
      .position({ target: [3, 0], duration: 3, progression: 'linear' })
      .start();
    now = 0;
    diagram.draw(now);
    now = 0.5;
    diagram.draw(now);
    expect(elem1.getPosition().x).toBe(0.5);
    const state = diagram.getState();
    now = 1;
    diagram.draw(now);
    expect(elem1.getPosition().x).toBe(1);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(0.5);

    now = 11.1;
    diagram.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(0.6);

    now = 11.5;
    diagram.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
  });
  test('Scale', () => {
    elem1.setScale(0);
    elem1.animations.new()
      .scale({ target: [3, 0], duration: 3, progression: 'linear' })
      .start();
    now = 0;
    diagram.draw(now);
    now = 0.5;
    diagram.draw(now);
    expect(elem1.getScale().x).toBe(0.5);
    const state = diagram.getState();
    now = 1;
    diagram.draw(now);
    expect(elem1.getScale().x).toBe(1);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(math.round(elem1.getScale().x)).toBe(0.5);

    now = 11.1;
    diagram.draw(now);
    expect(math.round(elem1.getScale().x)).toBe(0.6);

    now = 11.5;
    diagram.draw(now);
    expect(math.round(elem1.getScale().x)).toBe(1);
  });
});
