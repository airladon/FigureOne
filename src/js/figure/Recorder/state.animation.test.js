import * as tools from '../../tools/tools';
import { Transform } from '../../tools/g2';
import makeFigure from '../../__mocks__/makeFigure';
import * as math from '../../tools/math';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

describe('Animation Step State', () => {
  let elem1;
  let figure;
  let now;
  beforeEach(() => {
    jest.useFakeTimers();
    figure = makeFigure();
    elem1 = figure.primitives.polygon();
    figure.elements.add('elem1', elem1);
    global.performance.now = () => now * 1000;
  });
  test('Rotation', () => {
    elem1.setRotation(0);
    elem1.animations.new()
      .rotation({ target: 3, duration: 3, progression: 'linear' })
      .start();

    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(math.round(elem1.getRotation(), 3)).toBe(0.5);
    const state = figure.getState();
    now = 1;
    figure.draw(now);
    expect(elem1.getRotation()).toBe(1);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.5);

    now = 11.1;
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.6);

    now = 11.5;
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(1);
  });
  test('Position', () => {
    elem1.animations.new()
      .position({ target: [3, 0], duration: 3, progression: 'linear' })
      .start();
    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(elem1.getPosition().x).toBe(0.5);
    const state = figure.getState();
    now = 1;
    figure.draw(now);
    expect(elem1.getPosition().x).toBe(1);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(0.5);

    now = 11.1;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(0.6);

    now = 11.5;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
  });
  test('Scale', () => {
    elem1.setScale(0);
    elem1.animations.new()
      .scale({ target: [3, 0], duration: 3, progression: 'linear' })
      .start();
    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(math.round(elem1.getScale().x, 3)).toBe(0.5);
    const state = figure.getState();
    now = 1;
    figure.draw(now);
    expect(elem1.getScale().x).toBe(1);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.getScale().x)).toBe(0.5);

    now = 11.1;
    figure.draw(now);
    expect(math.round(elem1.getScale().x)).toBe(0.6);

    now = 11.5;
    figure.draw(now);
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
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(elem1.getScale().x).toBe(0.5);
    expect(elem1.getPosition().x).toBe(0.5);
    expect(elem1.getRotation()).toBe(0.5);
    const state = figure.getState();
    now = 1;
    figure.draw(now);
    expect(elem1.getScale().x).toBe(1);
    expect(elem1.getPosition().x).toBe(1);
    expect(elem1.getRotation()).toBe(1);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.getScale().x)).toBe(0.5);
    expect(math.round(elem1.getPosition().x)).toBe(0.5);
    expect(math.round(elem1.getRotation())).toBe(0.5);

    now = 11.1;
    figure.draw(now);
    expect(math.round(elem1.getScale().x)).toBe(0.6);
    expect(math.round(elem1.getPosition().x)).toBe(0.6);
    expect(math.round(elem1.getRotation())).toBe(0.6);

    now = 11.5;
    figure.draw(now);
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
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.35);
    const state = figure.getState();
    now = 1;
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.4);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.35);

    now = 11.1;
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.36);

    now = 11.5;
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.4);
  });
  test('Dim Color', () => {
    elem1.color = [0.3, 1, 1, 1];
    elem1.dimColor = [0.6, 1, 1, 1];
    elem1.animations.new()
      .dim(3)
      .start();
    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.35);
    const state = figure.getState();
    now = 1;
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.4);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.35);

    now = 11.1;
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.36);

    now = 11.5;
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.4);
  });
  test('Undim Color', () => {
    elem1.defaultColor = [0.6, 1, 1, 1];
    elem1.color = [0.3, 1, 1, 1];
    elem1.animations.new()
      .undim(3)
      .start();
    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.35);
    const state = figure.getState();
    now = 1;
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.4);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.35);

    now = 11.1;
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.36);

    now = 11.5;
    figure.draw(now);
    expect(math.round(elem1.color[0])).toBe(0.4);
  });
  test('Dissolve In', () => {
    elem1.animations.new()
      .dissolveIn(3)
      .start();
    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.1675);
    const state = figure.getState();
    now = 1;
    figure.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.334);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.1675);

    now = 11.1;
    figure.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.2008);

    now = 11.5;
    figure.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.334);
  });
  test('Dissolve Out', () => {
    elem1.animations.new()
      .dissolveOut(3)
      .start();
    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.8335);
    const state = figure.getState();
    now = 1;
    figure.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.667);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.8335);

    now = 11.1;
    figure.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.8002);

    now = 11.5;
    figure.draw(now);
    expect(math.round(elem1.opacity)).toBe(0.667);
  });
  test('Pulse', () => {
    elem1.setScale(1);
    // now = 0;
    figure.mock.timeStep(0);
    elem1.animations.new()
      .pulse({ scale: 2, duration: 2 })
      .start();
    figure.mock.timeStep(0);
    // figure.mock.timeStep(0.1);
    // figure.mock.timeStep(0.1);
    // figure.mock.timeStep(0.1);
    // figure.mock.timeStep(0.1);
    // figure.mock.timeStep(0.1);
    // now = 0.5;
    figure.mock.timeStep(0.5);
    // console.log(elem1.state.isPulsing)
    // console.log(elem1.animations.animations[0].steps)
    expect(math.round(elem1.lastDrawPulseTransform.s().x)).toEqual(1.5);
    const state = figure.getState();
    // now = 1;
    figure.mock.timeStep(0.5);
    expect(math.round(elem1.lastDrawPulseTransform.s().x)).toEqual(2);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    figure.mock.timeStep(10);
    figure.setState(state);
    // figure.draw(now);
    // debugger;
    figure.mock.timeStep(0);
    expect(math.round(elem1.lastDrawPulseTransform.s().x)).toEqual(1.5);

    // now = 11.1;
    figure.mock.timeStep(0.1);
    // figure.draw(now);
    expect(math.round(elem1.lastDrawPulseTransform.s().x)).toEqual(1.65451);

    // now = 11.5;
    figure.mock.timeStep(0.4);
    // figure.draw(now);
    expect(math.round(elem1.lastDrawPulseTransform.s().x)).toEqual(2);
  });
  test('Custom', () => {
    let percentComplete;
    const custom = (p) => { percentComplete = p; };
    elem1.fnMap.add('customFunction', custom);
    elem1.animations.new()
      .custom({ duration: 2, callback: 'customFunction' })
      .start();
    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(percentComplete).toBe(0.25);
    const state = figure.getState();
    now = 1;
    figure.draw(now);
    expect(percentComplete).toBe(0.5);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    figure.setState(state);
    figure.draw(now);
    expect(percentComplete).toBe(0.25);

    now = 11.1;
    figure.draw(now);
    expect(math.round(percentComplete)).toBe(0.3);

    now = 11.5;
    figure.draw(now);
    expect(percentComplete).toBe(0.5);
  });
  test('Delay', () => {
    elem1.animations.new()
      .position({ target: [1, 0], duration: 1 })
      .delay(1)
      .position({ target: [2, 0], duration: 1 })
      .start();
    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(elem1.getPosition().round().x).toBe(0.5);
    now = 1;
    figure.draw(now);
    expect(elem1.getPosition().round().x).toBe(1);
    now = 1.5;
    figure.draw(now);
    expect(elem1.getPosition().round().x).toBe(1);
    const state = figure.getState();
    now = 2;
    figure.draw(now);
    expect(elem1.getPosition().round().x).toBe(1);
    now = 2.5;
    figure.draw(now);
    expect(elem1.getPosition().round().x).toBe(1.5);

    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11.5;
    figure.setState(state);
    figure.draw(now);
    expect(elem1.getPosition().round().x).toBe(1);

    now = 12;
    figure.draw(now);
    expect(elem1.getPosition().round().x).toBe(1);

    now = 12.5;
    figure.draw(now);
    expect(elem1.getPosition().round().x).toBe(1.5);
  });
  test('Parallel', () => {
    elem1.setPosition(0, 0);
    elem1.setRotation(0);
    elem1.animations.new()
      .inParallel([
        elem1.anim.position({ target: [2, 0], duration: 2, progression: 'linear' }),
        elem1.anim.rotation({ target: 2, duration: 2, progression: 'linear' }),
      ])
      .start();

    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(0.5);
    expect(math.round(elem1.getRotation())).toBe(0.5);
    const state = figure.getState();
    now = 1;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(1);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(0.5);
    expect(math.round(elem1.getRotation())).toBe(0.5);

    now = 11.1;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(0.6);
    expect(math.round(elem1.getRotation())).toBe(0.6);

    now = 11.5;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(1);
  });
  test('Serial', () => {
    elem1.setPosition(0, 0);
    elem1.setRotation(0);
    elem1.animations.new()
      .inSerial([
        elem1.anim.position({ target: [1, 0], duration: 1, progression: 'linear' }),
        elem1.anim.rotation({ target: 1, duration: 1, progression: 'linear' }),
      ])
      .start();

    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(0.5);
    expect(math.round(elem1.getRotation())).toBe(0);

    now = 1.1;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(0.1);
    const state = figure.getState();

    now = 1.9;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(0.9);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11.9;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(0.1);

    now = 12;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(0.2);

    now = 12.8;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(1);
  });
  test('Builder', () => {
    elem1.setPosition(0, 0);
    elem1.setRotation(0);
    elem1.animations.new()
      .position({ target: [1, 0], duration: 1, progression: 'linear' })
      .rotation({ target: 1, duration: 1, progression: 'linear' })
      .start();

    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(0.5);
    expect(math.round(elem1.getRotation())).toBe(0);

    now = 1.1;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(0.1);
    const state = figure.getState();

    now = 1.9;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(0.9);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);

    // now lets delay 10s
    now = 11.9;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(0.1);

    now = 12;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(0.2);

    now = 12.8;
    figure.draw(now);
    expect(math.round(elem1.getPosition().x)).toBe(1);
    expect(math.round(elem1.getRotation())).toBe(1);
  });
  test('Trigger', () => {
    elem1.triggerFlag1 = 0;
    elem1.triggerFlag2 = 0;
    elem1.triggerFlag3 = 0;
    elem1.triggerFlag4 = 0;
    const trigger1 = () => { elem1.triggerFlag1 = 1; };
    const trigger2 = () => { elem1.triggerFlag2 = 1; };
    const trigger3 = () => { elem1.triggerFlag3 = 1; };
    const trigger4 = () => { elem1.triggerFlag4 = 1; };
    elem1.fnMap.add('trigger1', trigger1);
    elem1.fnMap.add('trigger2', trigger2);
    elem1.fnMap.add('trigger3', trigger3);
    elem1.fnMap.add('trigger4', trigger4);
    elem1.stateProperties = [
      'triggerFlag1', 'triggerFlag2', 'triggerFlag3', 'triggerFlag4',
    ];
    elem1.animations.new()
      .delay(1)
      .trigger('trigger1')
      .delay(1)
      .trigger({ callback: 'trigger2', duration: 1 })
      .trigger('trigger3')
      .delay(1)
      .trigger('trigger4')
      .start();

    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(elem1.triggerFlag1).toBe(0);
    expect(elem1.triggerFlag2).toBe(0);
    expect(elem1.triggerFlag3).toBe(0);
    expect(elem1.triggerFlag4).toBe(0);

    now = 1;
    figure.draw(now);
    expect(elem1.triggerFlag1).toBe(1);
    expect(elem1.triggerFlag2).toBe(0);
    expect(elem1.triggerFlag3).toBe(0);
    expect(elem1.triggerFlag4).toBe(0);

    now = 2.1;
    figure.draw(now);
    expect(elem1.triggerFlag1).toBe(1);
    expect(elem1.triggerFlag2).toBe(1);
    expect(elem1.triggerFlag3).toBe(0);
    expect(elem1.triggerFlag4).toBe(0);
    const state = figure.getState();

    now = 3;
    figure.draw(now);
    expect(elem1.triggerFlag1).toBe(1);
    expect(elem1.triggerFlag2).toBe(1);
    expect(elem1.triggerFlag3).toBe(1);
    expect(elem1.triggerFlag4).toBe(0);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);
    elem1.triggerFlag1 = 0;
    elem1.triggerFlag2 = 0;
    elem1.triggerFlag3 = 0;
    elem1.triggerFlag4 = 0;

    // now lets delay 10s
    now = 13;
    figure.setState(state);
    figure.draw(now);

    expect(elem1.triggerFlag1).toBe(1);
    expect(elem1.triggerFlag2).toBe(1);
    expect(elem1.triggerFlag3).toBe(0);
    expect(elem1.triggerFlag4).toBe(0);

    now = 13.8;
    figure.draw(now);
    expect(elem1.triggerFlag1).toBe(1);
    expect(elem1.triggerFlag2).toBe(1);
    expect(elem1.triggerFlag3).toBe(0);
    expect(elem1.triggerFlag4).toBe(0);

    now = 13.9;
    figure.draw(now);
    expect(elem1.triggerFlag1).toBe(1);
    expect(elem1.triggerFlag2).toBe(1);
    expect(elem1.triggerFlag3).toBe(1);
    expect(elem1.triggerFlag4).toBe(0);

    now = 14.9;
    figure.draw(now);
    expect(elem1.triggerFlag1).toBe(1);
    expect(elem1.triggerFlag2).toBe(1);
    expect(elem1.triggerFlag3).toBe(1);
    expect(elem1.triggerFlag4).toBe(1);
  });
  test('When Finished', () => {
    elem1.setRotation(0);
    const callback = jest.fn(() => {});
    elem1.fnMap.add('callback', callback);
    elem1.animations.new()
      .rotation({ target: 1, duration: 1, progression: 'linear' })
      .whenFinished('callback')
      .start();

    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.5);
    expect(callback.mock.calls.length).toBe(0);
    const state = figure.getState();

    now = 0.6;
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.6);
    expect(callback.mock.calls.length).toBe(0);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);
    expect(callback.mock.calls.length).toBe(1);

    // now lets delay 10s
    now = 10.6;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.5);
    expect(callback.mock.calls.length).toBe(1);

    now = 11;
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.9);
    expect(callback.mock.calls.length).toBe(1);

    now = 11.1;
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(1);
    expect(callback.mock.calls.length).toBe(2);
  });
  test('onFinish in step', () => {
    elem1.setRotation(0);
    const callback = jest.fn(() => {});
    elem1.fnMap.add('callback', callback);
    elem1.animations.new()
      .rotation({
        target: 1, duration: 1, progression: 'linear', onFinish: 'callback',
      })
      .rotation({ target: 2, duration: 1, progression: 'linear' })
      .start();

    now = 0;
    figure.draw(now);
    now = 0.5;
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.5);
    expect(callback.mock.calls.length).toBe(0);
    const state = figure.getState();

    now = 0.6;
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.6);
    expect(callback.mock.calls.length).toBe(0);

    now = 1.2;
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(1.2);
    expect(callback.mock.calls.length).toBe(1);

    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);
    expect(callback.mock.calls.length).toBe(1);

    // now lets delay 10s
    now = 11.2;
    figure.setState(state);
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.5);
    expect(callback.mock.calls.length).toBe(1);

    now = 11.3;
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.6);
    expect(callback.mock.calls.length).toBe(1);

    now = 11.7;
    figure.draw(now);
    expect(math.round(elem1.getRotation())).toBe(1);
    expect(callback.mock.calls.length).toBe(2);
  });
});
