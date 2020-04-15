import * as tools from '../tools/tools';
import { Transform } from '../tools/g2';
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
  test('Transform', () => {
    elem1.transform = new Transform().scale(0, 0).rotate(0).translate(0, 0);
    elem1.animations.new()
      .transform({
        target: new Transform().scale(3, 0).rotate(3).translate(3, 0),
        duration: 3,
        progression: 'linear',
      })
      .start();
    now = 0;
    diagram.draw(now);
    now = 0.5;
    diagram.draw(now);
    expect(elem1.getScale().x).toBe(0.5);
    expect(elem1.getPosition().x).toBe(0.5);
    expect(elem1.getRotation()).toBe(0.5);
    const state = diagram.getState();
    now = 1;
    diagram.draw(now);
    expect(elem1.getScale().x).toBe(1);
    expect(elem1.getPosition().x).toBe(1);
    expect(elem1.getRotation()).toBe(1);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(math.round(elem1.getScale().x)).toBe(0.5);
    expect(math.round(elem1.getPosition().x)).toBe(0.5);
    expect(math.round(elem1.getRotation())).toBe(0.5);

    now = 11.1;
    diagram.draw(now);
    expect(math.round(elem1.getScale().x)).toBe(0.6);
    expect(math.round(elem1.getPosition().x)).toBe(0.6);
    expect(math.round(elem1.getRotation())).toBe(0.6);

    now = 11.5;
    diagram.draw(now);
    expect(math.round(elem1.getScale().x)).toBe(1);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(1);
  });
  test('Color', () => {
    elem1.color = [0.3, 1, 1, 1];
    elem1.animations.new()
      .color({
        target: [0.6, 1, 1, 1],
        duration: 3,
        progression: 'linear',
      })
      .start();
    now = 0;
    diagram.draw(now);
    now = 0.5;
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.35);
    const state = diagram.getState();
    now = 1;
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.4);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.35);

    now = 11.1;
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.36);

    now = 11.5;
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.4);
  });
  test('Dim Color', () => {
    elem1.color = [0.3, 1, 1, 1];
    elem1.dimColor = [0.6, 1, 1, 1];
    elem1.animations.new()
      .dim(3)
      .start();
    now = 0;
    diagram.draw(now);
    now = 0.5;
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.35);
    const state = diagram.getState();
    now = 1;
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.4);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.35);

    now = 11.1;
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.36);

    now = 11.5;
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.4);
  });
  test('Undim Color', () => {
    elem1.defaultColor = [0.6, 1, 1, 1];
    elem1.color = [0.3, 1, 1, 1];
    elem1.animations.new()
      .undim(3)
      .start();
    now = 0;
    diagram.draw(now);
    now = 0.5;
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.35);
    const state = diagram.getState();
    now = 1;
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.4);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.35);

    now = 11.1;
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.36);

    now = 11.5;
    diagram.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.4);
  });
  test('Dissolve In', () => {
    elem1.animations.new()
      .dissolveIn(3)
      .start();
    now = 0;
    diagram.draw(now);
    now = 0.5;
    diagram.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.1675);
    const state = diagram.getState();
    now = 1;
    diagram.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.334);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.1675);

    now = 11.1;
    diagram.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.2008);

    now = 11.5;
    diagram.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.334);
  });
  test('Dissolve Out', () => {
    elem1.animations.new()
      .dissolveOut(3)
      .start();
    now = 0;
    diagram.draw(now);
    now = 0.5;
    diagram.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.8335);
    const state = diagram.getState();
    now = 1;
    diagram.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.667);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.8335);

    now = 11.1;
    diagram.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.8002);

    now = 11.5;
    diagram.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.667);
  });
  test('Pulse', () => {
    elem1.setScale(1);
    elem1.animations.new()
      .pulse({ scale: 2, duration: 2 })
      .start();
    now = 0;
    diagram.draw(now);
    now = 0.5;
    diagram.draw(now);
    expect(math.round(elem1.lastDrawPulseTransform.s().x)).toEqual(1.70711);
    const state = diagram.getState();
    now = 1;
    diagram.draw(now);
    expect(math.round(elem1.lastDrawPulseTransform.s().x)).toEqual(2);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(math.round(elem1.lastDrawPulseTransform.s().x)).toEqual(1.70711);

    now = 11.1;
    diagram.draw(now);
    expect(math.round(elem1.lastDrawPulseTransform.s().x)).toEqual(1.80902);

    now = 11.5;
    diagram.draw(now);
    expect(math.round(elem1.lastDrawPulseTransform.s().x)).toEqual(2);
  });
  test('Custom', () => {
    let percentComplete;
    const custom = (p) => { percentComplete = p; };
    diagram.fnMap.add('customFunction', custom);
    elem1.animations.new()
      .custom({ duration: 2, callback: 'customFunction' })
      .start();
    now = 0;
    diagram.draw(now);
    now = 0.5;
    diagram.draw(now);
    expect(percentComplete).toBe(0.25);
    const state = diagram.getState();
    now = 1;
    diagram.draw(now);
    expect(percentComplete).toBe(0.5);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(percentComplete).toBe(0.25);

    now = 11.1;
    diagram.draw(now);
    expect(math.round(percentComplete)).toBe(0.3);

    now = 11.5;
    diagram.draw(now);
    expect(percentComplete).toBe(0.5);
  });
});
