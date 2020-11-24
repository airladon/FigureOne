// import { Point, Transform } from '../../../../tools/g2';
// import { round } from '../../../../tools/math';
// import * as tools from '../../../../tools/tools';
import makeFigure from '../../../../__mocks__/makeFigure';
// import timeStep from '../../../../__mocks__/timeStep';

jest.useFakeTimers();
// tools.isTouchDevice = jest.fn();

describe('Figure Recorder', () => {
  let figure;
  let a;
  let start;
  let target;
  beforeEach(() => {
    figure = makeFigure();
    figure.add([
      {
        name: 'a',
        method: 'polygon',
        options: {
          color: [1, 0, 0, 1],
        },
      },
    ]);
    figure.initialize();
    a = figure.getElement('a');
    start = a.transform._dup();
    start.updateScale(1);
    target = a.transform._dup();
    target.updateScale(2);
  });
  test('Spread 1 to 1', () => {
    const step = a.anim.pulseTransform({ start, target, duration: 1 });
    const spread = step.spread([start], 1);
    expect(spread).toHaveLength(1);
    expect(spread[0].isEqualTo(start)).toBe(true);
  });
  test('Spread 1 to 2', () => {
    const step = a.anim.pulseTransform({ start, target, duration: 1 });
    const spread = step.spread([start], 2);
    expect(spread).toHaveLength(2);
    expect(spread[0].isEqualTo(start)).toBe(true);
    expect(spread[1].isEqualTo(start)).toBe(true);
  });
  test('Spread 1 to 3', () => {
    const step = a.anim.pulseTransform({ start, target, duration: 1 });
    const spread = step.spread([start], 3);
    expect(spread).toHaveLength(3);
    expect(spread[0].isEqualTo(start)).toBe(true);
    expect(spread[1].isEqualTo(start)).toBe(true);
    expect(spread[2].isEqualTo(start)).toBe(true);
  });
  test('Spread 2 to 3', () => {
    const step = a.anim.pulseTransform({ start, target, duration: 1 });
    const t1 = start._dup();
    const t2 = start._dup();
    t2.updateScale(10);
    const spread = step.spread([t1, t2], 3);
    expect(spread).toHaveLength(3);
    expect(spread[0].isEqualTo(t1)).toBe(true);
    expect(spread[1].isEqualTo(t1)).toBe(true);
    expect(spread[2].isEqualTo(t2)).toBe(true);
  });
  test('Spread 2 to 4', () => {
    const step = a.anim.pulseTransform({ start, target, duration: 1 });
    const t1 = start._dup();
    const t2 = start._dup();
    t2.updateScale(10);
    const spread = step.spread([t1, t2], 4);
    expect(spread).toHaveLength(4);
    expect(spread[0].isEqualTo(t1)).toBe(true);
    expect(spread[1].isEqualTo(t1)).toBe(true);
    expect(spread[2].isEqualTo(t2)).toBe(true);
    expect(spread[2].isEqualTo(t2)).toBe(true);
  });
  test('Spread 3 to 4', () => {
    const step = a.anim.pulseTransform({ start, target, duration: 1 });
    const t1 = start._dup();
    const t2 = start._dup();
    t2.updateScale(10);
    const t3 = start._dup();
    t3.updateScale(15);
    const spread = step.spread([t1, t2, t3], 4);
    expect(spread).toHaveLength(4);
    expect(spread[0].isEqualTo(t1)).toBe(true);
    expect(spread[1].isEqualTo(t1)).toBe(true);
    expect(spread[2].isEqualTo(t2)).toBe(true);
    expect(spread[3].isEqualTo(t3)).toBe(true);

    // double check
    expect(spread[3].isEqualTo(t1)).toBe(false);
  });
  test('Spread 4 to 3', () => {
    const step = a.anim.pulseTransform({ start, target, duration: 1 });
    const t1 = start._dup();
    const t2 = start._dup();
    t2.updateScale(10);
    const t3 = start._dup();
    t3.updateScale(15);
    const t4 = start._dup();
    t4.updateScale(20);
    const spread = step.spread([t1, t2, t3, t4], 3);
    expect(spread).toHaveLength(3);
    expect(spread[0].isEqualTo(t1)).toBe(true);
    expect(spread[1].isEqualTo(t2)).toBe(true);
    expect(spread[2].isEqualTo(t4)).toBe(true);
  });
  test('Spread 4 to 2', () => {
    const step = a.anim.pulseTransform({ start, target, duration: 1 });
    const t1 = start._dup();
    const t2 = start._dup();
    t2.updateScale(10);
    const t3 = start._dup();
    t3.updateScale(15);
    const t4 = start._dup();
    t4.updateScale(20);
    const spread = step.spread([t1, t2, t3, t4], 2);
    expect(spread).toHaveLength(2);
    expect(spread[0].isEqualTo(t1)).toBe(true);
    expect(spread[1].isEqualTo(t4)).toBe(true);
  });
  test('Spread 4 to 1', () => {
    const step = a.anim.pulseTransform({ start, target, duration: 1 });
    const t1 = start._dup();
    const t2 = start._dup();
    t2.updateScale(10);
    const t3 = start._dup();
    t3.updateScale(15);
    const t4 = start._dup();
    t4.updateScale(20);
    const spread = step.spread([t1, t2, t3, t4], 1);
    expect(spread).toHaveLength(1);
    expect(spread[0].isEqualTo(t1)).toBe(true);
  });
  test('Spread 3 to 2', () => {
    const step = a.anim.pulseTransform({ start, target, duration: 1 });
    const t1 = start._dup();
    const t2 = start._dup();
    t2.updateScale(10);
    const t3 = start._dup();
    t3.updateScale(15);
    const spread = step.spread([t1, t2, t3], 2);
    expect(spread).toHaveLength(2);
    expect(spread[0].isEqualTo(t1)).toBe(true);
    expect(spread[1].isEqualTo(t3)).toBe(true);
  });
  test('Simple Pulse', () => {
    expect(a.frozenPulseTransforms.length).toBe(0);
    a.animations.new()
      .pulseTransforms({ start: [start], target: [target], duration: 1 })
      .start();
    figure.mock.timeStep(0);
    expect(a.frozenPulseTransforms[0].s().round(3).x).toEqual(1);
    expect(a.frozenPulseTransforms.length).toBe(1);
    figure.mock.timeStep(0.5);
    expect(a.frozenPulseTransforms[0].s().round(3).x).toEqual(1.5);
    expect(a.frozenPulseTransforms.length).toBe(1);
    figure.mock.timeStep(1);
    expect(a.frozenPulseTransforms[0].s().round(3).x).toEqual(2);
    expect(a.frozenPulseTransforms.length).toBe(1);
  });
  test('Simple Pulse with velocity', () => {
    expect(a.frozenPulseTransforms.length).toBe(0);
    a.animations.new()
      .pulseTransforms({ start: [start], target: [target], velocity: { scale: 0.5 } })
      .start();
    figure.mock.timeStep(0);
    expect(a.frozenPulseTransforms[0].s().round(3).x).toEqual(1);
    expect(a.frozenPulseTransforms.length).toBe(1);
    figure.mock.timeStep(1);
    expect(a.frozenPulseTransforms[0].s().round(3).x).toEqual(1.5);
    expect(a.frozenPulseTransforms.length).toBe(1);
    figure.mock.timeStep(2);
    expect(a.frozenPulseTransforms[0].s().round(3).x).toEqual(2);
    expect(a.frozenPulseTransforms.length).toBe(1);
  });
  test('1 to 3', () => {
    // const s1 = a.transform._dup();
    const t1 = a.transform._dup().updateScale(0.5);
    const t2 = a.transform._dup().updateScale(1);
    const t3 = a.transform._dup().updateScale(2);
    a.animations.new()
      .pulseTransforms({ start: [start], target: [t1, t2, t3], duration: 1 })
      .start();
    figure.mock.timeStep(0);
    expect(a.frozenPulseTransforms.length).toBe(3);
    expect(a.frozenPulseTransforms[0].s().round(3).x).toEqual(1);
    expect(a.frozenPulseTransforms[1].s().round(3).x).toEqual(1);
    expect(a.frozenPulseTransforms[2].s().round(3).x).toEqual(1);
    figure.mock.timeStep(0.5);
    expect(a.frozenPulseTransforms[0].s().round(3).x).toEqual(0.75);
    expect(a.frozenPulseTransforms[1].s().round(3).x).toEqual(1);
    expect(a.frozenPulseTransforms[2].s().round(3).x).toEqual(1.5);
    figure.mock.timeStep(1);
    expect(a.frozenPulseTransforms[0].s().round(3).x).toEqual(0.5);
    expect(a.frozenPulseTransforms[1].s().round(3).x).toEqual(1);
    expect(a.frozenPulseTransforms[2].s().round(3).x).toEqual(2);
  });
  test('3 to 1', () => {
    const t1 = a.transform._dup();
    const s1 = a.transform._dup().updateScale(0.5);
    const s2 = a.transform._dup().updateScale(1);
    const s3 = a.transform._dup().updateScale(2);
    a.animations.new()
      .pulseTransforms({ start: [s1, s2, s3], target: [t1], duration: 1 })
      .start();
    figure.mock.timeStep(0);
    expect(a.frozenPulseTransforms.length).toBe(3);
    expect(a.frozenPulseTransforms[0].s().round(3).x).toEqual(0.5);
    expect(a.frozenPulseTransforms[1].s().round(3).x).toEqual(1);
    expect(a.frozenPulseTransforms[2].s().round(3).x).toEqual(2);
    figure.mock.timeStep(0.5);
    expect(a.frozenPulseTransforms[0].s().round(3).x).toEqual(0.75);
    expect(a.frozenPulseTransforms[1].s().round(3).x).toEqual(1);
    expect(a.frozenPulseTransforms[2].s().round(3).x).toEqual(1.5);
    figure.mock.timeStep(1);
    expect(a.frozenPulseTransforms[0].s().round(3).x).toEqual(1);
    expect(a.frozenPulseTransforms[1].s().round(3).x).toEqual(1);
    expect(a.frozenPulseTransforms[2].s().round(3).x).toEqual(1);
  });
});
