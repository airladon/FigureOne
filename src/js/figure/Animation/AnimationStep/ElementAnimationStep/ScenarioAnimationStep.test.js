import { Point, Transform } from '../../../../tools/g2';
import { round } from '../../../../tools/math';
// import * as tools from '../../../../tools/tools';
import makeFigure from '../../../../__mocks__/makeFigure';
// import timeStep from '../../../../__mocks__/timeStep';

jest.useFakeTimers();
// tools.isTouchDevice = jest.fn();

describe('Figure Recorder', () => {
  let figure;
  let a;
  beforeEach(() => {
    figure = makeFigure();
    figure.add([
      {
        name: 'a',
        make: 'polygon',
        options: {
          color: [1, 0, 0, 1],
        },
      },
    ]);
    figure.initialize();
    a = figure.getElement('a');
  });
  test('Simple Position', () => {
    a.animations.new()
      .scenario({ target: { position: [1, 1] }, duration: 1 })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    figure.mock.timeStep(0.5);
    expect(a.getPosition().round(3)).toEqual(new Point(0.5, 0.5));
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
  });
  test('Transform', () => {
    a.animations.new()
      .scenario({
        target: {
          transform: new Transform().scale(2, 2).rotate(1).translate(1, 1),
        },
        duration: 1,
      })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    expect(a.getScale().round(3).round(3)).toEqual(new Point(1, 1, 1));
    expect(round(round(a.getRotation(), 3), 3)).toBe(0);
    figure.mock.timeStep(0.5);
    expect(a.getPosition().round(3)).toEqual(new Point(0.5, 0.5));
    expect(a.getScale().round(3).round(3)).toEqual(new Point(1.5, 1.5, 1));
    expect(round(round(a.getRotation(), 3), 3)).toBe(0.5);
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    expect(a.getScale().round(3).round(3)).toEqual(new Point(2, 2, 1));
    expect(round(round(a.getRotation(), 3), 3)).toBe(1);
  });
  test('Position, Rotation, Scale, Color, isShown', () => {
    a.animations.new()
      .scenario({
        target: {
          position: [1, 1],
          isShown: false,
          rotation: 1,
          scale: 2,
          color: [0, 1, 0, 1],
        },
        duration: 1,
      })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    expect(a.getScale().round(3)).toEqual(new Point(1, 1, 1));
    expect(round(a.getRotation(), 3)).toBe(0);
    expect(a.opacity).toBe(1);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([1, 0, 0, 1]);
    figure.mock.timeStep(0.5);
    expect(a.getPosition().round(3)).toEqual(new Point(0.5, 0.5));
    expect(a.getScale().round(3)).toEqual(new Point(1.5, 1.5, 1.5));
    expect(round(a.getRotation(), 3)).toBe(0.5);
    expect(a.opacity).toBe(0.5005);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([0.5, 0.5, 0, 1]);
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    expect(a.getScale().round(3)).toEqual(new Point(2, 2, 2));
    expect(round(a.getRotation(), 3)).toBe(1);
    expect(a.opacity).toBe(1);
    expect(a.isShown).toBe(false);
    expect(a.color).toEqual([0, 1, 0, 1]);
    expect(figure.isAnimating()).toBe(false);
  });
  test('Position, Rotation, Scale, Color, isShown with Start', () => {
    a.animations.new()
      .scenario({
        start: {
          position: [2, 2],
          isShown: false,
          rotation: 2,
          scale: 3,
          color: [0, 0, 1, 0.5],
        },
        target: {
          position: [1, 1],
          isShown: true,
          rotation: 1,
          scale: 2,
          color: [0, 1, 0, 1],
        },
        duration: 1,
      })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(2, 2));
    expect(a.getScale().round(3)).toEqual(new Point(3, 3, 3));
    expect(round(a.getRotation(), 3)).toBe(2);
    expect(a.opacity).toBe(0.001);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([0, 0, 1, 0.5]);
    figure.mock.timeStep(0.5);
    expect(a.getPosition().round(3)).toEqual(new Point(1.5, 1.5));
    expect(a.getScale().round(3)).toEqual(new Point(2.5, 2.5, 2.5));
    expect(round(a.getRotation(), 3)).toBe(1.5);
    expect(a.opacity).toBe(0.5005);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([0, 0.5, 0.5, 0.75]);
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    expect(a.getScale().round(3)).toEqual(new Point(2, 2, 2));
    expect(round(a.getRotation(), 3)).toBe(1);
    expect(a.opacity).toBe(1);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([0, 1, 0, 1]);
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity Position', () => {
    a.animations.new()
      .scenario({ target: { position: [1, 1] }, velocity: { translation: 0.5 } })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(0.5, 0.5));
    figure.mock.timeStep(2);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity Rotation', () => {
    a.animations.new()
      .scenario({ target: { rotation: 1 }, velocity: { rotation: 0.5 } })
      .start();
    figure.mock.timeStep(0);
    expect(round(a.getRotation(), 3)).toEqual(0);
    figure.mock.timeStep(1);
    expect(round(a.getRotation(), 3)).toEqual(0.5);
    figure.mock.timeStep(2);
    expect(round(a.getRotation(), 3)).toEqual(1);
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity Scale', () => {
    a.animations.new()
      .scenario({ target: { scale: [2, 2] }, velocity: { scale: 0.5 } })
      .start();
    figure.mock.timeStep(0);
    expect(a.getScale().round(3)).toEqual(new Point(1, 1, 1));
    figure.mock.timeStep(1);
    expect(a.getScale().round(3)).toEqual(new Point(1.5, 1.5, 1));
    figure.mock.timeStep(2);
    expect(a.getScale().round(3)).toEqual(new Point(2, 2, 1));
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity Transform', () => {
    a.animations.new()
      .scenario({
        target: {
          transform: new Transform().scale(2, 2).rotate(1).translate(1, 1),
        },
        velocity: {
          transform: new Transform().scale(0.5, 0.5).rotate(0.5).translate(0.5, 0.5),
        },
      })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    expect(a.getScale().round(3)).toEqual(new Point(1, 1, 1));
    expect(round(a.getRotation(), 3)).toBe(0);
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(0.5, 0.5));
    expect(a.getScale().round(3)).toEqual(new Point(1.5, 1.5, 1));
    expect(round(a.getRotation(), 3)).toBe(0.5);
    figure.mock.timeStep(2);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    expect(a.getScale().round(3)).toEqual(new Point(2, 2, 1));
    expect(round(a.getRotation(), 3)).toBe(1);
  });
  test('Velocity Color', () => {
    a.animations.new()
      .scenario({ target: { color: [0, 1, 0, 1] }, velocity: { color: 0.5 } })
      .start();
    figure.mock.timeStep(0);
    expect(a.color).toEqual([1, 0, 0, 1]);
    figure.mock.timeStep(1);
    expect(a.color).toEqual([0.5, 0.5, 0, 1]);
    figure.mock.timeStep(2);
    expect(a.color).toEqual([0, 1, 0, 1]);
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity Opacity Show', () => {
    a.hide();
    expect(a.opacity).toEqual(1);
    expect(a.isShown).toBe(false);
    a.animations.new()
      .scenario({ target: { isShown: true }, velocity: { opacity: 0.5 } })
      .start();
    figure.mock.timeStep(0);
    expect(a.opacity).toEqual(0.001);
    expect(a.isShown).toBe(true);
    figure.mock.timeStep(1);
    expect(a.opacity).toEqual(0.5005);
    expect(a.isShown).toBe(true);
    figure.mock.timeStep(2);
    expect(a.opacity).toEqual(1);
    expect(a.isShown).toBe(true);
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity opacity hide', () => {
    a.animations.new()
      .scenario({ target: { isShown: false }, velocity: { opacity: 0.5 } })
      .start();
    figure.mock.timeStep(0);
    expect(a.opacity).toEqual(1);
    expect(a.isShown).toBe(true);
    figure.mock.timeStep(1);
    expect(a.opacity).toEqual(0.5005);
    expect(a.isShown).toBe(true);
    figure.mock.timeStep(2);
    expect(a.opacity).toEqual(1);
    expect(a.isShown).toBe(false);
    expect(figure.isAnimating()).toBe(false);
  });
  test('Mid dissolve out', () => {
    a.setOpacity(0.2);
    a.animations.new()
      .scenario({ target: { isShown: false }, velocity: { opacity: 0.1 } })
      .start();
    figure.mock.timeStep(0);
    expect(a.opacity).toEqual(0.2);
    expect(a.isShown).toBe(true);
    figure.mock.timeStep(1);
    expect(a.opacity).toEqual(0.1005);
    expect(a.isShown).toBe(true);
    figure.mock.timeStep(2);
    expect(a.opacity).toEqual(1);
    expect(a.isShown).toBe(false);
    expect(figure.isAnimating()).toBe(false);
  });
  test('Mid dissolve in', () => {
    a.setOpacity(0.8);
    a.animations.new()
      .scenario({ target: { isShown: true }, velocity: { opacity: 0.1 } })
      .start();
    figure.mock.timeStep(0);
    expect(a.opacity).toEqual(0.8);
    figure.mock.timeStep(1);
    expect(a.opacity).toEqual(0.9);
    figure.mock.timeStep(2);
    expect(a.opacity).toEqual(1);
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity all same duration', () => {
    a.animations.new()
      .scenario({
        target: {
          isShown: false,
          color: [0, 1, 0, 1],
          position: [1, 1],
          scale: 2,
          rotation: 1,
        },
        velocity: {
          position: 0.1,
          scale: 0.2,
          rotation: 0.3,
          color: 0.4,
          opacity: 0.5,
        },
        allDurationsSame: true,
      })
      .start();

    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    expect(a.getScale().round(3)).toEqual(new Point(1, 1, 1));
    expect(round(a.getRotation(), 3)).toBe(0);
    expect(a.opacity).toBe(1);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([1, 0, 0, 1]);
    figure.mock.timeStep(5);
    expect(a.getPosition().round(3)).toEqual(new Point(0.5, 0.5));
    expect(a.getScale().round(3)).toEqual(new Point(1.5, 1.5, 1.5));
    expect(round(a.getRotation(), 3)).toBe(0.5);
    expect(a.opacity).toBe(0.5005);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([0.5, 0.5, 0, 1]);
    figure.mock.timeStep(10);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    expect(a.getScale().round(3)).toEqual(new Point(2, 2, 2));
    expect(round(a.getRotation(), 3)).toBe(1);
    expect(a.opacity).toBe(1);
    expect(a.isShown).toBe(false);
    expect(a.color).toEqual([0, 1, 0, 1]);
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity different durations', () => {
    a.animations.new()
      .scenario({
        target: {
          isShown: false,
          color: [0, 1, 0, 1],
          position: [1, 1],
          scale: 2,
          rotation: 1,
        },
        velocity: {
          position: 0.1,
          scale: 0.2,
          rotation: 0.3,
          color: 0.4,
          opacity: 0.5,
        },
        allDurationsSame: false,
        progression: 'linear',
      })
      .start();
    // Note, all transform velocities (position, scale, rotation)
    // will be the same as the slowest one
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    expect(a.getScale().round(3)).toEqual(new Point(1, 1, 1));
    expect(round(a.getRotation(), 3)).toBe(0);
    expect(a.opacity).toBe(1);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([1, 0, 0, 1]);
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(0.1, 0.1));
    expect(a.getScale().round(3)).toEqual(new Point(1.1, 1.1, 1.1));
    expect(round(a.getRotation(), 3)).toBe(0.1);
    expect(a.opacity).toBe(0.5005);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([0.6, 0.4, 0, 1]);
    figure.mock.timeStep(10);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    expect(a.getScale().round(3)).toEqual(new Point(2, 2, 2));
    expect(round(a.getRotation(), 3)).toBe(1);
    expect(a.opacity).toBe(1);
    expect(a.isShown).toBe(false);
    expect(a.color).toEqual([0, 1, 0, 1]);
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity zero threshold - just above', () => {
    a.animations.new()
      .scenario({
        target: { position: [1, 1] },
        velocity: { translation: 9 },
        zeroDurationThreshold: 0.1,
      })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    figure.mock.timeStep(0.1);
    expect(a.getPosition().round(2)).toEqual(new Point(0.99, 0.99));
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity zero threshold - on', () => {
    a.animations.new()
      .scenario({
        target: { position: [1, 1] },
        velocity: { translation: 10 },
        zeroDurationThreshold: 0.1,
      })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity zero threshold - just below', () => {
    a.animations.new()
      .scenario({
        target: { position: [1, 1] },
        velocity: { translation: 11 },
        zeroDurationThreshold: 0.1,
      })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity maxDuration', () => {
    a.animations.new()
      .scenario({
        target: { position: [1, 1] },
        velocity: { translation: 0.1 },
        maxDuration: 2,
      })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(0.5, 0.5));
    figure.mock.timeStep(2);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity minDuration', () => {
    a.animations.new()
      .scenario({
        target: { position: [1, 1] },
        velocity: { translation: 10 },
        duration: 1,
      })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    figure.mock.timeStep(0.5);
    expect(a.getPosition().round(3)).toEqual(new Point(0.5, 0.5));
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    expect(figure.isAnimating()).toBe(false);
  });
  test('No Change', () => {
    a.animations.new()
      .scenario({ target: { position: [0, 0] }, duration: 1 })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    expect(figure.isAnimating()).toBe(true);
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    expect(figure.isAnimating()).toBe(false);
  });
  test('Velocity No Change', () => {
    a.animations.new()
      .scenario({ target: { position: [0, 0] }, velocity: { position: 1 } })
      .start();
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    expect(figure.isAnimating()).toBe(false);
  });
  test('Element anim', () => {
    figure.elements.animations.new()
      .then(a.animations.scenario({ target: { position: [1, 1] }, duration: 1 }))
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    figure.mock.timeStep(0.5);
    expect(a.getPosition().round(3)).toEqual(new Point(0.5, 0.5));
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
  });
  test('Scenario Name', () => {
    a.scenarios.s1 = { position: [1, 1] };
    a.animations.new()
      .scenario({ target: 's1', duration: 1 })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
    figure.mock.timeStep(0.5);
    expect(a.getPosition().round(3)).toEqual(new Point(0.5, 0.5));
    figure.mock.timeStep(1);
    expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
  });
});
